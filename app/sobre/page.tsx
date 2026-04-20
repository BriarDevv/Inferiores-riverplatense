export const metadata = {
  title: "Sobre — Inferiores Riverplatense",
};

export default function SobrePage() {
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
          className="max-w-2xl"
          style={{
            borderLeft: "3px solid var(--color-river-red)",
            paddingLeft: "1.5rem",
          }}
        >
          <p
            className="font-mono text-[0.65rem] uppercase tracking-[0.22em] mb-4"
            style={{ color: "var(--color-river-red)" }}
          >
            § Sobre
          </p>
          <h1
            className="font-display leading-[0.95] mb-6"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
              color: "var(--color-ink)",
              letterSpacing: "-0.03em",
            }}
          >
            En construcción
          </h1>
          <p
            className="text-lg leading-relaxed"
            style={{ color: "var(--color-neutral-700)" }}
          >
            Acá va la bio del periodista: por qué arrancó con esto, su recorrido,
            su vínculo con las inferiores de River.
          </p>
        </div>
      </div>
    </main>
  );
}
