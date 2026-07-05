import Link from "next/link";
import Image from "next/image";
import {
  listNotasAdmin,
  listAutoresAdmin,
  getPerfilActual,
  type FiltrosAdmin,
  type NotaAdmin,
} from "@/lib/admin/notas-admin";
import MenuAccionesNota from "@/components/admin/MenuAccionesNota";
import FiltrosNotas from "@/components/admin/FiltrosNotas";
import PageHeader from "@/components/admin/PageHeader";
import SelloEstado from "@/components/admin/SelloEstado";
import { getVisitasPorNota } from "@/lib/admin/stats";
import { labelDivision, labelTipo, formatearFecha } from "@/lib/constants";
import type { EstadoNota } from "@/lib/types";

export const metadata = { title: "Notas — Panel" };

const POR_PAGINA = 25;

type Orden = "fecha" | "visitas" | "titulo";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

/** Query string con overrides, para links de orden/paginación/chips. */
function conParams(
  actuales: Record<string, string | undefined>,
  cambios: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...actuales, ...cambios })) {
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `/admin/notas?${qs}` : "/admin/notas";
}

function ThOrdenable({
  campo,
  label,
  params,
  alineadoDerecha = false,
}: {
  campo: Orden;
  label: string;
  params: Record<string, string | undefined>;
  alineadoDerecha?: boolean;
}) {
  const activo = (params.orden ?? "fecha") === campo;
  const dir = activo && params.dir === "asc" ? "asc" : "desc";
  const proximaDir = activo && dir === "desc" ? "asc" : "desc";
  return (
    <th
      aria-sort={activo ? (dir === "asc" ? "ascending" : "descending") : undefined}
      className={alineadoDerecha ? "text-right" : undefined}
    >
      <Link
        href={conParams(params, { orden: campo, dir: proximaDir, pagina: undefined })}
        className={`inline-flex items-center gap-1 hover:text-[var(--color-river-red-soft)] transition-colors ${
          activo ? "text-white" : ""
        }`}
      >
        {label}
        <span aria-hidden className={activo ? "text-[var(--color-river-red)]" : "opacity-40"}>
          {activo ? (dir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </Link>
    </th>
  );
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

  const [todas, autores, perfil, visitas] = await Promise.all([
    listNotasAdmin(filtros),
    listAutoresAdmin(),
    getPerfilActual(),
    getVisitasPorNota(),
  ]);

  // Orden en memoria (el volumen del panel lo permite de sobra).
  const orden: Orden =
    params.orden === "visitas" || params.orden === "titulo" ? params.orden : "fecha";
  const dir = params.dir === "asc" ? 1 : -1;
  const valorFecha = (n: NotaAdmin) =>
    n.publicada_en ? Date.parse(n.publicada_en) : Number.MAX_SAFE_INTEGER;
  const ordenadas = [...todas].sort((a, b) => {
    if (orden === "titulo") return a.titulo.localeCompare(b.titulo, "es") * dir;
    if (orden === "visitas") {
      return ((visitas.get(a.id)?.total ?? 0) - (visitas.get(b.id)?.total ?? 0)) * dir;
    }
    return (valorFecha(a) - valorFecha(b)) * dir;
  });

  const total = ordenadas.length;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const pagina = Math.min(paginas, Math.max(1, Number(params.pagina) || 1));
  const notas = ordenadas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const desde = total === 0 ? 0 : (pagina - 1) * POR_PAGINA + 1;
  const hasta = Math.min(total, pagina * POR_PAGINA);

  // Chips de filtros activos
  const chips: Array<{ etiqueta: string; quitar: string }> = [];
  if (params.estado) {
    const label = { publicada: "Publicadas", programada: "Programadas", borrador: "Borradores" }[
      params.estado
    ];
    chips.push({ etiqueta: `Estado: ${label ?? params.estado}`, quitar: "estado" });
  }
  if (params.tipo) {
    chips.push({
      etiqueta: `Tipo: ${labelTipo(params.tipo as Parameters<typeof labelTipo>[0])}`,
      quitar: "tipo",
    });
  }
  if (params.division) {
    chips.push({
      etiqueta: `División: ${labelDivision(params.division as Parameters<typeof labelDivision>[0])}`,
      quitar: "division",
    });
  }
  if (params.autor) {
    const nombre = autores.find((a) => a.id === params.autor)?.nombre ?? "firma";
    chips.push({ etiqueta: `Firma: ${nombre}`, quitar: "autor" });
  }
  if (params.q) chips.push({ etiqueta: `Búsqueda: “${params.q}”`, quitar: "q" });

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader titulo="Notas">
        <Link
          href="/admin/notas/nueva"
          className="brut-cta-red px-5 py-3 font-sports uppercase tracking-[0.15em] text-sm inline-block"
        >
          + Nueva nota
        </Link>
      </PageHeader>

      <FiltrosYChips autores={autores} params={params} chips={chips} />

      {/* Tabla */}
      <div className="brut-frame-shadow overflow-x-auto bg-[var(--color-paper-pure)]">
        <table className="admin-table">
          <thead>
            <tr>
              <ThOrdenable campo="titulo" label="Nota" params={params} />
              <th>Estado</th>
              {/* En tablet estas dos columnas se ocultan (viven en filtros y cards mobile) */}
              <th className="hidden lg:table-cell">Tipo</th>
              <th className="hidden lg:table-cell">División</th>
              <th>Firma</th>
              <ThOrdenable campo="visitas" label="Visitas" params={params} alineadoDerecha />
              <ThOrdenable campo="fecha" label="Fecha" params={params} />
              <th className="text-right">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {notas.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 font-body text-black/50">
                  {chips.length > 0 ? (
                    <>
                      Ninguna nota coincide con esos filtros.
                      <span className="block mt-1 text-sm text-black/40">
                        Probá quitando alguno o ampliando la búsqueda.
                      </span>
                    </>
                  ) : (
                    "Todavía no hay notas. Creá la primera."
                  )}
                </td>
              </tr>
            )}
            {notas.map((n) => (
              <tr key={n.id}>
                <td className="max-w-md celda-principal">
                  <Link href={`/admin/notas/${n.id}`} className="group flex gap-3 items-start">
                    {n.poster_url ? (
                      <Image
                        src={n.poster_url}
                        alt=""
                        width={64}
                        height={48}
                        className="w-16 h-12 object-cover border border-black/20 shrink-0 hidden sm:block"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="sin-poster w-16 h-12 shrink-0 hidden sm:block"
                        title="Sin imagen principal"
                      />
                    )}
                    <span className="min-w-0">
                      <span className="block font-display font-bold leading-snug group-hover:text-[var(--color-river-red-deep)] transition-colors">
                        {n.destacada && (
                          <span aria-label="Destacada en portada" title="Destacada en portada" className="text-[var(--color-river-red)]">★ </span>
                        )}
                        {n.titulo}
                      </span>
                      <span className="flex flex-wrap items-center gap-2 mt-0.5">
                        {n.primicia && <SelloEstado tipo="primicia" />}
                        <span className="font-mono text-[11px] text-black/40">/{n.slug}</span>
                      </span>
                    </span>
                  </Link>
                </td>
                <td data-label="Estado">
                  <SelloEstado
                    tipo={n.estado}
                    detalle={n.estado === "programada" && n.publicada_en ? formatearFecha(n.publicada_en) : undefined}
                  />
                </td>
                <td data-label="Tipo" className="hidden lg:table-cell font-body text-sm">{labelTipo(n.tipo)}</td>
                <td data-label="División" className="hidden lg:table-cell font-body text-sm">{labelDivision(n.division)}</td>
                <td data-label="Firma" className="font-body text-sm whitespace-nowrap">
                  <span className="inline-flex items-center gap-2">
                    {n.autor.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={n.autor.avatar_url}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover border border-black/20"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="w-6 h-6 rounded-full bg-[var(--color-ink)] text-white font-sports text-[10px] flex items-center justify-center"
                      >
                        {n.autor.nombre.slice(0, 1)}
                      </span>
                    )}
                    {n.autor.nombre}
                  </span>
                </td>
                <td data-label="Visitas" className="font-mono text-xs text-right tabular-nums">
                  {visitas.get(n.id)?.total ?? 0}
                </td>
                <td data-label="Fecha" className="font-mono text-xs whitespace-nowrap">
                  {n.publicada_en ? formatearFecha(n.publicada_en) : "—"}
                </td>
                <td className="text-right celda-acciones">
                  <MenuAccionesNota
                    id={n.id}
                    slug={n.slug}
                    titulo={n.titulo}
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

      {/* Paginación */}
      <div className="mt-3 flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-widest text-black/50">
        <span>
          {total === 0 ? "0 notas" : `${desde}–${hasta} de ${total} nota${total === 1 ? "" : "s"}`}
        </span>
        {paginas > 1 && (
          <span className="flex items-center gap-1">
            {pagina > 1 ? (
              <Link
                href={conParams(params, { pagina: String(pagina - 1) })}
                aria-label="Página anterior"
                className="px-2.5 py-1 border-2 border-[var(--color-ink)] hover:bg-[var(--color-river-red-soft)] transition-colors"
              >
                ‹
              </Link>
            ) : (
              <span aria-hidden className="px-2.5 py-1 border-2 border-black/15 text-black/25">‹</span>
            )}
            <span className="px-2">
              {pagina} / {paginas}
            </span>
            {pagina < paginas ? (
              <Link
                href={conParams(params, { pagina: String(pagina + 1) })}
                aria-label="Página siguiente"
                className="px-2.5 py-1 border-2 border-[var(--color-ink)] hover:bg-[var(--color-river-red-soft)] transition-colors"
              >
                ›
              </Link>
            ) : (
              <span aria-hidden className="px-2.5 py-1 border-2 border-black/15 text-black/25">›</span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}

function FiltrosYChips({
  autores,
  params,
  chips,
}: {
  autores: Array<{ id: string; nombre: string }>;
  params: Record<string, string | undefined>;
  chips: Array<{ etiqueta: string; quitar: string }>;
}) {
  return (
    <div className="mb-6">
      <FiltrosNotas autores={autores.map((a) => ({ id: a.id, nombre: a.nombre }))} valores={params} />
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">
            {chips.length} filtro{chips.length === 1 ? "" : "s"}:
          </span>
          {chips.map((c) => (
            <Link
              key={c.quitar}
              href={conParams(params, { [c.quitar]: undefined, pagina: undefined })}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider px-2.5 py-1 border-2 border-[var(--color-ink)] bg-[var(--color-paper-pure)] hover:bg-[var(--color-river-red-soft)] transition-colors"
            >
              {c.etiqueta}
              <span aria-hidden className="text-[var(--color-river-red-deep)]">✕</span>
              <span className="sr-only">(quitar filtro)</span>
            </Link>
          ))}
          <Link
            href="/admin/notas"
            className="font-mono text-[11px] uppercase tracking-widest text-black/50 hover:text-[var(--color-river-red-deep)] transition-colors ml-1"
          >
            Limpiar todo
          </Link>
        </div>
      )}
    </div>
  );
}
