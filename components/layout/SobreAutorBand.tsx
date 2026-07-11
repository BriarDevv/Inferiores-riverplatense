import Link from "next/link";
import Image from "next/image";

interface Props {
  autor: { nombre: string; foto_url?: string };
  stats: { notas: number; divisiones: number; jugadores: number };
}

/**
 * Banda brutalist del periodista (cierre de la home, antes del newsletter).
 * Identidad + bio corta + stats reales + CTA a /sobre.
 */
export default function SobreAutorBand({ autor, stats }: Props) {
  const items = [
    { n: stats.notas, label: "Notas" },
    { n: stats.divisiones, label: "Divisiones" },
    { n: stats.jugadores, label: "Jugadores" },
  ];

  return (
    <section className="mb-20 lg:mb-24">
      <div
        className="p-7 sm:p-9 lg:p-10"
        style={{
          background: "var(--color-paper-pure)",
          border: "2px solid var(--color-ink)",
          boxShadow: "8px 8px 0 var(--color-river-red)",
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-8">
          {/* identidad + bio */}
          <div className="flex items-start gap-5 flex-1 min-w-0">
            {autor.foto_url && (
              <span
                className="relative inline-block shrink-0"
                style={{
                  width: 88,
                  height: 88,
                  overflow: "hidden",
                  border: "2px solid var(--color-ink)",
                  boxShadow: "4px 4px 0 var(--color-ink)",
                }}
              >
                <Image
                  src={autor.foto_url}
                  alt=""
                  fill
                  sizes="88px"
                  style={{ objectFit: "cover" }}
                />
              </span>
            )}
            <div className="min-w-0">
              <p
                className="font-mono text-[0.62rem] uppercase tracking-[0.2em] mb-2"
                style={{ color: "var(--color-river-red-deep)" }}
              >
                Quién escribe
              </p>
              <h2
                className="font-display leading-[0.95] mb-2"
                style={{
                  fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                  letterSpacing: "-0.025em",
                  color: "var(--color-ink)",
                }}
              >
                {autor.nombre}
              </h2>
              <p
                className="text-sm leading-relaxed max-w-prose"
                style={{ color: "var(--color-neutral-700)" }}
              >
                Periodismo de cantera, de la Novena a la Primera. Notas,
                entrevistas y crónicas hechas desde adentro — siguiendo a los
                pibes en el tiempo, no solo el día que debutan.
              </p>
            </div>
          </div>

          {/* stats */}
          <div
            className="flex w-full lg:w-auto shrink-0 self-stretch lg:self-auto"
            style={{ border: "2px solid var(--color-ink)" }}
          >
            {items.map((s, i) => (
              <div
                key={s.label}
                className="px-3 sm:px-5 py-3 text-center flex-1 lg:flex-none"
                style={{
                  borderLeft: i > 0 ? "2px solid var(--color-ink)" : "none",
                }}
              >
                <p
                  className="font-sports leading-none"
                  style={{ fontSize: "1.9rem", color: "var(--color-river-red-deep)" }}
                >
                  {s.n}
                </p>
                <p
                  className="font-mono text-[0.55rem] uppercase tracking-[0.14em] mt-1"
                  style={{ color: "var(--color-neutral-500)" }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/sobre"
            className="font-sports inline-flex items-center gap-2 brut-cta-ink shrink-0 self-start lg:self-auto"
            style={{
              fontSize: "0.8rem",
              letterSpacing: "0.12em",
              padding: "0.8rem 1.3rem",
              textDecoration: "none",
            }}
          >
            Sobre el proyecto
            <span aria-hidden style={{ fontSize: "1rem" }}>
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
