"use client";

import { useState } from "react";

/** Form de contacto. Hoy es fake (no persiste) — cablear a Supabase/email al salir de la demo. */
const inputStyle: React.CSSProperties = {
  background: "var(--color-paper-pure)",
  color: "var(--color-ink)",
  border: "2px solid var(--color-ink)",
};

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) return;
    setSent(true);
  };


  if (sent) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="p-7 font-display"
        style={{
          fontSize: "1.2rem",
          lineHeight: 1.4,
          color: "var(--color-ink)",
          background: "var(--color-paper-pure)",
          border: "2px solid var(--color-ink)",
          boxShadow: "6px 6px 0 var(--color-river-red)",
        }}
      >
        Gracias, lo recibí. Si hay algo, te escribo.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="nombre"
          className="font-mono text-[0.62rem] uppercase tracking-[0.16em]"
          style={{ color: "var(--color-neutral-500)" }}
        >
          Nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          className="font-body text-sm px-4 py-3 outline-none focus:shadow-[3px_3px_0_var(--color-river-red)]"
          style={inputStyle}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="font-mono text-[0.62rem] uppercase tracking-[0.16em]"
          style={{ color: "var(--color-neutral-500)" }}
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="tu@correo.com"
          className="font-mono text-sm px-4 py-3 outline-none focus:shadow-[3px_3px_0_var(--color-river-red)]"
          style={inputStyle}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="mensaje"
          className="font-mono text-[0.62rem] uppercase tracking-[0.16em]"
          style={{ color: "var(--color-neutral-500)" }}
        >
          Tu mensaje o dato
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          rows={5}
          className="font-body text-sm px-4 py-3 outline-none resize-y focus:shadow-[3px_3px_0_var(--color-river-red)]"
          style={inputStyle}
        />
      </div>

      <button
        type="submit"
        className="font-sports self-start inline-flex items-center gap-2 brut-cta-red"
        style={{
          fontSize: "0.85rem",
          letterSpacing: "0.12em",
          padding: "0.8rem 1.5rem",
        }}
      >
        Enviar
        <span aria-hidden style={{ fontSize: "1rem" }}>
          →
        </span>
      </button>
    </form>
  );
}
