import Link from "next/link";
import SelloEstado from "./SelloEstado";
import { formatearFecha } from "@/lib/constants";
import type { NotaAdmin } from "@/lib/admin/notas-admin";
import type { VisitasNota } from "@/lib/admin/stats";

const MAX_FILAS = 10;

interface NotasDeFirmaProps {
  autorId: string;
  notas: NotaAdmin[]; // ya filtradas por esta firma, orden reciente primero
  visitas: Map<string, VisitasNota>;
}

/** El historial de la firma: qué firmó, en qué estado está y cómo rinde. */
export default function NotasDeFirma({ autorId, notas, visitas }: NotasDeFirmaProps) {
  const filas = notas.slice(0, MAX_FILAS);

  return (
    <section
      aria-label="Notas que firmó"
      className="brut-frame-shadow bg-[var(--color-paper-pure)] flex flex-col"
    >
      <header className="bg-[var(--color-ink)] text-white px-4 py-2.5 flex items-center justify-between">
        <h2 className="font-sports uppercase tracking-[0.18em] text-xs">
          Las notas que firmó <span className="text-white/50">({notas.length})</span>
        </h2>
      </header>

      {filas.length === 0 ? (
        <p className="px-4 py-8 font-body text-sm text-black/45">
          Todavía no firmó notas. Cuando cargues una con esta firma, aparece acá.
        </p>
      ) : (
        <ul>
          {filas.map((n) => (
            <li key={n.id} className="border-b last:border-b-0 border-black/10">
              <Link
                href={`/admin/notas/${n.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-river-red-soft)] transition-colors"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-display font-bold leading-snug truncate">
                    {n.destacada && <span className="text-[var(--color-river-red)]">★ </span>}
                    {n.titulo}
                  </span>
                  <span className="flex items-center gap-2 mt-1">
                    <SelloEstado tipo={n.estado} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">
                      {n.publicada_en ? formatearFecha(n.publicada_en) : "sin fecha"}
                    </span>
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-mono text-sm tabular-nums text-[var(--color-river-red-deep)]">
                    {visitas.get(n.id)?.total ?? 0}
                  </span>
                  <span className="block font-mono text-[9px] uppercase tracking-widest text-black/35">
                    visitas
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {notas.length > 0 && (
        <footer className="border-t border-black/10 px-4 py-2.5 mt-auto">
          <Link
            href={`/admin/notas?autor=${autorId}`}
            className="font-mono text-[11px] uppercase tracking-widest text-black/50 hover:text-[var(--color-river-red-deep)] transition-colors"
          >
            Ver todas en Notas →
          </Link>
        </footer>
      )}
    </section>
  );
}
