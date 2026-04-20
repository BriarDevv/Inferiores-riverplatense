import NotaCard from "@/components/cards/NotaCard";
import BrutalistButton from "@/components/ui/BrutalistButton";
import { MOCK_NOTAS } from "@/lib/mock-data";
import UiDropdownDemo from "./_components/UiDropdownDemo";

export const metadata = {
  title: "UI — Inferiores Riverplatense",
  description: "Sistema de diseño definido — tokens, tipografía, componentes.",
};

const SECCIONES = [
  { id: "paleta-river", label: "Paleta River" },
  { id: "tokens", label: "Tokens" },
  { id: "tipografia", label: "Tipografía" },
  { id: "botones", label: "Botones" },
  { id: "chips", label: "Chips / Meta" },
  { id: "dropdowns", label: "Dropdowns" },
  { id: "cards", label: "NotaCard" },
  { id: "quotes", label: "PullQuote" },
  { id: "separadores", label: "Separadores" },
];

export default function UiPage() {
  const notaShort = MOCK_NOTAS.find((n) => n.formato === "short")!;
  const notaYoutube = MOCK_NOTAS.find((n) => n.formato === "youtube")!;
  const notaArticulo = MOCK_NOTAS.find((n) => n.formato === "articulo")!;

  return (
    <div className="py-16 lg:py-20" style={{ background: "var(--color-paper)" }}>
      {/* Hero corto de la página */}
      <header className="mx-auto max-w-[1440px] px-6 lg:px-10 mb-16">
        <div className="overline mb-4">Sistema de diseño · Definido</div>
        <h1
          className="font-display mb-4"
          style={{ fontSize: "clamp(3rem, 1.5rem + 5vw, 5.5rem)", lineHeight: 1 }}
        >
          UI
        </h1>
        <p
          className="text-subtitle max-w-2xl"
          style={{ color: "var(--color-neutral-700)" }}
        >
          Tokens, tipografías y componentes del sistema. Solo lo que ya quedó
          definido y está aplicado al sitio.
        </p>
      </header>

      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-12">
        {/* Índice sticky */}
        <aside className="hidden lg:block">
          <nav
            className="sticky top-24 flex flex-col gap-1 font-mono text-[0.7rem] uppercase tracking-[0.14em]"
            aria-label="Índice UI"
          >
            <span
              className="mb-2 text-[0.6rem]"
              style={{ color: "var(--color-neutral-500)" }}
            >
              Índice
            </span>
            {SECCIONES.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="py-2 border-l-2 pl-3 transition-colors hover:border-l-[color:var(--color-river-red)]"
                style={{
                  borderColor: "var(--color-neutral-200)",
                  color: "var(--color-neutral-700)",
                }}
              >
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Contenido */}
        <main className="space-y-24">
          {/* ===== PALETA OFICIAL RIVER PLATE ===== */}
          <Section
            id="paleta-river"
            overline="00"
            titulo="Paleta oficial Club Atlético River Plate"
          >
            <p
              className="mb-8 text-sm max-w-2xl"
              style={{ color: "var(--color-neutral-700)" }}
            >
              Tres colores base oficiales del club. Fuente:{" "}
              <a
                href="https://sportsfancovers.com/superliga-argentina-color-codes/club-atletico-river-plate-team-colors/"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline"
                style={{ color: "var(--color-river-red)" }}
              >
                sportsfancovers.com
              </a>
              .
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BrandSwatch
                name="River Red"
                hex="#EB192E"
                rgb="235, 25, 46"
                cmyk="1, 100, 90, 0"
                pantone="PMS 1788 C"
                bg="#EB192E"
                fg="#FFFFFF"
              />
              <BrandSwatch
                name="River Black"
                hex="#000000"
                rgb="0, 0, 0"
                cmyk="70, 50, 50, 100"
                pantone="Process Black C"
                bg="#000000"
                fg="#FFFFFF"
              />
              <BrandSwatch
                name="River White"
                hex="#FFFFFF"
                rgb="255, 255, 255"
                cmyk="0, 0, 0, 0"
                pantone="—"
                bg="#FFFFFF"
                fg="#000000"
                bordered
              />
            </div>
          </Section>

          {/* ===== TOKENS ===== */}
          <Section id="tokens" overline="01" titulo="Tokens de color">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Swatch name="River Red" cssVar="--color-river-red" hex="#EB192E" />
              <Swatch name="River Red Deep" cssVar="--color-river-red-deep" hex="#C21020" />
              <Swatch name="Ink" cssVar="--color-ink" hex="#0A0A0A" />
              <Swatch name="Ink Elevated" cssVar="--color-ink-elevated" hex="#141414" />
              <Swatch name="Paper" cssVar="--color-paper" hex="#FAFAF7" />
              <Swatch name="Paper Pure" cssVar="--color-paper-pure" hex="#FFFFFF" />
              <Swatch name="Neutral 900" cssVar="--color-neutral-900" hex="#111113" />
              <Swatch name="Neutral 500" cssVar="--color-neutral-500" hex="#6B6B72" />
            </div>
          </Section>

          {/* ===== TIPOGRAFÍA ===== */}
          <Section
            id="tipografia"
            overline="02"
            titulo="Tipografía · stack aplicado"
          >
            <p
              className="mb-10 text-sm max-w-2xl"
              style={{ color: "var(--color-neutral-700)" }}
            >
              Combo final: <strong>Newsreader</strong> (display + pull quotes) +{" "}
              <strong>Anton</strong> (sports / scores) + <strong>Inter</strong>{" "}
              (body) + <strong>JetBrains Mono</strong> (meta).
            </p>
            <div className="space-y-10">
              <div>
                <Muted label="Display · Newsreader · text-hero" />
                <p className="font-display text-hero" style={{ lineHeight: 0.95 }}>
                  Inferiores
                </p>
              </div>
              <div>
                <Muted label="Display · Newsreader · text-title" />
                <p className="font-display text-title">Un título editorial</p>
              </div>
              <div>
                <Muted label="Display · Newsreader · italic" />
                <p
                  className="font-display text-title"
                  style={{ fontStyle: "italic", color: "var(--color-river-red)" }}
                >
                  Riverplatense
                </p>
              </div>
              <div>
                <Muted label="Body · Inter · 1.0625rem" />
                <p className="max-w-[68ch]" style={{ color: "var(--color-neutral-900)" }}>
                  El pibe llegó a los once con una zurda que parecía de jugador
                  de veinticinco. Lo vio por primera vez Miguel, en una cancha de
                  tierra, con el viento cruzado y un arco sin redes.
                </p>
              </div>
              <div>
                <Muted label="Sports · Anton · score callout (solo números/marcadores)" />
                <p
                  className="font-sports text-5xl"
                  style={{ color: "var(--color-neutral-900)" }}
                >
                  River 3 — 0 Boca
                </p>
              </div>
              <div>
                <Muted label="Mono · JetBrains Mono · meta" />
                <p
                  className="font-mono text-xs uppercase tracking-[0.14em]"
                  style={{ color: "var(--color-neutral-500)" }}
                >
                  Por Periodista River · 18 Abr · 1:27
                </p>
              </div>
              <div>
                <Muted label="Overline (rojo)" />
                <p className="overline">Entrevista · Reserva · Nuevo</p>
              </div>
            </div>
          </Section>

          {/* ===== BOTONES — Brutalist (estética definida) ===== */}
          <Section id="botones" overline="03" titulo="Botones · Brutalist">
            <p
              className="mb-10 text-sm max-w-2xl"
              style={{ color: "var(--color-neutral-700)" }}
            >
              Borde 2px + offset shadow pixel-perfect. Se aplasta al hover (shadow
              5px → 2px) y el botón se mueve 3px. Adaptive: sobre paper usa
              borde/sombra ink, sobre ink usa borde/sombra paper.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0" style={{ border: "1px solid var(--color-neutral-200)" }}>
              {/* Sobre paper */}
              <div
                className="p-10 flex flex-wrap items-center gap-6"
                style={{ background: "var(--color-paper)" }}
              >
                <span
                  className="font-mono text-[0.55rem] uppercase tracking-[0.18em] w-full mb-2"
                  style={{ color: "var(--color-neutral-500)" }}
                >
                  Sobre paper
                </span>
                <BrutalistButton>Ver la nota →</BrutalistButton>
                <BrutalistButton variant="ghost">Ghost</BrutalistButton>
                <BrutalistButton size="sm">Chico</BrutalistButton>
                <BrutalistButton size="lg">Grande</BrutalistButton>
              </div>

              {/* Sobre ink */}
              <div
                className="p-10 flex flex-wrap items-center gap-6"
                style={{ background: "var(--color-ink)" }}
              >
                <span
                  className="font-mono text-[0.55rem] uppercase tracking-[0.18em] w-full mb-2"
                  style={{ color: "var(--color-neutral-500)" }}
                >
                  Sobre ink
                </span>
                <BrutalistButton onDark>Ver la nota →</BrutalistButton>
                <BrutalistButton variant="ghost" onDark>Ghost</BrutalistButton>
                <BrutalistButton size="sm" onDark>Chico</BrutalistButton>
                <BrutalistButton size="lg" onDark>Grande</BrutalistButton>
              </div>
            </div>
          </Section>

          {/* ===== CHIPS / META ===== */}
          <Section id="chips" overline="04" titulo="Chips y meta">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <button className="chip">Default</button>
                <button className="chip" data-active="true">
                  Activo
                </button>
                <button className="chip">
                  <span
                    className="text-[0.6rem] font-mono uppercase tracking-wider"
                    style={{ color: "var(--color-river-red)" }}
                  >
                    Jugador
                  </span>
                  Franco Mastantuono
                </button>
              </div>
              <div
                className="p-4 flex flex-wrap items-center gap-4"
                style={{
                  border: "2px solid var(--color-ink)",
                  background: "var(--color-paper-pure)",
                }}
              >
                <span className="overline">Entrevista · Reserva</span>
                <span
                  className="font-mono text-[0.7rem] uppercase tracking-[0.14em]"
                  style={{ color: "var(--color-neutral-500)" }}
                >
                  Periodista River · 18 Abr · 1:27
                </span>
              </div>
            </div>
          </Section>

          {/* ===== DROPDOWNS ===== */}
          <Section id="dropdowns" overline="05" titulo="Dropdowns">
            <UiDropdownDemo />
          </Section>

          {/* ===== CARDS ===== */}
          <Section id="cards" overline="06" titulo="NotaCard · tres variantes">
            <p
              className="mb-8 text-sm max-w-2xl"
              style={{ color: "var(--color-neutral-700)" }}
            >
              Un solo componente, tres variantes visuales según{" "}
              <code className="font-mono text-[0.8rem]">formato</code>. Frame
              2px ink + offset shadow al hover.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <VariantLabel>Short (9:16)</VariantLabel>
                <NotaCard nota={notaShort} />
              </div>
              <div>
                <VariantLabel>YouTube (16:9)</VariantLabel>
                <NotaCard nota={notaYoutube} />
              </div>
              <div>
                <VariantLabel>Artículo (4:5)</VariantLabel>
                <NotaCard nota={notaArticulo} />
              </div>
            </div>
          </Section>

          {/* ===== PULL QUOTE ===== */}
          <Section id="quotes" overline="07" titulo="Pull quote">
            <blockquote className="pull-quote max-w-[68ch]">
              "Cuando te ponés esta camiseta, nada es por casualidad. Es casi como
              firmar algo sin papeles."
            </blockquote>
            <p
              className="mt-4 font-mono text-xs uppercase tracking-[0.14em]"
              style={{ color: "var(--color-neutral-500)" }}
            >
              — Franco Mastantuono · Entrevista 17 Abr
            </p>
          </Section>

          {/* ===== SEPARADORES ===== */}
          <Section id="separadores" overline="08" titulo="Separadores">
            <div className="space-y-8">
              <div>
                <Muted label="Hairline sobre paper" />
                <div className="hairline" />
              </div>
              <div>
                <Muted label="Hairline sobre ink (inverso)" />
                <div className="p-6" style={{ background: "var(--color-ink)" }}>
                  <div className="hairline-dark" />
                </div>
              </div>
              <div>
                <Muted label="Overline con línea roja" />
                <div className="overline flex items-center gap-3">
                  <span
                    className="block w-8 h-[2px]"
                    style={{ background: "var(--color-river-red)" }}
                  />
                  Seguí bajando
                </div>
              </div>
              <div>
                <Muted label="Brut label (etiqueta de sección)" />
                <div className="brut-label">03 · Archivo completo</div>
              </div>
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}

/* =========================================
   Helpers de presentación
   ========================================= */
function Section({
  id,
  overline,
  titulo,
  children,
}: {
  id: string;
  overline: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="flex items-baseline gap-6 mb-8">
        <span
          className="font-mono text-xs tabular-nums"
          style={{ color: "var(--color-river-red)" }}
        >
          /{overline}
        </span>
        <h2 className="font-display text-3xl md:text-4xl">{titulo}</h2>
      </div>
      <div className="hairline mb-10" />
      {children}
    </section>
  );
}

function BrandSwatch({
  name,
  hex,
  rgb,
  cmyk,
  pantone,
  bg,
  fg,
  bordered,
}: {
  name: string;
  hex: string;
  rgb: string;
  cmyk: string;
  pantone: string;
  bg: string;
  fg: string;
  bordered?: boolean;
}) {
  return (
    <div
      className="flex flex-col"
      style={{
        border: bordered ? "1px solid var(--color-neutral-300)" : "none",
        background: "var(--color-paper-pure)",
      }}
    >
      <div
        className="relative h-48 flex items-end p-5"
        style={{ background: bg, color: fg }}
      >
        <div className="space-y-1">
          <span
            className="block font-mono text-[0.65rem] uppercase tracking-[0.14em]"
            style={{ opacity: 0.7 }}
          >
            {pantone}
          </span>
          <span className="block font-display text-3xl">{name}</span>
        </div>
      </div>
      <div
        className="px-5 py-4 grid grid-cols-2 gap-x-6 gap-y-2 font-mono text-[0.7rem]"
        style={{ color: "var(--color-neutral-700)" }}
      >
        <div>
          <span
            className="block text-[0.6rem] uppercase tracking-[0.14em]"
            style={{ color: "var(--color-neutral-500)" }}
          >
            Hex
          </span>
          <span>{hex}</span>
        </div>
        <div>
          <span
            className="block text-[0.6rem] uppercase tracking-[0.14em]"
            style={{ color: "var(--color-neutral-500)" }}
          >
            RGB
          </span>
          <span>{rgb}</span>
        </div>
        <div>
          <span
            className="block text-[0.6rem] uppercase tracking-[0.14em]"
            style={{ color: "var(--color-neutral-500)" }}
          >
            CMYK
          </span>
          <span>{cmyk}</span>
        </div>
        <div>
          <span
            className="block text-[0.6rem] uppercase tracking-[0.14em]"
            style={{ color: "var(--color-neutral-500)" }}
          >
            Pantone
          </span>
          <span>{pantone}</span>
        </div>
      </div>
    </div>
  );
}

function Swatch({
  name,
  cssVar,
  hex,
}: {
  name: string;
  cssVar: string;
  hex: string;
}) {
  const isDark = [
    "--color-ink",
    "--color-ink-elevated",
    "--color-neutral-900",
  ].includes(cssVar);
  return (
    <div
      className="flex flex-col"
      style={{
        border: "1px solid var(--color-neutral-200)",
        background: "var(--color-paper-pure)",
      }}
    >
      <div
        className="h-28 flex items-end p-3"
        style={{
          background: `var(${cssVar})`,
          color:
            isDark || cssVar.includes("river")
              ? "var(--color-paper-pure)"
              : "var(--color-neutral-900)",
        }}
      >
        <span className="font-mono text-[0.65rem] uppercase tracking-wider">
          {hex}
        </span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium">{name}</p>
        <p
          className="font-mono text-[0.65rem]"
          style={{ color: "var(--color-neutral-500)" }}
        >
          {cssVar}
        </p>
      </div>
    </div>
  );
}

function Muted({ label }: { label: string }) {
  return (
    <p
      className="font-mono text-[0.6rem] uppercase tracking-[0.14em] mb-3"
      style={{ color: "var(--color-neutral-500)" }}
    >
      {label}
    </p>
  );
}

function VariantLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-mono text-[0.65rem] uppercase tracking-[0.14em] mb-3"
      style={{ color: "var(--color-river-red)" }}
    >
      {children}
    </p>
  );
}
