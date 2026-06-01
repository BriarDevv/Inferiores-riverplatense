import Image from "next/image";
import Link from "next/link";
import { DIVISIONES } from "@/lib/constants";

const SECCIONES = [
  { label: "Notas", href: "/" },
  { label: "Entrevistas", href: "/?tipo=entrevista" },
  { label: "Noticias", href: "/?tipo=noticia" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contacto", href: "/contacto" },
  { label: "UI / Design system", href: "/ui" },
];

export default function Footer() {
  return (
    <footer
      className="relative mt-24 overflow-hidden"
      style={{
        background: "var(--color-ink)",
        color: "var(--color-paper)",
        borderTop: "4px solid var(--color-river-red)",
      }}
    >
      <div className="grain absolute inset-0 pointer-events-none" aria-hidden />

      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-16 lg:py-20 relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Bloque identidad */}
          <div className="md:col-span-5 relative">
            <div className="flex items-center gap-4 mb-6">
              <Image
                src="/logo.webp"
                alt="Inferiores Riverplatense"
                width={72}
                height={72}
                className="shrink-0 block"
                style={{
                  background: "var(--color-paper-pure)",
                  borderRadius: "9999px",
                }}
              />
              <div
                className="flex flex-col gap-0.5 pl-4"
                style={{ borderLeft: "3px solid var(--color-river-red)" }}
              >
                <span
                  className="font-mono text-[0.6rem] uppercase tracking-[0.22em]"
                  style={{ color: "var(--color-river-red)" }}
                >
                  Inferiores
                </span>
                <span
                  className="font-display leading-[0.95]"
                  style={{
                    fontSize: "clamp(1.5rem, 2.6vw, 2rem)",
                    fontStyle: "italic",
                    color: "var(--color-paper-pure)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Riverplatense
                </span>
              </div>
            </div>
            <p
              className="max-w-md text-base leading-relaxed"
              style={{ color: "var(--color-neutral-300)" }}
            >
              Periodismo dedicado a las divisiones formativas del Club Atlético
              River Plate. Entrevistas, perfiles y crónicas desde adentro.
            </p>
          </div>

          {/* Bloque secciones */}
          <div className="md:col-span-3">
            <p
              className="font-mono text-[0.6rem] uppercase tracking-[0.22em] mb-4 pb-2"
              style={{
                color: "var(--color-river-red)",
                borderBottom: "2px solid var(--color-ink-contrast)",
              }}
            >
              Secciones
            </p>
            <ul
              className="space-y-2.5 font-sports text-sm"
              style={{ letterSpacing: "0.06em" }}
            >
              {SECCIONES.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="link-underline">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bloque divisiones */}
          <div className="md:col-span-4">
            <p
              className="font-mono text-[0.6rem] uppercase tracking-[0.22em] mb-4 pb-2"
              style={{
                color: "var(--color-river-red)",
                borderBottom: "2px solid var(--color-ink-contrast)",
              }}
            >
              Divisiones
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DIVISIONES.map((d) => (
                <Link
                  key={d.value}
                  href={`/?division=${d.value}`}
                  className="px-2 py-1.5 font-sports text-xs text-center transition-colors hover:bg-[var(--color-river-red)]"
                  style={{
                    border: "2px solid var(--color-ink-contrast)",
                    color: "var(--color-paper)",
                    letterSpacing: "0.06em",
                  }}
                >
                  {d.short}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Línea de cierre */}
        <div
          className="mt-14 pt-6 flex items-center justify-between gap-6 flex-wrap"
          style={{ borderTop: "1px solid var(--color-ink-contrast)" }}
        >
          <p
            className="font-mono text-[0.6rem] uppercase tracking-[0.22em]"
            style={{ color: "var(--color-neutral-300)" }}
          >
            © 2026 · Sitio periodístico independiente · Buenos Aires, Argentina
          </p>
          <Link
            href="#newsletter"
            className="font-mono text-[0.6rem] uppercase tracking-[0.18em] inline-flex items-center gap-2 transition-colors"
            style={{ color: "var(--color-paper)" }}
          >
            Suscribirme al newsletter
            <span aria-hidden style={{ color: "var(--color-river-red)" }}>
              →
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
