import Link from "next/link";
import type { NotaAdmin } from "@/lib/admin/notas-admin";

interface ProximasProgramadasProps {
  programadas: NotaAdmin[];
}

function partesFecha(iso: string): { dia: string; mes: string; hora: string } {
  const d = new Date(iso);
  return {
    dia: d.toLocaleDateString("es-AR", { day: "2-digit" }),
    mes: d.toLocaleDateString("es-AR", { month: "short" }).replace(".", ""),
    hora: d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
  };
}

/** Mini agenda: lo que está por salir solo, ordenado por fecha. */
export default function ProximasProgramadas({ programadas }: ProximasProgramadasProps) {
  const proximas = [...programadas]
    .filter((n) => n.publicada_en)
    .sort((a, b) => Date.parse(a.publicada_en!) - Date.parse(b.publicada_en!))
    .slice(0, 5);

  return (
    <section
      aria-label="Próximas programadas"
      className="brut-frame-shadow bg-[var(--color-paper-pure)] flex flex-col"
    >
      <header className="bg-[var(--color-ink)] text-white px-4 py-2.5 flex items-center justify-between">
        <h2 className="font-sports uppercase tracking-[0.18em] text-xs">Próximas programadas</h2>
        <Link
          href="/admin/notas?estado=programada"
          className="font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-[var(--color-river-red)] transition-colors"
        >
          Ver todas
        </Link>
      </header>
      {proximas.length === 0 ? (
        <p className="px-4 py-8 font-body text-sm text-black/45">
          Nada programado. Podés dejar una nota lista con fecha desde el editor.
        </p>
      ) : (
        <ul>
          {proximas.map((n) => {
            const f = partesFecha(n.publicada_en!);
            return (
              <li key={n.id} className="border-b last:border-b-0 border-black/10">
                <Link
                  href={`/admin/notas/${n.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-river-red-soft)] transition-colors"
                >
                  <span className="shrink-0 w-11 text-center border-2 border-[var(--color-ink)] bg-[var(--color-paper)]">
                    <span className="block font-sports text-xl leading-none pt-1">{f.dia}</span>
                    <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--color-river-red-deep)] pb-1">
                      {f.mes}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display font-bold leading-snug truncate">
                      {n.titulo}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">
                      {f.hora} · {n.autor.nombre}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
