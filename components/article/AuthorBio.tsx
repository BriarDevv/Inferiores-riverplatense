import Image from "next/image";
import type { Autor } from "@/lib/types";

interface Props {
  autor: Autor;
}

const BIOS: Record<string, string> = {
  "autor-1":
    "Cubre las divisiones formativas de River desde adentro: notas, entrevistas y noticias de la cantera, de la Novena a la Primera.",
  "autor-2":
    "Colaboradora. Sigue de cerca el Femenino y las categorías menores del club.",
};

/** Bloque de autor al pie de la nota. Foto + nombre + bio + rol. */
export default function AuthorBio({ autor }: Props) {
  const bio = BIOS[autor.id] ?? "Periodista de Inferiores Riverplatense.";

  return (
    <aside
      className="flex items-start gap-5 p-6 lg:p-7"
      style={{
        background: "var(--color-paper-pure)",
        border: "2px solid var(--color-ink)",
        boxShadow: "5px 5px 0 var(--color-ink)",
      }}
    >
      {autor.avatar_url && (
        <span
          className="relative inline-block shrink-0"
          style={{
            width: 64,
            height: 64,
            borderRadius: "9999px",
            overflow: "hidden",
            border: "2px solid var(--color-ink)",
          }}
        >
          <Image
            src={autor.avatar_url}
            alt=""
            fill
            sizes="64px"
            style={{ objectFit: "cover" }}
          />
        </span>
      )}
      <div className="min-w-0">
        <p
          className="font-mono text-[0.6rem] uppercase tracking-[0.2em] mb-1"
          style={{ color: "var(--color-river-red-deep)" }}
        >
          {autor.rol === "admin" ? "Periodista" : "Colaboradora"}
        </p>
        <p
          className="font-display mb-1.5"
          style={{
            fontSize: "1.3rem",
            letterSpacing: "-0.01em",
            color: "var(--color-ink)",
          }}
        >
          {autor.nombre}
        </p>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--color-neutral-700)" }}
        >
          {bio}
        </p>
      </div>
    </aside>
  );
}
