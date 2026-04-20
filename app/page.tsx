import Link from "next/link";

export default function HomePage() {
  return (
    <main
      className="relative"
      style={{
        minHeight: "calc(100vh - 400px)",
        background: "var(--color-paper)",
      }}
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-24 lg:py-32">
        <div
          className="max-w-3xl"
          style={{
            borderLeft: "3px solid var(--color-river-red)",
            paddingLeft: "1.5rem",
          }}
        >
          <p
            className="font-mono text-[0.65rem] uppercase tracking-[0.22em] mb-4"
            style={{ color: "var(--color-river-red)" }}
          >
            § 00 · Estado del sitio
          </p>
          <h1
            className="font-display leading-[0.95] mb-6"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
              color: "var(--color-ink)",
              letterSpacing: "-0.03em",
            }}
          >
            En construcción{" "}
            <span style={{ fontStyle: "italic", color: "var(--color-river-red)" }}>
              editorial
            </span>
          </h1>
          <p
            className="text-lg leading-relaxed mb-8 max-w-xl"
            style={{ color: "var(--color-neutral-700)" }}
          >
            Portada vacía. La maqueta de secciones, grillas, filtros y notas
            vive por ahora en el playground interno.
          </p>
          <Link
            href="/ui"
            className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold tracking-wide"
            style={{
              background: "var(--color-river-red)",
              color: "var(--color-paper-pure)",
              border: "2px solid var(--color-ink)",
              boxShadow: "5px 5px 0 var(--color-ink)",
              transition: "all 120ms ease-out",
            }}
          >
            Abrir /ui →
          </Link>
        </div>
      </div>
    </main>
  );
}
