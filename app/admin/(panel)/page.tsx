import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import Delta from "@/components/admin/Delta";
import GraficoBarras from "@/components/admin/GraficoBarras";
import FilasBarra from "@/components/admin/FilasBarra";
import NotaDelMomento from "@/components/admin/NotaDelMomento";
import ProximasProgramadas from "@/components/admin/ProximasProgramadas";
import { listNotasAdmin, listAutoresAdmin, getPerfilActual } from "@/lib/admin/notas-admin";
import {
  getVisitasPorNota,
  getSerieDiaria,
  deltaDeSerie,
  getVisitasPorHora,
  franjaPico,
  getDispositivos,
  getFuentes,
} from "@/lib/admin/stats";
import { labelTipo, labelDivision, formatearFecha } from "@/lib/constants";
import type { NotaAdmin } from "@/lib/admin/notas-admin";

export const metadata = { title: "Resumen — Panel" };

const DIA_MS = 86_400_000;

/* --- Piezas locales --- */

function ListaNotas({
  titulo,
  vacio,
  notas,
  linkLabel,
  linkHref,
}: {
  titulo: string;
  vacio: string;
  notas: NotaAdmin[];
  linkLabel: string;
  linkHref: string;
}) {
  return (
    <section aria-label={titulo} className="brut-frame-shadow bg-[var(--color-paper-pure)] flex flex-col">
      <header className="bg-[var(--color-ink)] text-white px-4 py-2.5 flex items-center justify-between">
        <h2 className="font-sports uppercase tracking-[0.18em] text-xs">{titulo}</h2>
        <Link
          href={linkHref}
          className="font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-[var(--color-river-red)] transition-colors"
        >
          {linkLabel}
        </Link>
      </header>
      {notas.length === 0 ? (
        <p className="px-4 py-8 font-body text-sm text-black/45">{vacio}</p>
      ) : (
        <ul>
          {notas.map((n, i) => (
            <li key={n.id} className="border-b last:border-b-0 border-black/10">
              <Link
                href={`/admin/notas/${n.id}`}
                className="flex gap-3 px-4 py-3 hover:bg-[var(--color-river-red-soft)] transition-colors"
              >
                <span
                  aria-hidden
                  className="font-sports text-2xl leading-none text-[var(--color-river-red)] w-7 shrink-0 pt-0.5"
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display font-bold leading-snug">
                    {n.destacada && <span className="text-[var(--color-river-red)]">★ </span>}
                    {n.titulo}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">
                    {labelTipo(n.tipo)} · {labelDivision(n.division)} · {n.autor.nombre}
                    {n.publicada_en ? ` · ${formatearFecha(n.publicada_en)}` : ""}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function MiniModulo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section aria-label={titulo} className="brut-frame-shadow bg-[var(--color-paper-pure)] flex flex-col flex-1">
      <header className="bg-[var(--color-ink)] text-white px-4 py-2.5">
        <h2 className="font-sports uppercase tracking-[0.18em] text-xs">{titulo}</h2>
      </header>
      {/* Centrado vertical: si la fila estira el módulo, el contenido no queda flotando arriba */}
      <div className="flex-1 flex flex-col justify-center">{children}</div>
    </section>
  );
}

function ritmoDePublicacion(publicadas: NotaAdmin[]): React.ReactNode {
  const ahora = Date.now();
  const fechas = publicadas
    .map((n) => (n.publicada_en ? Date.parse(n.publicada_en) : null))
    .filter((f): f is number => f !== null && f <= ahora)
    .sort((a, b) => b - a);
  if (fechas.length === 0) return "Todavía no hay notas publicadas.";

  const dias = Math.floor((ahora - fechas[0]) / DIA_MS);
  const hoy = new Date();
  const esteMes = fechas.filter((f) => {
    const d = new Date(f);
    return d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear();
  }).length;
  const mes = hoy.toLocaleDateString("es-AR", { month: "long" });

  const ultima =
    dias === 0 ? "Última nota publicada hoy" : dias === 1 ? "Última nota ayer" : `Última nota hace ${dias} días`;
  return (
    <>
      {dias > 7 ? <span className="text-[var(--color-river-red-deep)]">{ultima}</span> : ultima}
      {" · "}
      {esteMes} nota{esteMes === 1 ? "" : "s"} en {mes}
    </>
  );
}

/* --- Página --- */

export default async function AdminResumen() {
  const [notas, autores, perfil, visitas, serie14, horas, dispositivos, fuentes] =
    await Promise.all([
      listNotasAdmin(),
      listAutoresAdmin(),
      getPerfilActual(),
      getVisitasPorNota(),
      getSerieDiaria(14),
      getVisitasPorHora(),
      getDispositivos(),
      getFuentes(),
    ]);

  const publicadas = notas.filter((n) => n.estado === "publicada");
  const borradores = notas.filter((n) => n.estado === "borrador");
  const programadas = notas.filter((n) => n.estado === "programada");
  const nombre = perfil?.firma ?? perfil?.email.split("@")[0] ?? "";

  const delta = deltaDeSerie(serie14);
  const publicadasSemana = publicadas.filter(
    (n) => n.publicada_en && Date.now() - Date.parse(n.publicada_en) < 7 * DIA_MS,
  ).length;

  // Top de la semana para "La nota del momento"
  const topSemana = publicadas
    .map((n) => ({ nota: n, visitas: visitas.get(n.id)?.ult_7d ?? 0 }))
    .filter((x) => x.visitas > 0)
    .sort((a, b) => b.visitas - a.visitas)
    .slice(0, 5);

  // Insight del gráfico: el mejor día de la quincena
  const mejorDia = serie14.reduce((a, b) => (b.visitas > a.visitas ? b : a));
  const insightGrafico =
    mejorDia.visitas === 0
      ? "Los primeros lectores van a aparecer acá."
      : `El ${new Date(`${mejorDia.dia}T12:00:00`).toLocaleDateString("es-AR", { weekday: "long" })} fue el mejor día: ${mejorDia.visitas} visita${mejorDia.visitas === 1 ? "" : "s"}.`;

  const pico = franjaPico(horas);
  const fmtDia = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString("es-AR", { day: "numeric", month: "short" });

  const numerosChicos = [
    { valor: publicadas.length, label: "Publicadas", extra: publicadasSemana > 0 ? `+${publicadasSemana} esta semana` : null },
    { valor: borradores.length, label: "Borradores", extra: null },
    { valor: programadas.length, label: "Programadas", extra: null },
    { valor: autores.length, label: "Firmas", extra: null },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        overline={`Hola, ${nombre}`}
        titulo="Resumen"
        descripcion={ritmoDePublicacion(publicadas)}
      >
        <Link
          href="/admin/notas/nueva"
          className="brut-cta-red px-5 py-3 font-sports uppercase tracking-[0.15em] text-sm inline-block"
        >
          + Nueva nota
        </Link>
      </PageHeader>

      {/* Franja tablero: números con contexto + visitas por día */}
      <section
        aria-label="Tablero de la semana"
        className="brut-frame-shadow-red bg-[var(--color-ink)] text-white grid lg:grid-cols-[1fr_minmax(300px,380px)] mb-6"
      >
        <div className="grid grid-cols-2">
          {/* El número que importa: visitas con su tendencia */}
          <div className="col-span-2 px-5 py-5 border-b border-white/15">
            <div className="flex items-baseline gap-3 flex-wrap">
              <p className="font-sports text-6xl md:text-7xl leading-none text-[var(--color-river-red)] tabular-nums">
                {delta.actual}
              </p>
              <Delta pct={delta.deltaPct} />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] mt-2 text-white/60">
              Visitas · últimos 7 días
            </p>
          </div>
          {numerosChicos.map((s, i) => (
            <div
              key={s.label}
              className={`px-5 py-4 ${i % 2 === 1 ? "border-l border-white/15" : ""} ${i < 2 ? "border-b border-white/15" : ""}`}
            >
              <p className="font-sports text-3xl leading-none tabular-nums">{s.valor}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] mt-1.5 text-white/60">
                {s.label}
                {s.extra && (
                  <span className="text-[#4ade80] normal-case tracking-normal"> · {s.extra}</span>
                )}
              </p>
            </div>
          ))}
        </div>

        <div className="px-5 py-5 border-t lg:border-t-0 lg:border-l border-white/15 flex flex-col">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60 mb-3">
            Visitas · últimos 14 días
          </p>
          <div className="flex-1 flex flex-col justify-end">
            <GraficoBarras
              serie={serie14.map((d) => ({ label: fmtDia(d.dia), valor: d.visitas }))}
              alto={104}
              tono="oscuro"
              ejeIzq={fmtDia(serie14[0].dia)}
              ejeDer="hoy"
              ariaLabel={`Visitas por día de los últimos 14 días. ${insightGrafico}`}
            />
          </div>
          <p className="font-body text-[13px] text-white/70 mt-3">{insightGrafico}</p>
        </div>
      </section>

      {/* La nota del momento + fuentes/dispositivo/horas */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-stretch mb-6">
        <NotaDelMomento top={topSemana} ultimaPublicada={publicadas[0] ?? null} />

        <div className="flex flex-col gap-6">
          <MiniModulo titulo="De dónde llegan">
            <FilasBarra
              filas={fuentes.map((f) => ({ label: f.fuente, valor: f.visitas }))}
              vacio="Con las próximas visitas se arma solo."
            />
          </MiniModulo>

          <MiniModulo titulo="Mobile vs. desktop">
            <FilasBarra
              filas={[
                { label: "Mobile", valor: dispositivos.mobile },
                { label: "Desktop", valor: dispositivos.desktop },
                { label: "Sin dato", valor: dispositivos.sinDato },
              ]}
              vacio="Con las próximas visitas se arma solo."
            />
          </MiniModulo>

          <MiniModulo titulo="A qué hora leen">
            {pico ? (
              <div className="px-4 py-3.5">
                <GraficoBarras
                  serie={horas.map((v, h) => ({ label: `${h} h`, valor: v }))}
                  alto={44}
                  tono="claro"
                  ejeIzq="0 h"
                  ejeDer="23 h"
                  ariaLabel={`Distribución horaria de visitas. Pico entre las ${pico.desde} y las ${pico.hasta}.`}
                />
                <p className="font-body text-[13px] text-black/55 mt-2.5">
                  La mayoría lee entre las {pico.desde} y las {pico.hasta}.
                </p>
              </div>
            ) : (
              <p className="px-4 py-5 font-body text-sm text-black/45">
                Con las próximas visitas se arma solo.
              </p>
            )}
          </MiniModulo>
        </div>
      </div>

      {/* Fila de trabajo */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        <ProximasProgramadas programadas={programadas} />
        <ListaNotas
          titulo="Para retomar"
          vacio="No hay borradores pendientes. Cuando guardes uno, te espera acá."
          notas={borradores.slice(0, 4)}
          linkLabel="Ver borradores"
          linkHref="/admin/notas?estado=borrador"
        />
        <ListaNotas
          titulo="Últimas publicadas"
          vacio="Todavía no hay notas publicadas."
          notas={publicadas.slice(0, 4)}
          linkLabel="Ver todas"
          linkHref="/admin/notas"
        />
      </div>
    </div>
  );
}
