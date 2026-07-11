"use client";

import { useEffect } from "react";
import { suscribirLenis } from "@/lib/lenis";

/**
 * Director de animaciones de la portada (spec 2026-07-10).
 * Anima elementos marcados con data-anim sin convertirlos a client components.
 * El estado oculto inicial lo setea GSAP por JS: sin JS, con
 * prefers-reduced-motion o si el import falla, el contenido se ve normal.
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
      if (cancelado) return;

      const gsap = gsapMod.gsap;
      const ScrollTrigger = stMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      // Lenis suaviza el scroll con su propio rAF: sin este puente,
      // ScrollTrigger mide posiciones desfasadas.
      const desuscribirLenis = suscribirLenis((lenis) => {
        lenis.on("scroll", ScrollTrigger.update);
      });

      const ctx = gsap.context(() => {
        // === HERO: timeline al cargar (el único momento "wow") ===
        const hero = document.querySelector<HTMLElement>('[data-anim="hero"]');
        if (hero) {
          const marco = hero.querySelector<HTMLElement>("article");
          const img = hero.querySelector<HTMLElement>("[data-anim-hero-img]");
          const texto = hero.querySelector<HTMLElement>(
            "[data-anim-hero-texto]",
          );
          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
          // La sombra offset arranca ausente y se estampa de golpe al final.
          // Ojo: viene como estilo inline del JSX, así que hay que guardarla
          // y restaurarla explícitamente (clearProps la borraría del todo).
          const sombraHero = marco?.style.boxShadow ?? "";
          if (marco) tl.set(marco, { boxShadow: "none" });
          if (img) {
            tl.fromTo(
              img,
              { clipPath: "inset(0 100% 0 0)" },
              { clipPath: "inset(0 0% 0 0)", duration: 0.55 },
            );
          }
          if (texto) {
            tl.fromTo(
              texto,
              { y: 28, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.5 },
              "-=0.35",
            );
          }
          if (marco) tl.set(marco, { boxShadow: sombraHero });
        }

        // === GRUPOS: stagger seco de los hijos directos ===
        document
          .querySelectorAll<HTMLElement>('[data-anim="grupo"]')
          .forEach((grupo) => {
            const items = Array.from(grupo.children);
            if (items.length === 0) return;
            gsap.fromTo(
              items,
              { y: 24, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.45,
                ease: "power3.out",
                stagger: 0.07,
                scrollTrigger: { trigger: grupo, start: "top 85%", once: true },
              },
            );
          });

        // === OVERLINES: micro-slide horizontal ===
        document
          .querySelectorAll<HTMLElement>('[data-anim="overline"]')
          .forEach((el) => {
            gsap.fromTo(
              el,
              { x: -12, autoAlpha: 0 },
              {
                x: 0,
                autoAlpha: 1,
                duration: 0.35,
                ease: "power3.out",
                scrollTrigger: { trigger: el, start: "top 85%", once: true },
              },
            );
          });

        // === SELLOS: el bloque entra y la sombra aparece un frame después ===
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
                { y: 24, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" },
              )
              .set(el, { boxShadow: sombra }, "+=0.1");
          });
      });

      limpiar = () => {
        desuscribirLenis();
        ctx.revert(); // mata tweens/triggers propios y restaura estilos inline
      };
    })();

    return () => {
      cancelado = true;
      limpiar?.();
    };
  }, []);

  return null;
}
