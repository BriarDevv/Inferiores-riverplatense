import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import { listNotasAdmin, listAutoresAdmin, getPerfilActual } from "@/lib/admin/notas-admin";
import { getVisitasPorNota } from "@/lib/admin/stats";
import { labelTipo, labelDivision, formatearFecha } from "@/lib/constants";
import type { NotaAdmin } from "@/lib/admin/notas-admin";

export const metadata = { title: "Resumen — Panel" };

function ListaNotas({
  titulo,
  vacio,
  notas,
  linkLabel,
  linkHref,
  extra,
}: {
  titulo: string;
  vacio: string;
  notas: NotaAdmin[];
  linkLabel: string;
  linkHref: string;
  extra?: (n: NotaAdmin) => string | null;
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
                {extra?.(n) && (
                  <span className="shrink-0 font-mono text-xs text-[var(--color-river-red-deep)] pt-1">
                    {extra(n)}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function AdminResumen() {
  const [notas, autores, perfil, visitas] = await Promise.all([
    listNotasAdmin(),
    listAutoresAdmin(),
    getPerfilActual(),
    getVisitasPorNota(),
  ]);

  const publicadas = notas.filter((n) => n.estado === "publicada");
  const borradores = notas.filter((n) => n.estado === "borrador");
  const programadas = notas.filter((n) => n.estado === "programada");
  const nombre = perfil?.email.split("@")[0] ?? "";

  const visitas7d = [...visitas.values()].reduce((acc, v) => acc + v.ult_7d, 0);
  const masLeidas = publicadas
    .filter((n) => (visitas.get(n.id)?.total ?? 0) > 0)
    .sort((a, b) => (visitas.get(b.id)?.total ?? 0) - (visitas.get(a.id)?.total ?? 0))
    .slice(0, 5);

  const stats = [
    { valor: visitas7d, label: "Visitas · 7 días" },
    { valor: publicadas.length, label: "Publicadas" },
    { valor: borradores.length, label: "Borradores" },
    { valor: programadas.length, label: "Programadas" },
    { valor: autores.length, label: "Firmas" },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader overline={`Hola, ${nombre}`} titulo="La mesa, hoy">
        <Link
          href="/admin/notas/nueva"
          className="brut-cta-red px-5 py-3 font-sports uppercase tracking-[0.15em] text-sm inline-block"
        >
          + Nueva nota
        </Link>
      </PageHeader>

      {/* Marcador: un solo frame dividido, como tablero de resultados */}
      <section
        aria-label="Números de la redacción"
        className="brut-frame-shadow-red bg-[var(--color-ink)] text-white grid grid-cols-2 md:grid-cols-5 mb-10"
      >
        {stats.map((s, i) => {
          const bordes = [
            "",
            "border-l border-white/15",
            "border-t md:border-t-0 md:border-l border-white/15",
            "border-t md:border-t-0 border-l border-white/15",
            "border-t md:border-t-0 md:border-l border-white/15 col-span-2 md:col-span-1",
          ][i];
          return (
          <div key={s.label} className={`px-5 py-6 ${bordes}`}>
            <p className="font-sports text-5xl md:text-6xl leading-none text-[var(--color-river-red)]">
              {s.valor}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] mt-2.5 text-white/60">
              {s.label}
            </p>
          </div>
          );
        })}
      </section>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <ListaNotas
          titulo="Para retomar"
          vacio="No hay borradores pendientes. Cuando guardes uno, te espera acá."
          notas={borradores.slice(0, 5)}
          linkLabel="Ver borradores"
          linkHref="/admin/notas?estado=borrador"
        />
        <ListaNotas
          titulo="Últimas publicadas"
          vacio="Todavía no hay notas publicadas."
          notas={publicadas.slice(0, 5)}
          linkLabel="Ver todas"
          linkHref="/admin/notas"
        />
        <ListaNotas
          titulo="Más leídas"
          vacio="Las visitas empiezan a contarse apenas alguien abre una nota. Volvé en un rato."
          notas={masLeidas}
          linkLabel="Ver notas"
          linkHref="/admin/notas"
          extra={(n) => {
            const v = visitas.get(n.id);
            return v ? `${v.total} visita${v.total === 1 ? "" : "s"}` : null;
          }}
        />
      </div>
    </div>
  );
}
