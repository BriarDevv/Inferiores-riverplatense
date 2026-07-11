"use client";

import { useEffect } from "react";
import { suscribirLenis } from "@/lib/lenis";

/**
 * Director de animaciones de la portada (spec 2026-07-10, coreografía v2).
 * Anima elementos marcados con data-anim sin convertirlos a client components.
 * El estado oculto inicial lo setea GSAP por JS: sin JS, con
 * prefers-reduced-motion o si el import falla, el contenido se ve normal.
 *
 * Verbos brutalist: cortar (clip-path), estampar (sombra + golpe del marco),
 * encajar (snap vertical), desfilar (cascada lateral), marcar (contadores).
 */
export default function AnimacionesPortada() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelado = false;
    let limpiar: (() => void) | null = null;

    (async () => {
      let gsapMod: typeof import("gsap");
      let stMod: typeof import("gsap/ScrollTrigger");
      try {
        [gsapMod, stMod] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
      } catch (error: unknown) {
        // Sin GSAP no hay animación, pero el contenido ya es visible.
        if (process.env.NODE_ENV === "development") {
          console.error("No se pudo cargar GSAP", error);
        }
        return;
      }

      // SplitText es opcional: si no está, el título entra entero.
      let SplitText: typeof import("gsap/SplitText").SplitText | null = null;
      try {
        SplitText = (await import("gsap/SplitText")).SplitText;
      } catch {
        SplitText = null;
      }

      // Esperar las fuentes: partir el título con la fuente fallback
      // calcula mal las líneas.
      await document.fonts.ready;
      if (cancelado) return;

      const gsap = gsapMod.gsap;
      const ScrollTrigger = stMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      if (SplitText) gsap.registerPlugin(SplitText);

      // Lenis suaviza el scroll con su propio rAF: sin este puente,
      // ScrollTrigger mide posiciones desfasadas.
      const desuscribirLenis = suscribirLenis((lenis) => {
        lenis.on("scroll", ScrollTrigger.update);
      });

      let splitTitulo: { revert: () => void } | null = null;

      const ctx = gsap.context(() => {
        // === HERO: apertura de diario (el momento memorable) ===
        const hero = document.querySelector<HTMLElement>('[data-anim="hero"]');
        if (hero) {
          const marco = hero.querySelector<HTMLElement>("article");
          const img = hero.querySelector<HTMLElement>("[data-anim-hero-img] img");
          const badge = hero.querySelector<HTMLElement>(
            "[data-anim-hero-img] > div",
          );
          const texto = hero.querySelector<HTMLElement>(
            "[data-anim-hero-texto]",
          );
          const kicker = texto?.querySelector<HTMLElement>("p") ?? null;
          const titulo = texto?.querySelector<HTMLElement>("h1 a") ?? null;
          const resto = texto
            ? Array.from(texto.children).filter(
                (el) => el !== kicker && el.tagName !== "H1",
              )
            : [];

          // La sombra offset viene como estilo inline del JSX: guardarla y
          // restaurarla explícitamente (clearProps la borraría del todo).
          const sombraHero = marco?.style.boxShadow ?? "";

          const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
          if (marco) tl.set(marco, { boxShadow: "none" });

          // 1. La imagen se corta de izquierda a derecha mientras el zoom asienta.
          if (img) {
            tl.fromTo(
              img,
              { clipPath: "inset(0 100% 0 0)", scale: 1.15 },
              { clipPath: "inset(0 0% 0 0)", scale: 1, duration: 0.85 },
              0,
            );
          }
          // 2. El badge "Nota destacada" entra desde el borde izquierdo.
          if (badge) {
            tl.fromTo(
              badge,
              { xPercent: -110, autoAlpha: 0 },
              { xPercent: 0, autoAlpha: 1, duration: 0.4 },
              0.5,
            );
          }
          // 3. Kicker con su cuadrito rojo.
          if (kicker) {
            tl.fromTo(
              kicker,
              { x: -18, autoAlpha: 0 },
              { x: 0, autoAlpha: 1, duration: 0.4 },
              0.15,
            );
          }
          // 4. Título línea por línea, enmascarado (tipografía cinética).
          if (titulo && SplitText) {
            const split = SplitText.create(titulo, {
              type: "lines",
              mask: "lines",
            });
            splitTitulo = split;
            tl.fromTo(
              split.lines,
              { yPercent: 110 },
              {
                yPercent: 0,
                duration: 0.65,
                stagger: 0.09,
                // Con el título ya visible, devolver el h1 a su DOM original
                // (las líneas partidas se rompen al cambiar el ancho).
                onComplete: () => {
                  split.revert();
                  splitTitulo = null;
                },
              },
              0.25,
            );
          } else if (titulo) {
            tl.fromTo(
              titulo,
              { y: 30, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.55 },
              0.25,
            );
          }
          // 5. Bajada, byline y CTA encajan en fila.
          if (resto.length > 0) {
            tl.fromTo(
              resto,
              { y: 22, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.09 },
              0.55,
            );
          }
          // 6. Estampado: la sombra aparece de golpe y el marco acusa el impacto.
          if (marco) {
            tl.set(marco, { boxShadow: sombraHero }, ">-0.1")
              .fromTo(
                marco,
                { x: 4, y: 4 },
                { x: 0, y: 0, duration: 0.16, ease: "power2.out" },
                "<",
              )
              .set(marco, { clearProps: "transform" });
          }
          // 7. Devolverle el transform al hover-zoom CSS de la imagen.
          if (img) tl.set(img, { clearProps: "transform" });
        }

        // === GRUPOS: stagger seco de los hijos directos ===
        document
          .querySelectorAll<HTMLElement>('[data-anim="grupo"]')
          .forEach((grupo) => {
            const items = Array.from(grupo.children);
            if (items.length === 0) return;
            gsap.fromTo(
              items,
              { y: 32, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.55,
                ease: "power4.out",
                stagger: 0.08,
                scrollTrigger: { trigger: grupo, start: "top 85%", once: true },
              },
            );
          });

        // === CASCADAS: filas de lista desfilan desde la izquierda ===
        document
          .querySelectorAll<HTMLElement>('[data-anim="cascada"]')
          .forEach((lista) => {
            const filas = Array.from(lista.children);
            if (filas.length === 0) return;
            gsap.fromTo(
              filas,
              { x: -28, autoAlpha: 0 },
              {
                x: 0,
                autoAlpha: 1,
                duration: 0.45,
                ease: "power3.out",
                stagger: 0.07,
                scrollTrigger: { trigger: lista, start: "top 85%", once: true },
              },
            );
          });

        // === OVERLINES: micro-slide horizontal ===
        document
          .querySelectorAll<HTMLElement>('[data-anim="overline"]')
          .forEach((el) => {
            gsap.fromTo(
              el,
              { x: -16, autoAlpha: 0 },
              {
                x: 0,
                autoAlpha: 1,
                duration: 0.4,
                ease: "power3.out",
                scrollTrigger: { trigger: el, start: "top 85%", once: true },
              },
            );
          });

        // === SELLOS: el bloque entra, estampa la sombra y acusa el golpe ===
        document
          .querySelectorAll<HTMLElement>('[data-anim="sello"]')
          .forEach((el) => {
            // La sombra también es inline acá: guardar y restaurar.
            const sombra = el.style.boxShadow;
            const tl = gsap.timeline({
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            });
            tl.set(el, { boxShadow: "none" })
              .fromTo(
                el,
                { y: 28, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.5, ease: "power4.out" },
              )
              .set(el, { boxShadow: sombra }, "+=0.08")
              .fromTo(
                el,
                { x: 3, y: 3 },
                { x: 0, y: 0, duration: 0.14, ease: "power2.out" },
                "<",
              )
              .set(el, { clearProps: "transform" });
          });

        // === CONTADORES: los números del marcador suben de 0 al real ===
        document
          .querySelectorAll<HTMLElement>('[data-anim="contador"]')
          .forEach((el) => {
            const fin = parseInt(el.textContent ?? "", 10);
            if (Number.isNaN(fin)) return;
            gsap.fromTo(
              el,
              { textContent: 0 },
              {
                textContent: fin,
                duration: 1,
                ease: "power1.out",
                snap: { textContent: 1 },
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              },
            );
          });
      });

      limpiar = () => {
        desuscribirLenis();
        ctx.revert(); // mata tweens/triggers propios y restaura estilos inline
        splitTitulo?.revert(); // devuelve el h1 a su DOM original
      };
    })();

    return () => {
      cancelado = true;
      limpiar?.();
    };
  }, []);

  return null;
}
