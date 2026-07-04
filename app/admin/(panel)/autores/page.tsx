import Link from "next/link";
import { listAutoresAdmin, getPerfilActual } from "@/lib/admin/notas-admin";

export const metadata = { title: "Autores — Panel" };

export default async function AdminAutores() {
  const [autores, perfil] = await Promise.all([listAutoresAdmin(), getPerfilActual()]);
  const esAdmin = perfil?.rol === "admin";

  return (
    <div className="max-w-5xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="overline mb-1">Panel de redacción</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Autores</h1>
          <p className="font-body text-sm text-black/60 mt-2 max-w-xl">
            Las firmas que aparecen en las notas del sitio. Una firma no necesita
            cuenta: podés crear la de un colaborador y firmar notas por él.
          </p>
        </div>
        {esAdmin && (
          <Link
            href="/admin/autores/nueva"
            className="brut-cta-red px-5 py-3 font-sports uppercase tracking-[0.15em] text-sm"
          >
            + Nueva firma
          </Link>
        )}
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {autores.map((a) => (
          <Link
            key={a.id}
            href={`/admin/autores/${a.id}`}
            className="brut-frame brut-hover bg-[var(--color-paper-pure)] p-5 flex flex-col items-start gap-3"
          >
            {a.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={a.avatar_url}
                alt=""
                className="w-16 h-16 rounded-full object-cover border-2 border-[var(--color-ink)]"
              />
            ) : (
              <span
                aria-hidden
                className="w-16 h-16 rounded-full bg-[var(--color-river-red)] text-white font-sports text-xl flex items-center justify-center"
              >
                {a.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </span>
            )}
            <span>
              <span className="block font-display text-xl font-bold leading-tight">{a.nombre}</span>
              <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-river-red-deep)]">
                {a.rol_publico ?? "Colaborador"}
              </span>
            </span>
            <span className="font-mono text-[11px] uppercase tracking-widest text-black/40 mt-auto">
              {a.notas_count} nota{a.notas_count === 1 ? "" : "s"} firmada{a.notas_count === 1 ? "" : "s"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
