"use client";

import { useEffect } from "react";
import { registrarLenis } from "@/lib/lenis";

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let rafId: number | null = null;
    let lenisInstance: { destroy: () => void; raf: (t: number) => void } | null =
      null;
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
      lenisInstance = lenis;
      registrarLenis(lenis);

      const tick = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      lenisInstance?.destroy();
      registrarLenis(null);
    };
  }, []);

  return <>{children}</>;
}
