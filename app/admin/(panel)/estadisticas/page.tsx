import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import Delta from "@/components/admin/Delta";
import GraficoBarras from "@/components/admin/GraficoBarras";
import FilasBarra from "@/components/admin/FilasBarra";
import { listNotasAdmin, type NotaAdmin } from "@/lib/admin/notas-admin";
import { getVisitasCrudas, getVisitasPorNota, franjaPico } from "@/lib/admin/stats";
import {
  DIAS_PERIODO,
  agruparPorSemana,
  mejorDia,
  partirPorCorte,
  porDispositivo,
  porFuente,
  porHora,
  porNota,
  serieDiaria,
  type ConteoDispositivos,
  type PeriodoStats,
  type PuntoSerie,
  type VisitaCruda,
} from "@/lib/admin/stats-periodo";
import { labelDivision, labelTipo, formatearFecha } from "@/lib/constants";

export const metadata = { title: "Estadísticas — Panel" };

const DIA_MS = 86_400_000;

const PERIODOS: Array<{ value: PeriodoStats; label: string }> = [
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" },
  { value: "90d", label: "90 días" },
  { value: "total", label: "Histórico" },
];

const LABEL_PERIODO: Record<PeriodoStats, string> = {
  "7d": "últimos 7 días",
  "30d": "últimos 30 días",
  "90d": "últimos 90 días",
  total: "todo el histórico",
};

/* === Piezas de layout === */

function SeparadorSeccion({ titulo, detalle }: { titulo: string; detalle: string }) {
  return (
    <div className="flex items-center gap-4 mt-10 mb-6">
      <h2 className="font-sports uppercase tracking-[0.18em] text-lg shrink-0">{titulo}</h2>
      <span aria-hidden className="flex-1 border-t-2 border-[var(--color-ink)]" />
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45 shrink-0 hidden sm:inline">
        {detalle}
      </span>
    </div>
  );
}

function Modulo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section aria-label={titulo} className="brut-frame-shadow bg-[var(--color-paper-pure)] flex flex-col">
      <header className="bg-[var(--color-ink)] text-white px-4 py-2.5">
        <h3 className="font-sports uppercase tracking-[0.18em] text-xs">{titulo}</h3>
      </header>
      <div className="flex-1 flex flex-col justify-center">{children}</div>
    </section>
  );
}

function BarraDividida({ conteo }: { conteo: ConteoDispositivos }) {
  const total = conteo.mobile + conteo.desktop + conteo.sinDato;
  if (total === 0) {
    return (
      <p className="px-4 py-5 font-body text-sm text-black/45">
        Sin visitas en este período todavía.
      </p>
    );
  }
  const pct = (v: number) => Math.round((v / total) * 100);
  return (
    <div className="px-4 py-5">
      <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.14em] mb-2">
        <span className="text-[var(--color-river-red-deep)]">Mobile {pct(conteo.mobile)}%</span>
        <span className="text-black/70">Desktop {pct(conteo.desktop)}%</span>
      </div>
      <div className="h-3 flex bg-black/8" aria-hidden>
        <div className="h-full bg-[var(--color-river-red)]" style={{ width: `${pct(conteo.mobile)}%` }} />
        <div className="h-full bg-[var(--color-ink)]" style={{ width: `${pct(conteo.desktop)}%` }} />
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/40 mt-2">
        {conteo.mobile} mobile · {conteo.desktop} desktop
        {conteo.sinDato > 0 && ` · ${conteo.sinDato} sin dato`}
      </p>
    </div>
  );
}

/* === Helpers de datos === */

function diaLargo(claveYmd: string): string {
  const [y, m, d] = claveYmd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

function agrupar(
  notas: NotaAdmin[],
  visitasNota: Map<string, number>,
  clave: (n: NotaAdmin) => string,
): Array<{ label: string; valor: number }> {
  const acc = new Map<string, number>();
  for (const n of notas) {
    const v = visitasNota.get(n.id) ?? 0;
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
  const periodo: PeriodoStats =
    params.periodo === "30d" || params.periodo === "90d" || params.periodo === "total"
      ? params.periodo
      : "7d";

  const ahora = new Date();
  const dias = periodo === "total" ? null : DIAS_PERIODO[periodo];
  const corte = dias ? new Date(ahora.getTime() - dias * DIA_MS) : null;
  const fetchDesde = dias ? new Date(ahora.getTime() - 2 * dias * DIA_MS) : null;

  const [crudas, notas, visitasHistoricas] = await Promise.all([
    getVisitasCrudas(fetchDesde),
    listNotasAdmin(),
    getVisitasPorNota(),
  ]);

  let actuales: VisitaCruda[] = crudas;
  let anteriores: VisitaCruda[] = [];
  if (corte) ({ actuales, anteriores } = partirPorCorte(crudas, corte));

  const totalPeriodo = actuales.length;
  const deltaPct =
    corte && anteriores.length > 0
      ? Math.round(((actuales.length - anteriores.length) / anteriores.length) * 100)
      : null;

  // Serie del gráfico: el período elegido, o desde la primera visita si es histórico.
  const inicioSerie =
    corte ??
    (actuales.length > 0
      ? new Date(actuales[0].visto_en)
      : new Date(ahora.getTime() - 13 * DIA_MS));
  const serie = serieDiaria(actuales, inicioSerie, ahora);
  const esSemanal = serie.length > 60;
  const serieGrafico: PuntoSerie[] = esSemanal ? agruparPorSemana(serie) : serie;
  const pico = mejorDia(serie);
  const promedioDiario = serie.length > 0 ? totalPeriodo / serie.length : 0;

  const visitasNota = porNota(actuales);
  const horas = porHora(actuales);
  const franja = franjaPico(horas);
  const dispositivos = porDispositivo(actuales);
  const fuentes = porFuente(actuales);

  const ranking = notas
    .map((n) => ({ nota: n, valor: visitasNota.get(n.id) ?? 0 }))
    .filter((x) => x.valor > 0)
    .sort((a, b) => b.valor - a.valor);
  const maxNota = Math.max(1, ...ranking.map((x) => x.valor));
  const notasConVisitas = ranking.length;

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        titulo="Estadísticas"
        descripcion="Visitas medidas por el contador propio del sitio. Un mismo lector cuenta una sola vez cada 30 minutos."
      />

      {/* Período: afecta a toda la página */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
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

      {/* ============ 1 · LA EVOLUCIÓN ============ */}
      <SeparadorSeccion titulo="La evolución" detalle={LABEL_PERIODO[periodo]} />

      <div className="brut-frame-shadow bg-[var(--color-paper-pure)] grid lg:grid-cols-[1fr_300px]">
        <div className="p-5 sm:p-6 min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45 mb-4">
            Visitas por {esSemanal ? "semana" : "día"}
          </p>
          <GraficoBarras
            serie={serieGrafico.map((p) => ({ label: p.label, valor: p.visitas }))}
            alto={190}
            tono="claro"
            ejeIzq={serieGrafico[0]?.label}
            ejeDer={serieGrafico[serieGrafico.length - 1]?.label}
            ariaLabel={`Visitas por ${esSemanal ? "semana" : "día"}, ${LABEL_PERIODO[periodo]}`}
          />
          <p className="font-body text-sm text-black/60 mt-4">
            {pico
              ? `El ${diaLargo(pico.dia)} fue el mejor día: ${pico.visitas} visita${pico.visitas === 1 ? "" : "s"}.`
              : "Sin visitas en este período todavía. El contador suma con cada lectura del sitio."}
          </p>
        </div>

        <div className="bg-[var(--color-ink)] text-white p-5 sm:p-6 flex flex-col gap-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
              Visitas · {LABEL_PERIODO[periodo]}
            </p>
            <p className="font-sports text-6xl leading-none mt-2 tabular-nums">{totalPeriodo}</p>
            {deltaPct !== null && dias && (
              <p className="mt-2 flex items-baseline gap-2">
                <Delta pct={deltaPct} contexto={`respecto de los ${dias} días anteriores`} />
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                  vs los {dias} días previos
                </span>
              </p>
            )}
          </div>
          <span aria-hidden className="border-t border-white/15" />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">Mejor día</p>
            <p className="font-body text-sm mt-1">
              {pico ? (
                <>
                  <span className="font-bold">{diaLargo(pico.dia)}</span>
                  <span className="text-white/60"> · {pico.visitas} visitas</span>
                </>
              ) : (
                <span className="text-white/40">Sin datos aún</span>
              )}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
              Promedio diario
            </p>
            <p className="font-sports text-2xl leading-none mt-1.5 tabular-nums">
              {promedioDiario < 10 ? promedioDiario.toFixed(1).replace(".", ",") : Math.round(promedioDiario)}
            </p>
          </div>
        </div>
      </div>

      {/* ============ 2 · QUÉ RINDE ============ */}
      <SeparadorSeccion titulo="Qué rinde" detalle="notas ordenadas por lecturas" />

      <section aria-label="Ranking de notas" className="brut-frame-shadow bg-[var(--color-paper-pure)] mb-6">
        <header className="bg-[var(--color-ink)] text-white px-4 py-2.5 flex items-baseline justify-between gap-3">
          <h3 className="font-sports uppercase tracking-[0.18em] text-xs">Ranking de notas</h3>
          {periodo !== "total" && (
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/45 hidden sm:inline">
              visitas del período · total histórico
            </span>
          )}
        </header>
        {ranking.length === 0 ? (
          <p className="px-4 py-8 font-body text-sm text-black/45">
            Sin visitas en este período todavía. El contador suma con cada lectura del sitio.
          </p>
        ) : (
          <ul>
            {ranking.map(({ nota, valor }, i) => (
              <li key={nota.id} className="border-b last:border-b-0 border-black/10">
                <Link
                  href={`/admin/notas/${nota.id}`}
                  className="flex items-center gap-4 px-4 py-3.5 hover:bg-[var(--color-river-red-soft)] transition-colors"
                >
                  <span
                    aria-hidden
                    className="font-sports text-2xl leading-none text-[var(--color-river-red)] w-9 shrink-0 tabular-nums"
                  >
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
                  <span className="shrink-0 text-right">
                    <span className="block font-sports text-xl tabular-nums text-[var(--color-river-red-deep)]">
                      {valor}
                    </span>
                    {periodo !== "total" && (
                      <span className="block font-mono text-[10px] tabular-nums text-black/40">
                        {visitasHistoricas.get(nota.id)?.total ?? valor} tot.
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid md:grid-cols-3 gap-6 items-stretch">
        <Modulo titulo="Por división">
          <FilasBarra
            filas={agrupar(notas, visitasNota, (n) => labelDivision(n.division))}
            vacio="Sin visitas en este período."
            conPorcentaje
          />
        </Modulo>
        <Modulo titulo="Por tipo">
          <FilasBarra
            filas={agrupar(notas, visitasNota, (n) => labelTipo(n.tipo))}
            vacio="Sin visitas en este período."
            conPorcentaje
          />
        </Modulo>
        <Modulo titulo="Por firma">
          <FilasBarra
            filas={agrupar(notas, visitasNota, (n) => n.autor.nombre)}
            vacio="Sin visitas en este período."
            conPorcentaje
          />
        </Modulo>
      </div>

      {/* ============ 3 · QUIÉN LEE ============ */}
      <SeparadorSeccion titulo="Quién lee" detalle="fuentes · dispositivos · horarios" />

      <div className="grid md:grid-cols-3 gap-6 items-stretch">
        <Modulo titulo="De dónde llegan">
          <FilasBarra
            filas={fuentes.map((f) => ({ label: f.fuente, valor: f.visitas }))}
            vacio="Sin visitas en este período."
            conPorcentaje
          />
        </Modulo>
        <Modulo titulo="Mobile vs desktop">
          <BarraDividida conteo={dispositivos} />
        </Modulo>
        <Modulo titulo="A qué hora leen">
          {horas.every((h) => h === 0) ? (
            <p className="px-4 py-5 font-body text-sm text-black/45">
              Sin visitas en este período todavía.
            </p>
          ) : (
            <div className="px-4 py-4">
              <GraficoBarras
                serie={horas.map((v, h) => ({ label: `${h} h`, valor: v }))}
                alto={64}
                tono="claro"
                ejeIzq="0 h"
                ejeDer="23 h"
                resaltados={
                  franja ? Array.from({ length: 4 }, (_, i) => (franja.desde + i) % 24) : undefined
                }
                ariaLabel="Visitas por hora del día"
              />
              {franja && (
                <p className="font-body text-[13px] text-black/60 mt-3">
                  Tu mejor ventana: <span className="font-bold">{franja.desde} a {franja.hasta} h</span>.
                </p>
              )}
            </div>
          )}
        </Modulo>
      </div>
    </div>
  );
}
