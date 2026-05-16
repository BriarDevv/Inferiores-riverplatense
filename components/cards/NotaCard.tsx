import Link from "next/link";
import Image from "next/image";
import type { Nota } from "@/lib/types";
import { formatearDuracion, labelDivision, labelTipo } from "@/lib/constants";
import CardAuthorMeta from "./CardAuthorMeta";

interface Props {
  nota: Nota;
  variant?: "short" | "youtube" | "articulo" | "auto";
  size?: "sm" | "md" | "lg";
}

export default function NotaCard({ nota, variant = "auto", size = "md" }: Props) {
  const resolved = variant === "auto" ? nota.formato : variant;

  if (resolved === "short") return <ShortCard nota={nota} size={size} />;
  if (resolved === "youtube") return <YouTubeCard nota={nota} size={size} />;
  return <ArticleCard nota={nota} size={size} />;
}

/* =========================================
   Helpers
   ========================================= */
const MEDIA_HOVER_SCALE = "group-hover:scale-[1.025]";
const MEDIA_TRANSITION = "transition-transform duration-[550ms] ease-out";

function DurationPill({ seconds }: { seconds: number }) {
  return (
    <div
      className="absolute top-0 right-0 px-2 py-1 text-[0.65rem] font-mono tabular-nums"
      style={{
        background: "var(--color-ink)",
        color: "var(--color-paper-pure)",
        borderLeft: "2px solid var(--color-ink)",
        borderBottom: "2px solid var(--color-ink)",
      }}
    >
      {formatearDuracion(seconds)}
    </div>
  );
}

function FormatoTag({ label }: { label: string }) {
  return (
    <div
      className="absolute top-0 left-0 px-2 py-1 text-[0.6rem] font-sports tabular-nums"
      style={{
        background: "var(--color-river-red)",
        color: "var(--color-paper-pure)",
        borderRight: "2px solid var(--color-ink)",
        borderBottom: "2px solid var(--color-ink)",
        letterSpacing: "0.12em",
      }}
    >
      {label}
    </div>
  );
}

function CardFooter({ nota }: { nota: Nota }) {
  return (
    <div
      className="p-5 flex flex-col gap-3"
      style={{ borderTop: "2px solid var(--color-ink)" }}
    >
      <p
        className="text-[0.65rem] font-mono uppercase tracking-[0.14em]"
        style={{ color: "var(--color-river-red)" }}
      >
        {labelTipo(nota.tipo)} · {labelDivision(nota.division)}
      </p>
      <h3
        className="font-display leading-[1.1]"
        style={{
          fontSize: "1.2rem",
          color: "var(--color-neutral-900)",
          letterSpacing: "-0.01em",
        }}
      >
        {nota.titulo}
      </h3>
      <CardAuthorMeta autor={nota.autor} publicada_en={nota.publicada_en} />
    </div>
  );
}

/* =========================================
   SHORT CARD (9:16)
   ========================================= */
function ShortCard({ nota }: { nota: Nota; size: "sm" | "md" | "lg" }) {
  return (
    <Link
      href="/"
      className="group block brut-hover-red"
      style={{ background: "var(--color-paper-pure)" }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: "9 / 16",
          background: "var(--color-ink)",
          borderBottom: "2px solid var(--color-ink)",
        }}
      >
        <Image
          src={nota.poster_url}
          alt={nota.titulo}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className={`object-cover ${MEDIA_TRANSITION} ${MEDIA_HOVER_SCALE}`}
        />
        <FormatoTag label="Short" />
        {nota.duracion_seg && <DurationPill seconds={nota.duracion_seg} />}
      </div>
      <CardFooter nota={nota} />
    </Link>
  );
}

/* =========================================
   YOUTUBE CARD (16:9)
   ========================================= */
function YouTubeCard({ nota, size }: { nota: Nota; size: "sm" | "md" | "lg" }) {
  const thumb = nota.youtube_id
    ? `https://i.ytimg.com/vi/${nota.youtube_id}/maxresdefault.jpg`
    : nota.poster_url;

  return (
    <Link
      href="/"
      className="group block brut-hover"
      style={{ background: "var(--color-paper-pure)" }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: "16 / 9",
          background: "var(--color-ink)",
          borderBottom: "2px solid var(--color-ink)",
        }}
      >
        <Image
          src={thumb}
          alt={nota.titulo}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover ${MEDIA_TRANSITION} ${MEDIA_HOVER_SCALE}`}
        />
        <FormatoTag label="Video" />
        {nota.duracion_seg && <DurationPill seconds={nota.duracion_seg} />}
      </div>
      <div
        className="p-5 flex flex-col gap-3"
        style={{ borderTop: "2px solid var(--color-ink)" }}
      >
        <p
          className="text-[0.65rem] font-mono uppercase tracking-[0.14em]"
          style={{ color: "var(--color-river-red)" }}
        >
          {labelTipo(nota.tipo)} · {labelDivision(nota.division)}
        </p>
        <h3
          className={`font-display leading-[1.1] ${size === "lg" ? "text-3xl" : "text-xl"}`}
          style={{
            color: "var(--color-neutral-900)",
            letterSpacing: "-0.015em",
          }}
        >
          {nota.titulo}
        </h3>
        <CardAuthorMeta autor={nota.autor} publicada_en={nota.publicada_en} />
      </div>
    </Link>
  );
}

/* =========================================
   ARTICLE CARD (4:5 portrait)
   ========================================= */
function ArticleCard({ nota, size }: { nota: Nota; size: "sm" | "md" | "lg" }) {
  return (
    <Link
      href="/"
      className="group brut-hover h-full flex flex-col"
      style={{ background: "var(--color-paper-pure)" }}
    >
      <div
        className="relative overflow-hidden shrink-0"
        style={{
          aspectRatio: "4 / 5",
          background: "var(--color-neutral-200)",
          borderBottom: "2px solid var(--color-ink)",
        }}
      >
        <Image
          src={nota.poster_url}
          alt={nota.titulo}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className={`object-cover ${MEDIA_TRANSITION} ${MEDIA_HOVER_SCALE}`}
        />
        <FormatoTag label="Nota" />
      </div>
      <div
        className="p-5 flex flex-col gap-3 flex-1"
        style={{ borderTop: "2px solid var(--color-ink)" }}
      >
        <p
          className="text-[0.65rem] font-mono uppercase tracking-[0.14em]"
          style={{ color: "var(--color-river-red)" }}
        >
          {labelTipo(nota.tipo)} · {labelDivision(nota.division)}
        </p>
        <h3
          className={`font-display leading-[1.1] ${size === "lg" ? "text-3xl" : "text-xl"}`}
          style={{
            color: "var(--color-neutral-900)",
            letterSpacing: "-0.015em",
          }}
        >
          {nota.titulo}
        </h3>
        <p
          className="text-sm leading-snug line-clamp-2"
          style={{ color: "var(--color-neutral-700)" }}
        >
          {nota.bajada}
        </p>
        <div className="mt-auto">
          <CardAuthorMeta autor={nota.autor} publicada_en={nota.publicada_en} />
        </div>
      </div>
    </Link>
  );
}
