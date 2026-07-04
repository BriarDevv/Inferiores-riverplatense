"use client";

import TeaserCard from "@/components/cards/TeaserCard";
import type { Nota } from "@/lib/types";

interface PreviewCardNotaProps {
  titulo: string;
  slug: string;
  tipo: string;
  division: string;
  formato: string;
  posterUrl: string;
  youtubeId?: string;
  autor?: { id: string; nombre: string; avatar_url?: string };
}

/**
 * Muestra la TeaserCard REAL del sitio con los datos actuales del form:
 * responde "¿cómo se ve en la portada?" sin publicar nada.
 */
export default function PreviewCardNota({
  titulo,
  slug,
  tipo,
  division,
  formato,
  posterUrl,
  youtubeId,
  autor,
}: PreviewCardNotaProps) {
  const tieneImagen = Boolean(posterUrl || (formato === "youtube" && youtubeId));
  if (!tieneImagen) {
    return (
      <div className="sin-poster aspect-[4/3] flex items-center justify-center p-6 text-center">
        <p className="font-body text-sm text-black/50">
          Subí la imagen principal para ver cómo queda la card en la portada.
        </p>
      </div>
    );
  }

  const nota = {
    id: "preview",
    slug: slug || "preview",
    titulo: titulo.trim() || "Título de la nota",
    bajada: "",
    tipo,
    division,
    formato,
    fuente: "propio",
    poster_url: posterUrl,
    youtube_id: youtubeId,
    autor: autor ?? { id: "", nombre: "Sin firma", rol: "editor" },
    sujetos: [],
    tags: [],
    publicada_en: new Date().toISOString(),
  } as unknown as Nota;

  return (
    <div className="pointer-events-none brut-frame" aria-label="Vista previa de la card en portada">
      <TeaserCard nota={nota} />
    </div>
  );
}
