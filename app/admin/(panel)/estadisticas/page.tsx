import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import { listNotasAdmin, type NotaAdmin } from "@/lib/admin/notas-admin";
import { getVisitasPorNota, type VisitasNota } from "@/lib/admin/stats";
import { labelDivision, labelTipo, formatearFecha } from "@/lib/constants";

export const metadata = { title: "Estadísticas — Panel" };

type Periodo = "7d" | "30d" | "total";

const PERIODOS: Array<{ value: Periodo; label: string }> = [
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
  { value: "total", label: "Histórico" },
];

function visitasEn(v: VisitasNota | undefined, periodo: Periodo): number {
  if (!v) return 0;
  if (periodo === "7d") return v.ult_7d;
  if (periodo === "30d") return v.ult_30d;
  return v.total;
}

function Ranking({
  titulo,
  filas,
}: {
  titulo: string;
  filas: Array<{ label: string; valor: number }>;
}) {
  const max = Math.max(1, ...filas.map((f) => f.valor));
  return (
    <section aria-label={titulo} className="brut-frame-shadow bg-[var(--color-paper-pure)]">
      <header className="bg-[var(--color-ink)] text-white px-4 py-2.5">
        <h2 className="font-sports uppercase tracking-[0.18em] text-xs">{titulo}</h2>
      </header>
      {filas.length === 0 ? (
        <p className="px-4 py-6 font-body text-sm text-black/45">Sin visitas en este período.</p>
      ) : (
        <ul className="p-4 flex flex-col gap-3">
          {filas.map((f) => (
            <li key={f.label}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="font-body text-sm font-medium truncate">{f.label}</span>
                <span className="font-mono text-xs tabular-nums text-[var(--color-river-red-deep)] shrink-0">
                  {f.valor}
                </span>
              </div>
              <div className="h-2 bg-black/8" aria-hidden>
                <div
                  className="h-full bg-[var(--color-river-red)]"
                  style={{ width: `${Math.max(3, Math.round((f.valor / max) * 100))}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function agrupar(
  notas: NotaAdmin[],
  visitas: Map<string, VisitasNota>,
  periodo: Periodo,
  clave: (n: NotaAdmin) => string,
): Array<{ label: string; valor: number }> {
  const acc = new Map<string, number>();
  for (const n of notas) {
    const v = visitasEn(visitas.get(n.id), periodo);
    if (v === 0) continue;
    acc.set(clave(n), (acc.get(clave(n)) ?? 0) + v);
  }
  return [...acc.entries()]
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 8);
}

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AdminEstadisticas({ searchParams }: PageProps) {
  const params = await searchParams;
  const periodo: Periodo = params.periodo === "30d" || params.periodo === "total" ? params.periodo : "7d";

  const [notas, visitas] = await Promise.all([listNotasAdmin(), getVisitasPorNota()]);

  const totalPeriodo = [...visitas.values()].reduce((acc, v) => acc + visitasEn(v, periodo), 0);
  const notasConVisitas = [...visitas.values()].filter((v) => visitasEn(v, periodo) > 0).length;

  const topNotas = notas
    .map((n) => ({ nota: n, valor: visitasEn(visitas.get(n.id), periodo) }))
    .filter((x) => x.valor > 0)
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 10);
  const maxNota = Math.max(1, ...topNotas.map((x) => x.valor));

  return (
    <div className="max-w-6xl">
      <PageHeader
        overline="Panel de redacción"
        titulo="Estadísticas"
        descripcion="Visitas medidas por el contador propio del sitio. Un mismo lector cuenta una sola vez cada 30 minutos."
      />

      {/* Período */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {PERIODOS.map((p) => (
          <Link
            key={p.value}
            href={p.value === "7d" ? "/admin/estadisticas" : `/admin/estadisticas?periodo=${p.value}`}
            aria-current={periodo === p.value ? "page" : undefined}
            className={`font-sports uppercase tracking-[0.14em] text-sm px-4 py-2 border-2 transition-colors ${
              periodo === p.value
                ? "bg-[var(--color-ink)] text-white border-[var(--color-ink)]"
                : "border-[var(--color-ink)] hover:bg-[var(--color-river-red-soft)]"
            }`}
          >
            {p.label}
          </Link>
        ))}
        <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.16em] text-black/45">
          {totalPeriodo} visita{totalPeriodo === 1 ? "" : "s"} · {notasConVisitas} nota
          {notasConVisitas === 1 ? "" : "s"} con lecturas
        </span>
      </div>

      {/* Top notas */}
      <section aria-label="Notas más leídas" className="brut-frame-shadow bg-[var(--color-paper-pure)] mb-8">
        <header className="bg-[var(--color-ink)] text-white px-4 py-2.5">
          <h2 className="font-sports uppercase tracking-[0.18em] text-xs">Notas más leídas</h2>
        </header>
        {topNotas.length === 0 ? (
          <p className="px-4 py-8 font-body text-sm text-black/45">
            Sin visitas en este período todavía. El contador suma con cada lectura del sitio.
          </p>
        ) : (
          <ul>
            {topNotas.map(({ nota, valor }, i) => (
              <li key={nota.id} className="border-b last:border-b-0 border-black/10">
                <Link
                  href={`/admin/notas/${nota.id}`}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--color-river-red-soft)] transition-colors"
                >
                  <span aria-hidden className="font-sports text-2xl leading-none text-[var(--color-river-red)] w-8 shrink-0">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display font-bold leading-snug truncate">
                      {nota.titulo}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">
                      {labelTipo(nota.tipo)} · {labelDivision(nota.division)} · {nota.autor.nombre}
                      {nota.publicada_en ? ` · ${formatearFecha(nota.publicada_en)}` : ""}
                    </span>
                    <span className="block h-1.5 bg-black/8 mt-1.5" aria-hidden>
                      <span
                        className="block h-full bg-[var(--color-river-red)]"
                        style={{ width: `${Math.max(3, Math.round((valor / maxNota) * 100))}%` }}
                      />
                    </span>
                  </span>
                  <span className="shrink-0 font-sports text-xl tabular-nums text-[var(--color-river-red-deep)]">
                    {valor}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Rankings por dimensión */}
      <div className="grid md:grid-cols-3 gap-6 items-start">
        <Ranking titulo="Por división" filas={agrupar(notas, visitas, periodo, (n) => labelDivision(n.division))} />
        <Ranking titulo="Por tipo" filas={agrupar(notas, visitas, periodo, (n) => labelTipo(n.tipo))} />
        <Ranking titulo="Por firma" filas={agrupar(notas, visitas, periodo, (n) => n.autor.nombre)} />
      </div>
    </div>
  );
}
