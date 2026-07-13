export type Division =
  | "primera"
  | "reserva"
  | "cuarta"
  | "quinta"
  | "sexta"
  | "septima"
  | "octava"
  | "novena"
  | "femenino";

export type TipoNota =
  | "entrevista"
  | "perfil"
  | "cronica"
  | "analisis"
  | "columna"
  | "noticia";

export type FormatoNota = "short" | "youtube" | "articulo";

export type FuenteVideo = "propio" | "youtube" | "instagram" | "tiktok";

export type SujetoTipo = "jugador" | "tecnico" | "equipo";

export type EstadoNota = "borrador" | "programada" | "publicada";

export interface Sujeto {
  tipo: SujetoTipo;
  id: string;
  slug?: string;          // para /jugador/[slug] (hub de seguimiento)
  nombre: string;
  division?: Division;
  bio?: string;           // bio corta para el hub
}

export interface Autor {
  id: string;
  nombre: string;
  rol: "admin" | "editor";
  avatar_url?: string;
  slug?: string;               // para /autor/[slug] (perfil público de la firma)
}

/** Partido que anuncia la barra roja del nav (singleton, cargado desde el panel). */
export interface ProximoPartido {
  rival: string;
  division: Division;
  fecha: string;               // ISO (timestamptz)
  torneo: string | null;
}

export interface Nota {
  id: string;
  slug: string;
  formato: FormatoNota;
  tipo: TipoNota;
  division: Division;
  titulo: string;
  bajada: string;
  contenido?: string;          // texto legacy del mock (párrafos separados por línea en blanco)
  cuerpo?: unknown;            // JSON de Tiptap (editor visual del panel); tiene prioridad sobre contenido
  fuente: FuenteVideo;
  video_url?: string;          // propio → URL del MP4 en Supabase Storage
  youtube_id?: string;         // formato youtube → solo el ID (ej: "dQw4w9WgXcQ")
  poster_url: string;          // imagen de preview
  duracion_seg?: number;       // para videos
  quote_overlay?: string;      // kinetic typography sobre el short
  autor: Autor;
  sujetos: Sujeto[];
  tags: string[];
  publicada_en: string;        // ISO date
  actualizada_en?: string;     // ISO date (si hubo edición posterior)
  destacada?: boolean;
  primicia?: boolean;          // "lo contamos primero"
  capitulos?: Array<{ tiempo: number; titulo: string }>;
}

export interface FiltrosNota {
  tipo?: TipoNota;
  division?: Division;
  formato?: FormatoNota;
  sujeto_id?: string;
  q?: string;              // búsqueda full-text (titulo/bajada/tags/sujetos/autor)
  tags?: string[];         // matchea si la nota tiene CUALQUIERA de estos tags
}
