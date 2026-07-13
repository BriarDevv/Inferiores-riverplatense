import Image from "next/image";
import type { Nota } from "@/lib/types";
import { DuracionBadge, PlayBadge } from "./MediaBadges";
import YouTubeFacade from "./YouTubeFacade";

/**
 * Media principal del detalle de nota. Decide el tratamiento según los
 * datos de video:
 * - `youtube_id` (horizontal o short) → fachada + embed al click.
 * - short con `fuente: propio` → <video> nativo del MP4 de Storage.
 * - short de TikTok/Instagram → poster + link al post (los embeds de
 *   Meta/TikTok cargan ~1MB de JS de terceros; el contenido vive mejor allá).
 * - artículo, o video sin datos → el poster solo (con play decorativo).
 */
export default function MediaNota({ nota }: { nota: Nota }) {
  const esVertical = nota.formato === "short";
  const esVideo = esVertical || nota.formato === "youtube";
  const linkExterno =
    esVideo &&
    !nota.youtube_id &&
    (nota.fuente === "tiktok" || nota.fuente === "instagram") &&
    nota.video_url
      ? nota.video_url
      : null;
  const mp4Propio =
    esVideo && !nota.youtube_id && nota.fuente === "propio" && nota.video_url
      ? nota.video_url
      : null;

  const poster = (
    <Image
      src={nota.poster_url}
      alt={nota.titulo}
      fill
      priority
      fetchPriority="high"
      sizes="(max-width: 768px) 100vw, 760px"
      style={{ objectFit: "cover" }}
    />
  );

  return (
    <figure
      className="mb-9 relative overflow-hidden"
      style={{
        border: "2px solid var(--color-ink)",
        boxShadow: "8px 8px 0 var(--color-ink)",
        background: "var(--color-ink)",
        aspectRatio: esVertical ? "9 / 16" : "16 / 9",
        maxWidth: esVertical ? "380px" : undefined,
        marginInline: esVertical ? "auto" : undefined,
      }}
    >
      {esVideo && nota.youtube_id ? (
        <YouTubeFacade
          youtubeId={nota.youtube_id}
          titulo={nota.titulo}
          posterUrl={nota.poster_url}
          duracionSeg={nota.duracion_seg}
        />
      ) : mp4Propio ? (
        <video
          controls
          playsInline
          preload="none"
          poster={nota.poster_url}
          className="absolute inset-0 h-full w-full"
          style={{ objectFit: "cover" }}
        >
          <source src={mp4Propio} />
          Tu navegador no reproduce este video.
        </video>
      ) : linkExterno ? (
        <a
          href={linkExterno}
          target="_blank"
          rel="noopener noreferrer"
          className="group absolute inset-0"
        >
          <Image
            src={nota.poster_url}
            alt={nota.titulo}
            fill
            priority
            fetchPriority="high"
            // Un short se muestra a 380px, pero un 16:9 de TikTok/IG ocupa
            // el ancho completo de la columna de lectura.
            sizes={esVertical ? "(max-width: 768px) 100vw, 380px" : "(max-width: 768px) 100vw, 760px"}
            style={{ objectFit: "cover" }}
          />
          <PlayBadge />
          <span
            className="absolute bottom-0 left-0 px-3 py-1.5 font-sports text-xs"
            style={{
              background: "var(--color-river-red)",
              color: "var(--color-paper-pure)",
              borderRight: "2px solid var(--color-paper-pure)",
              borderTop: "2px solid var(--color-paper-pure)",
              letterSpacing: "0.14em",
            }}
          >
            Ver en {nota.fuente === "tiktok" ? "TikTok" : "Instagram"}{" "}
            <span aria-hidden>↗</span>
          </span>
          {nota.duracion_seg ? <DuracionBadge seg={nota.duracion_seg} /> : null}
        </a>
      ) : (
        <>
          {poster}
          {esVideo && <PlayBadge />}
          {nota.duracion_seg ? <DuracionBadge seg={nota.duracion_seg} /> : null}
        </>
      )}
    </figure>
  );
}
