"use client";

import { useState } from "react";

export default function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSubmitted(true);
  };

  return (
    <section
      id="newsletter"
      aria-labelledby="newsletter-title"
      style={{
        background: "var(--color-ink)",
        color: "var(--color-paper-pure)",
        border: "2px solid var(--color-ink)",
        boxShadow: "8px 8px 0 var(--color-river-red)",
      }}
    >
      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-12 p-8 lg:p-12">
        <div>
          <p
            className="font-mono text-[0.65rem] uppercase tracking-[0.22em] mb-4 flex items-center gap-2"
            style={{ color: "var(--color-river-red)" }}
          >
            <span
              aria-hidden
              className="inline-block"
              style={{
                width: "0.6rem",
                height: "0.6rem",
                background: "var(--color-river-red)",
              }}
            />
            Newsletter
          </p>
          <h2
            id="newsletter-title"
            className="font-display leading-[0.95] mb-4"
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
              letterSpacing: "-0.025em",
            }}
          >
            Enterate{" "}
            <span style={{ fontStyle: "italic", color: "var(--color-river-red)" }}>
              antes
            </span>{" "}
            que nadie.
          </h2>
          <p
            className="text-base lg:text-lg leading-relaxed max-w-prose"
            style={{ color: "var(--color-neutral-300)" }}
          >
            Notas, entrevistas y noticias te llegan al mail antes de salir a las redes.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-col justify-center gap-3"
        >
          {!submitted ? (
            <>
              <div className="flex flex-col sm:flex-row gap-0">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  aria-label="Tu email"
                  className="flex-1 font-mono text-sm px-4 py-3.5 outline-none"
                  style={{
                    background: "var(--color-paper-pure)",
                    color: "var(--color-ink)",
                    border: "2px solid var(--color-paper-pure)",
                  }}
                />
                <button
                  type="submit"
                  className="font-sports text-sm tracking-[0.14em] px-5 py-3.5 transition-all"
                  style={{
                    background: "var(--color-river-red)",
                    color: "var(--color-paper-pure)",
                    border: "2px solid var(--color-river-red)",
                    cursor: "pointer",
                  }}
                >
                  Suscribirme →
                </button>
              </div>
              <p
                className="font-mono text-[0.6rem] uppercase tracking-[0.18em]"
                style={{ color: "var(--color-neutral-500)" }}
              >
                Sin spam. Te das de baja desde cualquier mail.
              </p>
            </>
          ) : (
            <div
              className="font-display italic"
              style={{
                fontSize: "1.15rem",
                lineHeight: 1.35,
                color: "var(--color-paper-pure)",
                padding: "1rem 1.25rem",
                border: "2px solid var(--color-river-red)",
                background: "var(--color-ink-elevated)",
              }}
            >
              Listo. Recibís el primer mail en unos días.
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
