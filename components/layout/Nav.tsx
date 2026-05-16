"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const NAV_ITEMS = [
  { label: "Notas", href: "/" },
  { label: "Entrevistas", href: "/?tipo=entrevista" },
  { label: "Noticias", href: "/?tipo=noticia" },
  { label: "UI", href: "/ui" },
];

/** Tipos que cuentan como "Notas" para resaltar el item del nav. */
const NOTAS_TIPOS = new Set(["perfil", "cronica", "analisis", "columna"]);

/**
 * Nav brutalist — simple de 4 items.
 * Portfolio periodístico: Notas, Entrevistas, Sobre, Contacto.
 */
export default function Nav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tipo = searchParams.get("tipo");

  const isActive = (href: string): boolean => {
    if (href === "/") {
      return pathname === "/" && tipo !== null && NOTAS_TIPOS.has(tipo);
    }
    if (href === "/?tipo=entrevista") {
      return pathname === "/" && tipo === "entrevista";
    }
    if (href === "/?tipo=noticia") {
      return pathname === "/" && tipo === "noticia";
    }
    return pathname.startsWith(href);
  };

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "var(--color-paper-pure)",
        borderBottom: "4px solid var(--color-river-red)",
      }}
    >
      <div
        className="mx-auto max-w-[1440px] px-6 lg:px-10 h-20 grid items-center gap-6"
        style={{ gridTemplateColumns: "1fr auto 1fr" }}
      >
        {/* Logo (izquierda) */}
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0 justify-self-start leading-none"
          aria-label="Inferiores Riverplatense · Portada"
        >
          <Image
            src="/logo.webp"
            alt="Inferiores Riverplatense"
            width={48}
            height={48}
            priority
            className="shrink-0 block"
            style={{
              background: "var(--color-paper-pure)",
              borderRadius: "9999px",
            }}
          />
          <span
            className="hidden sm:flex font-display text-xl md:text-2xl items-center leading-none"
            style={{
              color: "var(--color-ink)",
              letterSpacing: "-0.02em",
              height: "48px",
            }}
          >
            <span className="inline-flex items-center">
              Inferiores
              <span
                className="ml-2"
                style={{
                  fontStyle: "italic",
                  color: "var(--color-river-red)",
                }}
              >
                Riverplatense
              </span>
            </span>
          </span>
        </Link>

        {/* Nav items (centro real) */}
        <nav
          className="hidden md:flex items-center gap-7 justify-self-center"
          aria-label="Navegación principal"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="font-sports text-sm"
                style={{
                  letterSpacing: "0.1em",
                  color: active
                    ? "var(--color-river-red)"
                    : "var(--color-ink)",
                  borderBottom: active
                    ? "2px solid var(--color-river-red)"
                    : "2px solid transparent",
                  paddingBottom: "3px",
                  transition: "color 120ms ease-out",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Newsletter CTA (derecha) */}
        <a
          href="#newsletter"
          className="hidden md:inline-flex font-sports items-center gap-2 shrink-0 justify-self-end brut-cta-red"
          style={{
            fontSize: "0.8rem",
            letterSpacing: "0.12em",
            padding: "0.6rem 1rem",
            textDecoration: "none",
          }}
        >
          Newsletter
          <span aria-hidden>→</span>
        </a>
      </div>
    </header>
  );
}
