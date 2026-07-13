import Image from "next/image";
import type { Autor } from "@/lib/types";

interface Props {
  autor: Autor;
  /** Lado del círculo en px. */
  size: number;
}

/**
 * Avatar circular del autor con fallback de iniciales (monograma rojo)
 * cuando no hay foto. Único punto de verdad del patrón: lo usan las cards,
 * el hero y la bio al pie de la nota.
 */
export default function AvatarAutor({ autor, size }: Props) {
  const borde = size >= 32 ? "2px" : "1.5px";

  if (autor.avatar_url) {
    return (
      <span
        className="relative inline-block shrink-0"
        style={{
          width: size,
          height: size,
          borderRadius: "9999px",
          overflow: "hidden",
          border: `${borde} solid var(--color-ink)`,
        }}
      >
        <Image
          src={autor.avatar_url}
          alt=""
          fill
          sizes={`${size}px`}
          style={{ objectFit: "cover" }}
        />
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center font-sports shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: "9999px",
        background: "var(--color-river-red)",
        color: "var(--color-paper-pure)",
        border: `${borde} solid var(--color-ink)`,
        fontSize: size >= 48 ? "1rem" : "0.6rem",
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
  );
}
