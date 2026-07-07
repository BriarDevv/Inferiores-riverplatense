"use client";

import { useSyncExternalStore } from "react";

const UMBRAL_PX = 400;

function suscribirScroll(notificar: () => void) {
  window.addEventListener("scroll", notificar, { passive: true });
  return () => window.removeEventListener("scroll", notificar);
}

const pasoElUmbral = () => window.scrollY > UMBRAL_PX;
const enServidor = () => false;

function subirArriba() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function ScrollToTop() {
  // useSyncExternalStore evita el doble render del patrón useState+useEffect
  // y deja el snapshot del servidor explícito (oculto hasta hidratar).
  const visible = useSyncExternalStore(suscribirScroll, pasoElUmbral, enServidor);

  return (
    <button
      type="button"
      onClick={subirArriba}
      aria-label="Subir al inicio"
      tabIndex={visible ? 0 : -1}
      className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-40 inline-flex items-center justify-center brut-cta-red-lg"
      style={{
        width: "52px",
        height: "52px",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        cursor: "pointer",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="square"
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
