import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import { listAutoresAdmin, getPerfilActual } from "@/lib/admin/notas-admin";

export const metadata = { title: "Autores — Panel" };

export default async function AdminAutores() {
  const [autores, perfil] = await Promise.all([listAutoresAdmin(), getPerfilActual()]);
  const esAdmin = perfil?.rol === "admin";

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        overline="Panel de redacción"
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

      <div className="grid lg:grid-cols-2 gap-6">
        {autores.map((a) => (
          <Link
            key={a.id}
            href={`/admin/autores/${a.id}`}
            className="brut-frame brut-hover-red bg-[var(--color-paper-pure)] p-5 sm:p-6 flex items-center gap-4 sm:gap-5 group min-w-0"
          >
            {a.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={a.avatar_url}
                alt=""
                className="w-24 h-24 shrink-0 rounded-full object-cover border-2 border-[var(--color-ink)]"
              />
            ) : (
              <span
                aria-hidden
                className="w-24 h-24 shrink-0 rounded-full bg-[var(--color-river-red)] text-white font-sports text-3xl flex items-center justify-center"
              >
                {a.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-river-red-deep)]">
                {a.rol_publico ?? "Colaborador"}
              </span>
              <span className="block font-display text-xl sm:text-2xl font-bold leading-tight mt-0.5 group-hover:text-[var(--color-river-red-deep)] transition-colors">
                {a.nombre}
              </span>
              {a.bio && (
                <span className="block font-body text-sm text-black/55 leading-snug mt-1 line-clamp-2">
                  {a.bio}
                </span>
              )}
              <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-black/40 mt-2">
                {a.notas_count} nota{a.notas_count === 1 ? "" : "s"} firmada{a.notas_count === 1 ? "" : "s"}
              </span>
            </span>
            <span
              aria-hidden
              className="font-sports text-xl text-black/20 group-hover:text-[var(--color-river-red)] group-hover:translate-x-1 transition-all shrink-0"
            >
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
