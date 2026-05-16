"use client";

import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
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
