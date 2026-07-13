import Link from "next/link";
import type { Autor } from "@/lib/types";
import { getAutorPorSlug } from "@/lib/autores";
import AvatarAutor from "@/components/cards/AvatarAutor";

interface Props {
  autor: Autor;
}

/** Bloque de autor al pie de la nota: foto + cargo + nombre + bio reales (DB), linkeado a /autor/[slug]. */
export default async function AuthorBio({ autor }: Props) {
  const ficha = autor.slug ? await getAutorPorSlug(autor.slug) : null;
  const bio = ficha?.bio ?? "Periodista de Inferiores Riverplatense.";
  const cargo = ficha?.rol_publico ?? "Redacción";

  return (
    <aside
      className="flex items-start gap-5 p-6 lg:p-7"
      style={{
        background: "var(--color-paper-pure)",
        border: "2px solid var(--color-ink)",
        boxShadow: "5px 5px 0 var(--color-ink)",
      }}
    >
      <AvatarAutor autor={autor} size={64} />
      <div className="min-w-0">
        <p
          className="font-mono text-[0.6rem] uppercase tracking-[0.2em] mb-1"
          style={{ color: "var(--color-river-red-deep)" }}
        >
          {cargo}
        </p>
        <p
          className="font-display mb-1.5"
          style={{
            fontSize: "1.3rem",
            letterSpacing: "-0.01em",
            color: "var(--color-ink)",
          }}
        >
          {autor.slug ? (
            <Link
              href={`/autor/${autor.slug}`}
              className="hover:text-[var(--color-river-red-deep)] transition-colors"
            >
              {autor.nombre}
            </Link>
          ) : (
            autor.nombre
          )}
        </p>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--color-neutral-700)" }}
        >
          {bio}
        </p>
        {autor.slug && (
          <Link
            href={`/autor/${autor.slug}`}
            className="inline-block mt-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] hover:underline"
            style={{ color: "var(--color-river-red-deep)" }}
          >
            Ver toda su cobertura →
          </Link>
        )}
      </div>
    </aside>
  );
}
