import Link from "next/link";

const DIVISIONES = [
  "Primera",
  "Reserva",
  "4ta",
  "5ta",
  "6ta",
  "7ma",
  "8va",
  "9na",
  "Femenino",
];

export default function Footer() {
  return (
    <footer
      className="relative mt-24 overflow-hidden"
      style={{
        background: "var(--color-ink)",
        color: "var(--color-paper)",
        borderTop: "4px solid var(--color-river-red)",
      }}
    >
      <div className="grain absolute inset-0 pointer-events-none" aria-hidden />

      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-20 relative">
        {/* Etiqueta de sección */}
        <div className="flex items-center gap-4 mb-10">
          <span
            className="font-mono text-[0.65rem] uppercase tracking-[0.22em] px-2 py-1"
            style={{
              background: "var(--color-river-red)",
              color: "var(--color-paper-pure)",
            }}
          >
            Colofón
          </span>
          <span
            className="flex-1 h-px"
            style={{ background: "var(--color-ink-contrast)" }}
          />
          <span
            className="font-mono text-[0.65rem] uppercase tracking-[0.22em]"
            style={{ color: "var(--color-neutral-500)" }}
          >
            F.01 · Pie de página
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Bloque identidad con offset */}
          <div className="md:col-span-5 relative">
            <div
              className="inline-flex flex-col gap-1 pl-5 mb-5"
              style={{
                borderLeft: "3px solid var(--color-river-red)",
              }}
            >
              <span
                className="font-mono text-[0.6rem] uppercase tracking-[0.22em]"
                style={{ color: "var(--color-river-red)" }}
              >
                Inferiores
              </span>
              <span
                className="font-display leading-[0.95]"
                style={{
                  fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                  fontStyle: "italic",
                  color: "var(--color-paper-pure)",
                  letterSpacing: "-0.02em",
                }}
              >
                Riverplatense
              </span>
            </div>
            <p
              className="max-w-md text-base leading-relaxed"
              style={{ color: "var(--color-neutral-300)" }}
            >
              Periodismo dedicado a las divisiones formativas del Club Atlético
              River Plate. Entrevistas, perfiles y crónicas desde adentro.
            </p>
          </div>

          {/* Bloque secciones */}
          <div className="md:col-span-3">
            <p
              className="font-mono text-[0.6rem] uppercase tracking-[0.22em] mb-4 pb-2"
              style={{
                color: "var(--color-river-red)",
                borderBottom: "2px solid var(--color-ink-contrast)",
              }}
            >
              Secciones
            </p>
            <ul
              className="space-y-2.5 font-sports text-sm"
              style={{ letterSpacing: "0.06em" }}
            >
              <li>
                <Link href="/?tipo=entrevista" className="link-underline">
                  Entrevistas
                </Link>
              </li>
              <li>
                <Link href="/?tipo=perfil" className="link-underline">
                  Perfiles
                </Link>
              </li>
              <li>
                <Link href="/?tipo=cronica" className="link-underline">
                  Crónicas
                </Link>
              </li>
              <li>
                <Link href="/feed" className="link-underline">
                  Feed vertical
                </Link>
              </li>
            </ul>
          </div>

          {/* Bloque divisiones */}
          <div className="md:col-span-4">
            <p
              className="font-mono text-[0.6rem] uppercase tracking-[0.22em] mb-4 pb-2"
              style={{
                color: "var(--color-river-red)",
                borderBottom: "2px solid var(--color-ink-contrast)",
              }}
            >
              Divisiones
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DIVISIONES.map((d) => (
                <span
                  key={d}
                  className="px-2 py-1.5 font-sports text-xs text-center"
                  style={{
                    border: "2px solid var(--color-ink-contrast)",
                    color: "var(--color-paper)",
                    letterSpacing: "0.06em",
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Línea de cierre con offset monograma */}
        <div className="mt-16 flex items-end justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center justify-center w-12 h-12 font-display italic text-2xl leading-none shrink-0"
              style={{
                background: "var(--color-river-red)",
                color: "var(--color-paper-pure)",
                border: "2px solid var(--color-paper-pure)",
                boxShadow: "4px 4px 0 var(--color-paper-pure)",
              }}
            >
              I
            </span>
            <div
              className="font-mono text-[0.6rem] uppercase tracking-[0.22em] leading-tight"
              style={{ color: "var(--color-neutral-500)" }}
            >
              <div>IRP / 2026 · N° 042</div>
              <div>Buenos Aires · Argentina</div>
            </div>
          </div>
          <div
            className="font-mono text-[0.6rem] uppercase tracking-[0.22em] leading-tight text-right"
            style={{ color: "var(--color-neutral-500)" }}
          >
            <div>© 2026 · Sitio periodístico independiente</div>
            <div>No afiliado oficialmente al Club Atlético River Plate</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
