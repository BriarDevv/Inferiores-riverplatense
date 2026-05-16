import Image from "next/image";
import type { Autor } from "@/lib/types";
import { formatearFecha } from "@/lib/constants";

interface Props {
  autor: Autor;
  publicada_en: string;
  size?: "sm" | "md";
}

/** Avatar circular + nombre + fecha. Mismo formato para TeaserCard y NotaCard. */
export default function CardAuthorMeta({ autor, publicada_en, size = "sm" }: Props) {
  const avatarSize = size === "md" ? 28 : 24;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {autor.avatar_url ? (
        <span
          className="relative inline-block shrink-0"
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: "9999px",
            overflow: "hidden",
            border: "1.5px solid var(--color-ink)",
          }}
        >
          <Image
            src={autor.avatar_url}
            alt={autor.nombre}
            fill
            sizes={`${avatarSize}px`}
            style={{ objectFit: "cover" }}
          />
        </span>
      ) : (
        <span
          className="inline-flex items-center justify-center font-sports shrink-0"
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: "9999px",
            background: "var(--color-river-red)",
            color: "var(--color-paper-pure)",
            border: "1.5px solid var(--color-ink)",
            fontSize: "0.6rem",
            letterSpacing: "0.04em",
          }}
        >
          {autor.nombre
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </span>
      )}
      <span
        className="font-mono text-[0.65rem] uppercase tracking-[0.12em]"
        style={{ color: "var(--color-ink)" }}
      >
        {autor.nombre}
      </span>
      <span
        aria-hidden
        className="font-mono text-[0.65rem]"
        style={{ color: "var(--color-river-red)" }}
      >
        ·
      </span>
      <span
        className="font-mono text-[0.65rem] uppercase tracking-[0.12em]"
        style={{ color: "var(--color-neutral-500)" }}
      >
        {formatearFecha(publicada_en)}
      </span>
    </div>
  );
}
