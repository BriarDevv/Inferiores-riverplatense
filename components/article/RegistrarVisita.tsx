"use client";

import { useEffect } from "react";

/** Ping invisible que registra la visita a la nota (una vez por pestaña/sesión). */
export default function RegistrarVisita({ slug }: { slug: string }) {
  useEffect(() => {
    const clave = `visita:${slug}`;
    try {
      if (sessionStorage.getItem(clave)) return;
      sessionStorage.setItem(clave, "1");
    } catch {
      // Sin sessionStorage (modo privado estricto): contamos igual.
    }
    void fetch("/api/visita", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => undefined);
  }, [slug]);

  return null;
}
