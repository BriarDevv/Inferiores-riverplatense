import Link from "next/link";
import type { Nota } from "@/lib/types";
import { formatearFecha, labelDivision, labelTipo } from "@/lib/constants";

interface Props {
  notas: Nota[];
}

export default function UltimasList({ notas }: Props) {
  return (
    <ul style={{ borderTop: "2px solid var(--color-ink)" }}>
      {notas.map((nota, i) => (
        <li
          key={nota.id}
          style={{ borderBottom: "2px solid var(--color-ink)" }}
        >
          <Link
            href="/"
            className="group grid items-center gap-6 py-5 px-2 transition-colors"
            style={{
              gridTemplateColumns: "auto 1fr auto",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <span
              className="font-sports tabular-nums"
              style={{
                fontSize: "2rem",
                lineHeight: 1,
                color: "var(--color-river-red)",
                letterSpacing: "0.02em",
                minWidth: "2.5rem",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>

            <div className="min-w-0">
              <p
                className="font-mono text-[0.65rem] uppercase tracking-[0.16em] mb-1.5"
                style={{ color: "var(--color-river-red)" }}
              >
                {labelTipo(nota.tipo)} · {labelDivision(nota.division)}
              </p>
              <p
                className="font-display leading-[1.15]"
                style={{
                  fontSize: "clamp(1.05rem, 1.4vw, 1.35rem)",
                  letterSpacing: "-0.015em",
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

            <span
              className="font-mono text-[0.65rem] uppercase tracking-[0.14em] shrink-0"
              style={{ color: "var(--color-neutral-500)" }}
            >
              {formatearFecha(nota.publicada_en)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
