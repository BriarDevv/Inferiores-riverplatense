import Link from "next/link";
import {
  listNotasAdmin,
  listAutoresAdmin,
  getPerfilActual,
  type FiltrosAdmin,
} from "@/lib/admin/notas-admin";
import NotaAcciones from "@/components/admin/NotaAcciones";
import PageHeader from "@/components/admin/PageHeader";
import { getVisitasPorNota } from "@/lib/admin/stats";
import { DIVISIONES, TIPOS_NOTA, labelDivision, labelTipo, formatearFecha } from "@/lib/constants";
import type { EstadoNota } from "@/lib/types";

export const metadata = { title: "Notas — Panel" };

const ESTADOS: Array<{ value: EstadoNota; label: string }> = [
  { value: "publicada", label: "Publicadas" },
  { value: "programada", label: "Programadas" },
  { value: "borrador", label: "Borradores" },
];

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AdminNotas({ searchParams }: PageProps) {
  const params = await searchParams;
  const filtros: FiltrosAdmin = {
    estado: params.estado as EstadoNota | undefined,
    tipo: params.tipo,
    division: params.division,
    autor_id: params.autor,
    q: params.q,
  };

  const [notas, autores, perfil, visitas] = await Promise.all([
    listNotasAdmin(filtros),
    listAutoresAdmin(),
    getPerfilActual(),
    getVisitasPorNota(),
  ]);
  const hayFiltros = Boolean(
    params.estado || params.tipo || params.division || params.autor || params.q,
  );

  return (
    <div className="max-w-6xl">
      <PageHeader overline="Panel de redacción" titulo="Notas">
        <Link
          href="/admin/notas/nueva"
          className="brut-cta-red px-5 py-3 font-sports uppercase tracking-[0.15em] text-sm inline-block"
        >
          + Nueva nota
        </Link>
      </PageHeader>

      {/* Filtros (GET, sin JS) */}
      <form
        method="get"
        className="brut-frame bg-[var(--color-paper-pure)] px-4 py-4 flex flex-wrap items-end gap-3 mb-6"
      >
        <label className="flex flex-col gap-1">
          <span className="brut-label">Estado</span>
          <select name="estado" defaultValue={params.estado ?? ""} className="admin-input">
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="brut-label">Tipo</span>
          <select name="tipo" defaultValue={params.tipo ?? ""} className="admin-input">
            <option value="">Todos</option>
            {TIPOS_NOTA.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="brut-label">División</span>
          <select name="division" defaultValue={params.division ?? ""} className="admin-input">
            <option value="">Todas</option>
            {DIVISIONES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="brut-label">Firma</span>
          <select name="autor" defaultValue={params.autor ?? ""} className="admin-input">
            <option value="">Todas</option>
            {autores.map((a) => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 flex-1 min-w-40">
          <span className="brut-label">Buscar</span>
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Título, bajada o slug…"
            className="admin-input w-full"
          />
        </label>
        <button type="submit" className="brut-cta-ink px-4 py-2 font-sports uppercase tracking-widest text-sm">
          Filtrar
        </button>
        {hayFiltros && (
          <Link
            href="/admin/notas"
            className="font-mono text-xs uppercase tracking-widest text-black/50 hover:text-[var(--color-river-red-deep)] pb-2"
          >
            Limpiar
          </Link>
        )}
      </form>

      {/* Tabla */}
      <div className="brut-frame-shadow overflow-x-auto bg-[var(--color-paper-pure)]">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nota</th>
              <th>Estado</th>
              <th>Tipo</th>
              <th>División</th>
              <th>Firma</th>
              <th className="text-right">Visitas</th>
              <th>Fecha</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {notas.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-10 font-body text-black/50">
                  {hayFiltros
                    ? "Ninguna nota coincide con esos filtros."
                    : "Todavía no hay notas. Creá la primera."}
                </td>
              </tr>
            )}
            {notas.map((n) => (
              <tr key={n.id}>
                <td className="max-w-sm">
                  <Link href={`/admin/notas/${n.id}`} className="group block">
                    <span className="block font-display font-bold leading-snug group-hover:text-[var(--color-river-red-deep)] transition-colors">
                      {n.destacada && <span aria-label="Destacada" className="text-[var(--color-river-red)]">★ </span>}
                      {n.titulo}
                    </span>
                    <span className="font-mono text-[11px] text-black/40">/{n.slug}</span>
                  </Link>
                </td>
                <td><span className={`chip-estado chip-estado-${n.estado}`}>{n.estado}</span></td>
                <td className="font-body text-sm">{labelTipo(n.tipo)}</td>
                <td className="font-body text-sm">{labelDivision(n.division)}</td>
                <td className="font-body text-sm whitespace-nowrap">{n.autor.nombre}</td>
                <td className="font-mono text-xs text-right tabular-nums">
                  {visitas.get(n.id)?.total ?? 0}
                </td>
                <td className="font-mono text-xs whitespace-nowrap">
                  {n.publicada_en ? formatearFecha(n.publicada_en) : "—"}
                </td>
                <td>
                  <NotaAcciones
                    id={n.id}
                    estado={n.estado}
                    destacada={n.destacada ?? false}
                    esAdmin={perfil?.rol === "admin"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-black/40">
        {notas.length} nota{notas.length === 1 ? "" : "s"}
      </p>
    </div>
  );
}
