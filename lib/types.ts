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
  | "columna";

export type FormatoNota = "short" | "youtube" | "articulo";

export type FuenteVideo = "propio" | "youtube" | "instagram" | "tiktok";

export type SujetoTipo = "jugador" | "tecnico" | "equipo";

export interface Sujeto {
  tipo: SujetoTipo;
  id: string;
  nombre: string;
  division?: Division;
}

export interface Autor {
  id: string;
  nombre: string;
  rol: "admin" | "editor";
  avatar_url?: string;
}

export interface Nota {
  id: string;
  slug: string;
  formato: FormatoNota;
  tipo: TipoNota;
  division: Division;
  titulo: string;
  bajada: string;
  contenido?: string;          // markdown/HTML para articulos
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
  destacada?: boolean;
  capitulos?: Array<{ tiempo: number; titulo: string }>;
}

export interface FiltrosNota {
  tipo?: TipoNota;
  division?: Division;
  formato?: FormatoNota;
  sujeto_id?: string;
  orden?: "recientes" | "populares";
}
