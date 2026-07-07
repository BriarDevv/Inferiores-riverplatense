"use client";

import { useState } from "react";
import Image from "next/image";
import { youtubeEmbedUrl } from "@/lib/video";
import { DuracionBadge, PlayBadge } from "./MediaBadges";

interface Props {
  youtubeId: string;
  titulo: string;
  posterUrl: string;
  duracionSeg?: number;
}

/**
 * Fachada del player: se muestra el poster (que ya está cargado como LCP)
 * y el iframe de YouTube recién se inyecta al click — cero JS de terceros
 * en la carga inicial. Dominio nocookie hasta que el lector interactúa.
 */
export default function YouTubeFacade({
  youtubeId,
  titulo,
  posterUrl,
  duracionSeg,
}: Props) {
  const [activo, setActivo] = useState(false);

  if (activo) {
    return (
      <iframe
        src={`${youtubeEmbedUrl(youtubeId)}?autoplay=1&rel=0`}
        title={titulo}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
        style={{ border: 0 }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActivo(true)}
      className="group absolute inset-0 cursor-pointer"
      aria-label={`Reproducir video: ${titulo}`}
    >
      <Image
        src={posterUrl}
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="(max-width: 768px) 100vw, 760px"
        style={{ objectFit: "cover" }}
      />
      <PlayBadge />
      {duracionSeg ? <DuracionBadge seg={duracionSeg} /> : null}
    </button>
  );
}
