"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Director de animaciones del sitio público (GSAP + ScrollTrigger).
 *
 * Vocabulario por atributo (los server components solo marcan, no se
 * convierten a client):
 *   data-anim="hero"       → timeline de entrada del hero de portada
 *   data-anim="cabecera"   → hijos directos entran en cascada al cargar
 *   data-anim="carga"      → el elemento entra al cargar (cascada global)
 *   data-anim="grupo"      → hijos directos entran en cascada al scrollear
 *   data-anim="aparece"    → el elemento entra al scrollear
 *   data-anim="cronologia" → items de línea de tiempo entran desde la izquierda
 *
 * El estado oculto inicial lo setea GSAP por JS: sin JS, con
 * prefers-reduced-motion o si el import dinámico falla, todo se ve normal.
 */
function Director() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // La portada filtrada cambia contenido con el mismo pathname: la clave
  // incluye los params para re-armar los triggers en cada vista.
  const clave = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelado = false;
    let ctx: { revert: () => void } | null = null;
    let desarmarRefresh: (() => void) | null = null;

    (async () => {
      let gsapMod: typeof import("gsap");
      let stMod: typeof import("gsap/ScrollTrigger");
      try {
        [gsapMod, stMod] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
      } catch {
        // Sin GSAP no hay animación, pero el contenido ya es visible.
        return;
      }
      if (cancelado) return;

      const gsap = gsapMod.gsap;
      const ScrollTrigger = stMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      // Movimiento de la casa: glide suave, mismo ease que el hero, sin rebote.
      const EASE = "power3.out";
      const DUR = 0.55;
      const DIST = 30;

      ctx = gsap.context(() => {
        // === HERO de portada: el único momento coreografiado ===
        const hero = document.querySelector<HTMLElement>('[data-anim="hero"]');
        if (hero) {
          // Entrada coreografiada del hero — el único momento con licencia para
          // ir más allá del "movimiento de la casa". Capas encadenadas:
          //   1) el contenedor aterriza: sube + fade. La sombra offset viaja
          //      CON el bloque, siempre estática — NO se anima ni se limpia:
          //      animar boxShadow + clearProps la borraba del inline y, como el
          //      server component no re-renderiza, la sombra desaparecía.
          //   2) la foto se descubre con un wipe lateral (clip-path, no toca
          //      transform → el hover-zoom de la imagen queda intacto).
          //   3) el texto entra en cascada desde abajo.
          //   4) el sello "Nota destacada" pega el golpe corto (back.out).
          const caja = hero.querySelector<HTMLElement>(":scope article");
          const imagen = hero.querySelector<HTMLElement>(":scope article > a img");
          const sello = hero.querySelector<HTMLElement>(":scope article > a > div");
          const texto = hero.querySelectorAll<HTMLElement>(
            ":scope article > div:first-child > *",
          );
          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

          if (caja) {
            tl.fromTo(
              caja,
              { autoAlpha: 0, y: 44 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.75,
                clearProps: "transform",
              },
              0,
            );
          }
          if (imagen) {
            tl.fromTo(
              imagen,
              { clipPath: "inset(0 100% 0 0)" },
              {
                clipPath: "inset(0 0% 0 0)",
                duration: 0.85,
                clearProps: "clipPath",
              },
              0.2,
            );
          }
          if (texto.length) {
            tl.fromTo(
              texto,
              { autoAlpha: 0, y: 24 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.55,
                stagger: 0.07,
                clearProps: "transform",
              },
              0.32,
            );
          }
          if (sello) {
            tl.fromTo(
              sello,
              { scale: 0, transformOrigin: "bottom left" },
              { scale: 1, duration: 0.34, ease: "back.out(2.6)" },
              0.72,
            );
          }
        }

        // === Cabeceras: cascada de hijos al cargar ===
        document
          .querySelectorAll<HTMLElement>('[data-anim="cabecera"]')
          .forEach((cab) => {
            const hijos = Array.from(cab.children) as HTMLElement[];
            if (hijos.length === 0) return;
            gsap.fromTo(
              hijos,
              { autoAlpha: 0, y: DIST },
              {
                autoAlpha: 1,
                y: 0,
                duration: DUR,
                ease: EASE,
                stagger: 0.09,
                clearProps: "transform",
              },
            );
          });

        // === Carga: elementos sueltos above-the-fold, en orden de documento ===
        const deCarga = gsap.utils.toArray<HTMLElement>('[data-anim="carga"]');
        if (deCarga.length > 0) {
          gsap.fromTo(
            deCarga,
            { autoAlpha: 0, y: DIST },
            {
              autoAlpha: 1,
              y: 0,
              duration: DUR,
              ease: EASE,
              stagger: 0.09,
              clearProps: "transform",
            },
          );
        }

        // === Grupos: cascada de hijos al entrar al viewport ===
        document
          .querySelectorAll<HTMLElement>('[data-anim="grupo"]')
          .forEach((grupo) => {
            const items = Array.from(grupo.children) as HTMLElement[];
            if (items.length === 0) return;
            gsap.fromTo(
              items,
              { autoAlpha: 0, y: DIST },
              {
                autoAlpha: 1,
                y: 0,
                duration: DUR,
                ease: EASE,
                stagger: 0.085,
                clearProps: "transform",
                scrollTrigger: { trigger: grupo, start: "top 86%", once: true },
              },
            );
          });

        // === Aparece: bloque individual al entrar al viewport ===
        document
          .querySelectorAll<HTMLElement>('[data-anim="aparece"]')
          .forEach((el) => {
            gsap.fromTo(
              el,
              { autoAlpha: 0, y: DIST },
              {
                autoAlpha: 1,
                y: 0,
                duration: DUR,
                ease: EASE,
                clearProps: "transform",
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              },
            );
          });

        // === Overline: labels de sección entran deslizándose desde la izquierda ===
        document
          .querySelectorAll<HTMLElement>('[data-anim="overline"]')
          .forEach((el) => {
            gsap.fromTo(
              el,
              { autoAlpha: 0, x: -20 },
              {
                autoAlpha: 1,
                x: 0,
                duration: DUR,
                ease: EASE,
                clearProps: "transform",
                scrollTrigger: { trigger: el, start: "top 90%", once: true },
              },
            );
          });

        // === Cronología (hub de jugador): entra desde el eje ===
        document
          .querySelectorAll<HTMLElement>('[data-anim="cronologia"]')
          .forEach((lista) => {
            const items = Array.from(lista.children) as HTMLElement[];
            items.forEach((item) => {
              gsap.fromTo(
                item,
                { autoAlpha: 0, x: -18 },
                {
                  autoAlpha: 1,
                  x: 0,
                  duration: DUR,
                  ease: EASE,
                  clearProps: "transform",
                  scrollTrigger: { trigger: item, start: "top 90%", once: true },
                },
              );
            });
          });
      });

      // Imágenes y fuentes tardías corren las posiciones: re-medir al estar
      // todo cargado para que los triggers "once" no disparen desfasados.
      const refrescar = () => ScrollTrigger.refresh();
      if (document.readyState === "complete") {
        refrescar();
      } else {
        window.addEventListener("load", refrescar, { once: true });
        desarmarRefresh = () => window.removeEventListener("load", refrescar);
      }
    })();

    return () => {
      cancelado = true;
      desarmarRefresh?.();
      ctx?.revert();
    };
  }, [clave]);

  return null;
}

/**
 * useSearchParams exige Suspense propio: sin boundary, el layout entero
 * caería a client-side rendering (mismo patrón que TraspasosLink en el Nav).
 * El fallback null no ocupa espacio: cero CLS.
 */
export default function AnimacionesSitio() {
  return (
    <Suspense fallback={null}>
      <Director />
    </Suspense>
  );
}
