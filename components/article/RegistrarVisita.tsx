"use client";

import { useEffect } from "react";

/**
 * Ping invisible que registra la visita a la nota (una vez por pestaña/sesión).
 * Usa navigator.sendBeacon: está pensado exactamente para telemetría — no
 * bloquea la navegación y el browser lo entrega aunque el lector se vaya.
 */
export default function RegistrarVisita({ slug }: { slug: string }) {
  useEffect(() => {
    const clave = `visita:${slug}`;
    try {
      if (sessionStorage.getItem(clave)) return;
      sessionStorage.setItem(clave, "1");
    } catch {
      // Sin sessionStorage (modo privado estricto): contamos igual.
    }
    // ref: de dónde vino el lector (el server descarta las navegaciones internas)
    const cuerpo = JSON.stringify({ slug, ref: document.referrer || null });
    try {
      navigator.sendBeacon("/api/visita", new Blob([cuerpo], { type: "application/json" }));
    } catch {
      // Si el beacon no sale (cola llena, browser raro) perdemos un ping. Nada grave.
    }
  }, [slug]);

  return null;
}
