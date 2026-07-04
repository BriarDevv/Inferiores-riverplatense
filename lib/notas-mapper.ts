import type {
  Autor,
  Division,
  FormatoNota,
  FuenteVideo,
  Nota,
  Sujeto,
  SujetoTipo,
  TipoNota,
} from "./types";

/** Fila de `notas` con joins a autor y sujetos, tal como la devuelve Supabase. */
export interface NotaRow {
  id: string;
  slug: string;
  formato: FormatoNota;
  tipo: TipoNota;
  division: Division;
  titulo: string;
  bajada: string;
  contenido: string | null;
  fuente: FuenteVideo;
  video_url: string | null;
  youtube_id: string | null;
  poster_url: string;
  duracion_seg: number | null;
  quote_overlay: string | null;
  tags: string[];
  publicada_en: string;
  actualizada_en: string | null;
  destacada: boolean;
  primicia: boolean;
  capitulos: Array<{ tiempo: number; titulo: string }> | null;
  autor: { id: string; nombre: string; rol: Autor["rol"]; foto_url: string | null };
  nota_sujetos: Array<{
    sujeto: {
      id: string;
      tipo: SujetoTipo;
      nombre: string;
      slug: string | null;
      division: Division | null;
      bio: string | null;
    };
  }>;
}

export function mapRowToNota(row: NotaRow): Nota {
  const sujetos: Sujeto[] = row.nota_sujetos.map(({ sujeto: s }) => ({
    id: s.id,
    tipo: s.tipo,
    nombre: s.nombre,
    slug: s.slug ?? undefined,
    division: s.division ?? undefined,
    bio: s.bio ?? undefined,
  }));

  return {
    id: row.id,
    slug: row.slug,
    formato: row.formato,
    tipo: row.tipo,
    division: row.division,
    titulo: row.titulo,
    bajada: row.bajada,
    contenido: row.contenido ?? undefined,
    fuente: row.fuente,
    video_url: row.video_url ?? undefined,
    youtube_id: row.youtube_id ?? undefined,
    poster_url: row.poster_url,
    duracion_seg: row.duracion_seg ?? undefined,
    quote_overlay: row.quote_overlay ?? undefined,
    autor: {
      id: row.autor.id,
      nombre: row.autor.nombre,
      rol: row.autor.rol,
      avatar_url: row.autor.foto_url ?? undefined,
    },
    sujetos,
    tags: row.tags,
    publicada_en: row.publicada_en,
    actualizada_en: row.actualizada_en ?? undefined,
    destacada: row.destacada,
    primicia: row.primicia,
    capitulos: row.capitulos ?? undefined,
  };
}
