import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="flex items-center justify-center px-6 py-24 lg:py-32"
      style={{ background: "var(--color-paper)", minHeight: "100vh" }}
    >
      <div
        className="w-full max-w-xl p-10 lg:p-14 text-center"
        style={{
          background: "var(--color-paper-pure)",
          border: "2px solid var(--color-ink)",
          boxShadow: "8px 8px 0 var(--color-river-red)",
        }}
      >
        <p
          className="font-sports leading-none mb-4"
          style={{
            fontSize: "clamp(4rem, 14vw, 7rem)",
            color: "var(--color-river-red)",
            letterSpacing: "0.02em",
          }}
        >
          404
        </p>
        <h1
          className="font-display mb-4"
          style={{
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            letterSpacing: "-0.02em",
            color: "var(--color-ink)",
          }}
        >
          Esta nota se fue a préstamo.
        </h1>
        <p
          className="text-base leading-relaxed mb-8 mx-auto max-w-sm"
          style={{ color: "var(--color-neutral-700)" }}
        >
          La página que buscás no existe o todavía no está publicada. Volvé a la
          portada para seguir la cobertura de las inferiores.
        </p>
        <Link
          href="/"
          className="font-sports inline-flex items-center gap-2 brut-cta-red"
          style={{
            fontSize: "0.85rem",
            letterSpacing: "0.12em",
            padding: "0.8rem 1.4rem",
            textDecoration: "none",
          }}
        >
          Volver a la portada
          <span aria-hidden style={{ fontSize: "1rem" }}>
            →
          </span>
        </Link>
      </div>
    </main>
  );
}
