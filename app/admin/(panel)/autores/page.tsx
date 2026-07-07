import Link from "next/link";
import Image from "next/image";
import PageHeader from "@/components/admin/PageHeader";
import PerfilCompleto from "@/components/admin/PerfilCompleto";
import { listAutoresAdmin, listNotasAdmin, getPerfilActual } from "@/lib/admin/notas-admin";
import { getVisitasPorNota } from "@/lib/admin/stats";

export const metadata = { title: "Autores — Panel" };

const DIA_MS = 86_400_000;

function ultimaFirmada(fechas: number[]): string | null {
  if (fechas.length === 0) return null;
  const dias = Math.floor((Date.now() - Math.max(...fechas)) / DIA_MS);
  if (dias <= 0) return "última hoy";
  if (dias === 1) return "última ayer";
  return `última hace ${dias} días`;
}

export default async function AdminAutores() {
  const [autores, notas, visitas, perfil] = await Promise.all([
    listAutoresAdmin(),
    listNotasAdmin(),
    getVisitasPorNota(),
    getPerfilActual(),
  ]);
  const esAdmin = perfil?.rol === "admin";

  const legajos = autores.map((a) => {
    const suyas = notas.filter((n) => n.autor.id === a.id);
    const visitasTotales = suyas.reduce((acc, n) => acc + (visitas.get(n.id)?.total ?? 0), 0);
    const fechas = suyas
      .map((n) => (n.publicada_en ? Date.parse(n.publicada_en) : null))
      .filter((f): f is number => f !== null && f <= Date.now());
    return { autor: a, cantidad: suyas.length, visitasTotales, ultima: ultimaFirmada(fechas) };
  });

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        titulo="Autores"
        descripcion="Las firmas que aparecen en las notas del sitio. Una firma no necesita cuenta: podés crear la de un colaborador y firmar notas por él."
      >
        {esAdmin && (
          <Link
            href="/admin/autores/nueva"
            className="brut-cta-red px-5 py-3 font-sports uppercase tracking-[0.15em] text-sm inline-block"
          >
            + Nueva firma
          </Link>
        )}
      </PageHeader>

      <div className="grid lg:grid-cols-2 gap-6 items-stretch">
        {legajos.map(({ autor: a, cantidad, visitasTotales, ultima }) => (
          <article
            key={a.id}
            className="brut-frame-shadow bg-[var(--color-paper-pure)] p-5 sm:p-6 flex flex-col min-w-0"
          >
            <div className="flex items-start gap-4 sm:gap-5 min-w-0">
              {a.avatar_url ? (
                <Image
                  src={a.avatar_url}
                  alt=""
                  width={96}
                  height={96}
                  unoptimized
                  className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-full object-cover border-2 border-[var(--color-ink)]"
                />
              ) : (
                <span
                  aria-hidden
                  className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-full bg-[var(--color-river-red)] text-white font-sports text-3xl flex items-center justify-center"
                >
                  {a.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-river-red-deep)]">
                  {a.rol_publico ?? "Colaborador"}
                </p>
                <h2 className="font-display text-xl sm:text-2xl font-bold leading-tight mt-0.5">
                  {a.nombre}
                </h2>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-black/50 mt-2">
                  {cantidad} nota{cantidad === 1 ? "" : "s"} ·{" "}
                  <span className="text-[var(--color-river-red-deep)]">
                    {visitasTotales} visita{visitasTotales === 1 ? "" : "s"}
                  </span>
                  {ultima && ` · ${ultima}`}
                </p>
                <div className="mt-2.5">
                  <PerfilCompleto autor={a} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-black/10">
              <Link
                href={`/admin/autores/${a.id}`}
                className="brut-cta-ink px-4 py-2 font-sports uppercase tracking-[0.14em] text-sm"
              >
                {esAdmin ? "Editar legajo" : "Ver legajo"}
              </Link>
              <a
                href={`/autor/${a.slug}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] uppercase tracking-widest text-black/50 hover:text-[var(--color-river-red-deep)] transition-colors"
              >
                Ver perfil público ↗
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
