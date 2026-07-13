import type { Autor } from "@/lib/types";
import { formatearFecha } from "@/lib/constants";
import AvatarAutor from "./AvatarAutor";

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
      <AvatarAutor autor={autor} size={avatarSize} />
      <span
        className="font-mono text-[0.65rem] uppercase tracking-[0.12em]"
        style={{ color: "var(--color-ink)" }}
      >
        {autor.nombre}
      </span>
      <span
        aria-hidden
        className="font-mono text-[0.65rem]"
        style={{ color: "var(--color-river-red-deep)" }}
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
