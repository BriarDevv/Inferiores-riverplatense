"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const NAV_ITEMS = [
  { label: "Notas", href: "/" },
  { label: "Entrevistas", href: "/?tipo=entrevista" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contacto", href: "/contacto" },
];

/**
 * Nav brutalist — simple de 4 items.
 * Portfolio periodístico: Notas, Entrevistas, Sobre, Contacto.
 */
export default function Nav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tipo = searchParams.get("tipo");

  const isActive = (href: string): boolean => {
    if (href === "/") return pathname === "/" && !tipo;
    if (href === "/?tipo=entrevista") {
      return pathname === "/" && tipo === "entrevista";
    }
    return pathname.startsWith(href);
  };

  return (
    <header
      className="relative w-full"
      style={{
        background: "var(--color-paper-pure)",
        borderBottom: "4px solid var(--color-river-red)",
      }}
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 h-20 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0"
          aria-label="Inferiores Riverplatense · Portada"
        >
          <span
            className="inline-flex items-center justify-center w-10 h-10 font-display italic text-2xl leading-none shrink-0"
            style={{
              background: "var(--color-river-red)",
              color: "var(--color-paper-pure)",
              border: "2px solid var(--color-ink)",
              boxShadow: "4px 4px 0 var(--color-ink)",
            }}
          >
            I
          </span>
          <span
            className="font-display text-xl md:text-2xl leading-none"
            style={{
              color: "var(--color-ink)",
              letterSpacing: "-0.02em",
            }}
          >
            Inferiores{" "}
            <span
              style={{
                fontStyle: "italic",
                color: "var(--color-river-red)",
              }}
            >
              Riverplatense
            </span>
          </span>
        </Link>

        {/* Nav items */}
        <nav
          className="hidden md:flex items-center gap-7"
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
      </div>
    </header>
  );
}
