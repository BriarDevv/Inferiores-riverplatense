"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type LenisInstance = {
  destroy: () => void;
  raf: (t: number) => void;
  scrollTo: (target: number, opts?: { immediate?: boolean }) => void;
};

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisInstance | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let rafId: number | null = null;
    let cancelled = false;

    (async () => {
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      const { default: Lenis } = await import("lenis");
      // El import es async: si el componente se desmontó mientras cargaba,
      // no hay que crear la instancia (quedaría corriendo sin cleanup).
      if (cancelled) return;
      const lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.3,
      });
      lenisRef.current = lenis;

      const tick = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Next.js navega client-side sin resetear el scroll nativo que Lenis
  // controla: su loop de rAF sigue empujando hacia la posición vieja y, si
  // la página nueva es más corta, el navegador clampea al fondo (aterrizás
  // "abajo del todo" en vez de arriba). Forzar el reset acá mantiene el
  // estado interno de Lenis sincronizado con cada cambio de ruta.
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return <>{children}</>;
}
