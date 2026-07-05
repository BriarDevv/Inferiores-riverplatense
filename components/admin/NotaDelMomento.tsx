import Link from "next/link";
import Image from "next/image";
import type { NotaAdmin } from "@/lib/admin/notas-admin";
import { labelDivision, labelTipo } from "@/lib/constants";

interface TopNota {
  nota: NotaAdmin;
  visitas: number;
}

interface NotaDelMomentoProps {
  /** Top de la semana ordenado desc; [0] es la protagonista. */
  top: TopNota[];
  /** Fallback cuando nadie leyó nada esta semana. */
  ultimaPublicada: NotaAdmin | null;
}

function factorVsSegunda(top: TopNota[]): string | null {
  if (top.length < 2 || top[1].visitas === 0) return null;
  const factor = top[0].visitas / top[1].visitas;
  if (factor < 1.5) return null;
  const redondo = factor >= 3 ? Math.round(factor) : Math.round(factor * 10) / 10;
  return `${String(redondo).replace(".", ",")}× más que la segunda`;
}

/** El módulo estrella del Resumen: LA nota que está funcionando esta semana. */
export default function NotaDelMomento({ top, ultimaPublicada }: NotaDelMomentoProps) {
  const protagonista = top[0]?.nota ?? ultimaPublicada;
  const visitas = top[0]?.visitas ?? 0;
  const insight = factorVsSegunda(top);

  return (
    <section
      aria-label="La nota del momento"
      className="brut-frame-shadow bg-[var(--color-paper-pure)] flex flex-col"
    >
      <header className="bg-[var(--color-ink)] text-white px-4 py-2.5">
        <h2 className="font-sports uppercase tracking-[0.18em] text-xs">
          La nota del momento <span className="text-white/50">· 7 días</span>
        </h2>
      </header>

      {!protagonista ? (
        <p className="px-4 py-8 font-body text-sm text-black/45">
          Cuando publiques la primera nota, acá va a estar la que más se lee.
        </p>
      ) : (
        <Link href={`/admin/notas/${protagonista.id}`} className="group flex flex-col flex-1">
          <div className="relative aspect-video border-b-2 border-[var(--color-ink)] bg-[var(--color-ink)] overflow-hidden">
            {protagonista.poster_url ? (
              <Image
                src={protagonista.poster_url}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 640px"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              />
            ) : (
              <span aria-hidden className="sin-poster absolute inset-0" />
            )}
            {/* Visitas de la semana, estampadas sobre el poster */}
            <div className="absolute bottom-0 left-0 bg-[var(--color-ink)] text-white px-4 py-2 border-t-2 border-r-2 border-[var(--color-river-red)] flex items-baseline gap-2">
              <span className="font-sports text-3xl leading-none text-[var(--color-river-red)] tabular-nums">
                {visitas}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/70">
                visita{visitas === 1 ? "" : "s"}
                {visitas === 0 && " esta semana"}
              </span>
            </div>
          </div>

          <div className="px-4 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-river-red-deep)] mb-1.5">
              {labelTipo(protagonista.tipo)} · {labelDivision(protagonista.division)} ·{" "}
              {protagonista.autor.nombre}
            </p>
            <h3 className="font-display text-xl md:text-2xl font-bold leading-tight group-hover:text-[var(--color-river-red-deep)] transition-colors">
              {protagonista.titulo}
            </h3>
            <p className="font-body text-sm text-black/55 mt-1.5">
              {insight ??
                (visitas === 0
                  ? "Todavía sin lecturas esta semana. Compartila y mirá cómo arranca."
                  : "Va primera en la semana.")}
            </p>
          </div>
        </Link>
      )}

      {/* El resto del top 5, compacto */}
      {top.length > 1 && (
        <ol className="border-t border-black/10 px-4 py-2.5 mt-auto" start={2}>
          {top.slice(1, 5).map(({ nota, visitas: v }, i) => (
            <li key={nota.id} className="flex items-baseline gap-2.5 py-1 min-w-0">
              <span aria-hidden className="font-sports text-sm text-[var(--color-river-red)] w-4 shrink-0">
                {i + 2}
              </span>
              <Link
                href={`/admin/notas/${nota.id}`}
                className="font-body text-[13px] font-medium truncate flex-1 hover:text-[var(--color-river-red-deep)] transition-colors"
              >
                {nota.titulo}
              </Link>
              <span className="font-mono text-xs tabular-nums text-black/45 shrink-0">{v}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
