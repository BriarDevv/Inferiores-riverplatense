import Link from "next/link";
import { listNotasAdmin, listAutoresAdmin } from "@/lib/admin/notas-admin";
import { labelTipo, formatearFecha } from "@/lib/constants";

export const metadata = { title: "Resumen — Panel" };

export default async function AdminResumen() {
  const [notas, autores] = await Promise.all([listNotasAdmin(), listAutoresAdmin()]);

  const publicadas = notas.filter((n) => n.estado === "publicada");
  const borradores = notas.filter((n) => n.estado === "borrador");
  const programadas = notas.filter((n) => n.estado === "programada");

  const stats = [
    { valor: publicadas.length, label: "Publicadas" },
    { valor: borradores.length, label: "Borradores" },
    { valor: programadas.length, label: "Programadas" },
    { valor: autores.length, label: "Firmas" },
  ];

  return (
    <div className="max-w-5xl">
      <header className="mb-8">
        <p className="overline mb-1">Panel de redacción</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold">Resumen</h1>
      </header>

      {/* Scoreboard */}
      <section aria-label="Números de la redacción" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="brut-frame bg-[var(--color-paper-pure)] px-4 py-5">
            <p className="font-sports text-4xl md:text-5xl leading-none text-[var(--color-river-red)]">
              {s.valor}
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] mt-2 text-black/60">
              {s.label}
            </p>
          </div>
        ))}
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Borradores para retomar */}
        <section aria-labelledby="h-borradores">
          <div className="flex items-baseline justify-between mb-3">
            <h2 id="h-borradores" className="brut-label">Para retomar</h2>
            <Link href="/admin/notas/nueva" className="font-mono text-xs text-[var(--color-river-red-deep)] hover:underline">
              + Nueva nota
            </Link>
          </div>
          <div className="brut-frame-shadow bg-[var(--color-paper-pure)]">
            {borradores.length === 0 ? (
              <p className="px-4 py-6 font-body text-sm text-black/50">
                No hay borradores. Empezá una nota nueva cuando quieras.
              </p>
            ) : (
              borradores.slice(0, 5).map((n) => (
                <Link
                  key={n.id}
                  href={`/admin/notas/${n.id}`}
                  className="block px-4 py-3 border-b last:border-b-0 border-black/10 hover:bg-[var(--color-river-red-soft)] transition-colors"
                >
                  <span className="block font-display font-bold leading-snug">{n.titulo}</span>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-black/50">
                    {labelTipo(n.tipo)} · {n.autor.nombre}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Últimas publicadas */}
        <section aria-labelledby="h-publicadas">
          <div className="flex items-baseline justify-between mb-3">
            <h2 id="h-publicadas" className="brut-label">Últimas publicadas</h2>
            <Link href="/admin/notas" className="font-mono text-xs text-[var(--color-river-red-deep)] hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="brut-frame-shadow bg-[var(--color-paper-pure)]">
            {publicadas.slice(0, 5).map((n) => (
              <Link
                key={n.id}
                href={`/admin/notas/${n.id}`}
                className="block px-4 py-3 border-b last:border-b-0 border-black/10 hover:bg-[var(--color-river-red-soft)] transition-colors"
              >
                <span className="block font-display font-bold leading-snug">{n.titulo}</span>
                <span className="font-mono text-[11px] uppercase tracking-widest text-black/50">
                  {formatearFecha(n.publicada_en)} · {n.autor.nombre}
                  {n.destacada ? " · ★ destacada" : ""}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
