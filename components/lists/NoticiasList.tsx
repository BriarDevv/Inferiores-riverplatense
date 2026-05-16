import Link from "next/link";
import Image from "next/image";
import type { Nota } from "@/lib/types";
import { formatearFecha, labelDivision } from "@/lib/constants";

interface Props {
  notas: Nota[];
  title?: string;
}

/**
 * Columna brutalist con noticias breves.
 * Cada item: thumb 72×72 + meta + título. Tamaño natural (sin flex stretch).
 */
export default function NoticiasList({ notas, title = "Noticias" }: Props) {
  return (
    <aside
      className="h-full flex flex-col"
      style={{
        background: "var(--color-paper-pure)",
        border: "2px solid var(--color-ink)",
        boxShadow: "8px 8px 0 var(--color-ink)",
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <header
        className="px-5 py-4 flex items-center justify-between shrink-0"
        style={{ borderBottom: "2px solid var(--color-ink)" }}
      >
        <h3
          className="font-sports"
          style={{
            fontSize: "0.95rem",
            letterSpacing: "0.14em",
            color: "var(--color-ink)",
          }}
        >
          {title}
        </h3>
        <span
          aria-hidden
          className="inline-block"
          style={{
            width: "0.55rem",
            height: "0.55rem",
            background: "var(--color-river-red)",
          }}
        />
      </header>

      <ul
        className="flex-1 overflow-y-auto"
        style={{ minHeight: 0 }}
      >
        {notas.map((nota, i) => (
          <li
            key={nota.id}
            style={{
              borderBottom:
                i < notas.length - 1 ? "1px solid var(--color-neutral-200)" : "none",
            }}
          >
            <Link
              href="/"
              className="group grid items-center gap-3 px-4 py-3"
              style={{
                gridTemplateColumns: "auto 72px 1fr",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <span
                className="font-sports tabular-nums leading-none"
                style={{
                  fontSize: "0.95rem",
                  color: "var(--color-river-red)",
                  letterSpacing: "0.02em",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <span
                className="relative block overflow-hidden shrink-0"
                style={{
                  width: "72px",
                  height: "72px",
                  background: "var(--color-ink)",
                  border: "2px solid var(--color-ink)",
                }}
              >
                <Image
                  src={nota.poster_url}
                  alt={nota.titulo}
                  fill
                  sizes="72px"
                  className="object-cover transition-transform duration-[500ms] ease-out group-hover:scale-[1.05]"
                />
              </span>

              <div className="min-w-0">
                <p
                  className="font-mono text-[0.58rem] uppercase tracking-[0.16em] mb-1"
                  style={{ color: "var(--color-neutral-500)" }}
                >
                  {labelDivision(nota.division)} · {formatearFecha(nota.publicada_en)}
                </p>
                <p
                  className="font-display leading-[1.18]"
                  style={{
                    fontSize: "0.9rem",
                    letterSpacing: "-0.01em",
                    color: "var(--color-ink)",
                  }}
                >
                  <span
                    style={{
                      backgroundImage:
                        "linear-gradient(var(--color-river-red), var(--color-river-red))",
                      backgroundSize: "0% 2px",
                      backgroundPosition: "0 100%",
                      backgroundRepeat: "no-repeat",
                      transition: "background-size 240ms ease-out",
                    }}
                    className="group-hover:[background-size:100%_2px]"
                  >
                    {nota.titulo}
                  </span>
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <footer
        className="px-5 py-3 shrink-0"
        style={{ borderTop: "2px solid var(--color-ink)" }}
      >
        <Link
          href="/?tipo=noticia"
          className="font-mono text-[0.65rem] uppercase tracking-[0.18em] inline-flex items-center gap-2 transition-colors"
          style={{ color: "var(--color-ink)" }}
        >
          Todas las noticias
          <span aria-hidden style={{ color: "var(--color-river-red)" }}>
            →
          </span>
        </Link>
      </footer>
    </aside>
  );
}
