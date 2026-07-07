import type { FuenteVideo } from "./types";

/**
 * Detección de links de video: el periodista pega la URL tal cual
 * (YouTube, TikTok, Instagram o un MP4 propio) y de acá salen la fuente
 * y los campos que persiste la nota (`youtube_id` / `video_url`).
 */
export interface VideoDetectado {
  fuente: FuenteVideo;
  youtube_id?: string;
  video_url?: string;
}

const YOUTUBE_ID =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/i;

/** TikTok/IG: los links de compartir vienen con tracking; se guarda la URL limpia. */
function sinQuery(url: string): string {
  return url.split(/[?#]/)[0];
}

export function parseVideoLink(input: string): VideoDetectado | null {
  const s = input.trim();
  if (!s) return null;

  const yt = s.match(YOUTUBE_ID);
  if (yt) return { fuente: "youtube", youtube_id: yt[1] };

  if (/tiktok\.com\//i.test(s)) {
    return { fuente: "tiktok", video_url: sinQuery(s) };
  }
  if (/instagram\.com\/(reels?|p)\//i.test(s)) {
    return { fuente: "instagram", video_url: sinQuery(s) };
  }
  // Cualquier otra URL (MP4 en Supabase Storage, etc.) = video propio.
  if (/^https?:\/\//i.test(s)) {
    return { fuente: "propio", video_url: s };
  }
  return null;
}

/** Embed sin cookies hasta que el lector interactúa con el player. */
export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

/** Segundos → duración ISO 8601 para el VideoObject (ej: 95 → "PT1M35S"). */
export function duracionISO(seg: number): string {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = seg % 60;
  return `PT${h > 0 ? `${h}H` : ""}${m > 0 ? `${m}M` : ""}${s}S`;
}
