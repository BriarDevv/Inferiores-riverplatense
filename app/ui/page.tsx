import Image from "next/image";
import HeroFeature from "@/components/cards/HeroFeature";
import NotaCard from "@/components/cards/NotaCard";
import TeaserCard from "@/components/cards/TeaserCard";
import WideFeatureCard from "@/components/cards/WideFeatureCard";
import CardAuthorMeta from "@/components/cards/CardAuthorMeta";
import NewsletterBand from "@/components/layout/NewsletterBand";
import NoticiasList from "@/components/lists/NoticiasList";
import UltimasList from "@/components/lists/UltimasList";
import BrutalistButton from "@/components/ui/BrutalistButton";
import { MOCK_NOTAS } from "@/lib/mock-data";
import UiDropdownDemo from "./_components/UiDropdownDemo";

export const metadata = {
  title: "UI — Inferiores Riverplatense",
  description: "Todo lo que se puede usar en el sitio.",
};

const SECCIONES = [
  { id: "paleta-river", label: "Colores oficiales de River" },
  { id: "tokens", label: "Paleta del sitio" },
  { id: "tipografia", label: "Tipografías" },
  { id: "frames", label: "Marcos y sombras" },
  { id: "botones", label: "Botones" },
  { id: "chips", label: "Filtros y etiquetas" },
  { id: "avatares", label: "Firma del autor" },
  { id: "tags", label: "Etiquetas sobre imagen" },
  { id: "dropdowns", label: "Selectores desplegables" },
  { id: "prose", label: "Cuerpo de una nota" },
  { id: "quotes", label: "Frase destacada" },
  { id: "separadores", label: "Separadores" },
  { id: "notacard", label: "Cards de nota" },
  { id: "teaser", label: "Cards medianas" },
  { id: "wide", label: "Card grande" },
  { id: "hero", label: "Nota principal" },
  { id: "noticias", label: "Lista de noticias" },
  { id: "ultimas", label: "Lista numerada" },
  { id: "newsletter", label: "Caja del newsletter" },
  { id: "social", label: "Botones de redes" },
  { id: "nav-color", label: "Nav — variantes de color" },
];

export default function UiPage() {
  const notaShort = MOCK_NOTAS.find((n) => n.formato === "short")!;
  const notaYoutube = MOCK_NOTAS.find((n) => n.formato === "youtube")!;
  const notaArticulo = MOCK_NOTAS.find((n) => n.formato === "articulo")!;
  const destacada = MOCK_NOTAS.find((n) => n.destacada) ?? MOCK_NOTAS[0];
  const entrevistaArticulo =
    MOCK_NOTAS.find(
      (n) => n.tipo === "entrevista" && n.formato === "articulo",
    ) ?? notaArticulo;
  const teaserPool = MOCK_NOTAS.filter(
    (n) => n.formato !== "youtube" && n.tipo !== "noticia",
  ).slice(0, 3);
  const noticias = MOCK_NOTAS.filter((n) => n.tipo === "noticia").slice(0, 6);
  const ultimas = MOCK_NOTAS.filter((n) => n.tipo !== "noticia").slice(0, 5);

  return (
    <div className="py-16 lg:py-20" style={{ background: "var(--color-paper)" }}>
      {/* Hero */}
      <header className="mx-auto max-w-[1440px] px-6 lg:px-10 mb-16">
        <div className="overline mb-4">Guía visual del sitio</div>
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
          Todo lo que aparece o puede aparecer en el sitio. Colores,
          tipografías y cada tipo de pieza que se usa para mostrar notas,
          entrevistas y noticias.
        </p>
      </header>

      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12">
        {/* Índice sticky */}
        <aside className="hidden lg:block">
          <nav
            className="sticky top-24 flex flex-col gap-0.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] max-h-[calc(100vh-8rem)] overflow-y-auto pr-2"
            aria-label="Índice"
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
                className="py-1.5 border-l-2 pl-3 transition-colors hover:border-l-[color:var(--color-river-red)] hover:text-[color:var(--color-ink)]"
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

        <main className="space-y-24">
          {/* ===== COLORES OFICIALES DE RIVER ===== */}
          <Section
            id="paleta-river"
            overline="01"
            titulo="Colores oficiales de River"
            descripcion="Los tres colores con los que el club se identifica oficialmente. Son la base de todo el sitio."
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BrandSwatch
                name="Rojo River"
                uso="Acentos, links, llamados a la acción"
                bg="#EB192E"
                fg="#FFFFFF"
              />
              <BrandSwatch
                name="Negro"
                uso="Bordes, texto principal, fondos oscuros"
                bg="#000000"
                fg="#FFFFFF"
              />
              <BrandSwatch
                name="Blanco"
                uso="Fondos limpios, texto sobre oscuro"
                bg="#FFFFFF"
                fg="#000000"
                bordered
              />
            </div>
          </Section>

          {/* ===== PALETA DEL SITIO ===== */}
          <Section
            id="tokens"
            overline="02"
            titulo="Paleta del sitio"
            descripcion="A partir de los oficiales se derivan estos tonos para usar en el sitio: variantes de rojo, distintos grises y dos beiges para los fondos."
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Swatch name="Rojo" hex="#EB192E" uso="Acentos · CTAs" />
              <Swatch
                name="Rojo profundo"
                hex="#C21020"
                uso="Hover / pressed"
              />
              <Swatch name="Rosa suave" hex="#FEE5E8" uso="Fondos sutiles" />
              <Swatch name="Tinta" hex="#0A0A0A" uso="Texto principal" />
              <Swatch
                name="Tinta elevada"
                hex="#141414"
                uso="Fondos oscuros"
              />
              <Swatch name="Papel" hex="#FAFAF7" uso="Fondo general" />
              <Swatch
                name="Papel puro"
                hex="#FFFFFF"
                uso="Cards y superficies"
              />
              <Swatch name="Texto fuerte" hex="#111113" uso="Títulos" />
              <Swatch name="Texto medio" hex="#3A3A3F" uso="Cuerpo" />
              <Swatch name="Texto suave" hex="#6B6B72" uso="Meta y fechas" />
              <Swatch name="Borde claro" hex="#C8C8CD" uso="Bordes finos" />
              <Swatch
                name="Borde muy claro"
                hex="#E4E4E7"
                uso="Separadores"
              />
            </div>
          </Section>

          {/* ===== TIPOGRAFÍAS ===== */}
          <Section
            id="tipografia"
            overline="03"
            titulo="Tipografías"
            descripcion="Cuatro tipografías que conviven. Una para títulos editoriales, otra para marcadores y scores, una para el texto común y la última para datos y fechas."
          >
            <div className="space-y-10">
              <TypeRow label="Título grande (Newsreader)">
                <p
                  className="font-display"
                  style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 0.95 }}
                >
                  Inferiores
                </p>
              </TypeRow>
              <TypeRow label="Título mediano (Newsreader)">
                <p className="font-display text-title">
                  Un título editorial
                </p>
              </TypeRow>
              <TypeRow label="Título mediano en italic rojo">
                <p
                  className="font-display text-title"
                  style={{
                    fontStyle: "italic",
                    color: "var(--color-river-red)",
                  }}
                >
                  Riverplatense
                </p>
              </TypeRow>
              <TypeRow label="Texto de las notas (Inter)">
                <p
                  className="max-w-[68ch]"
                  style={{ color: "var(--color-neutral-900)" }}
                >
                  El pibe llegó a los once con una zurda que parecía de jugador
                  de veinticinco. Lo vio por primera vez Miguel, en una cancha
                  de tierra, con el viento cruzado y un arco sin redes.
                </p>
              </TypeRow>
              <TypeRow label="Marcadores y scores (Anton, sólo números)">
                <p
                  className="font-sports text-5xl"
                  style={{ color: "var(--color-neutral-900)" }}
                >
                  River 3 — 0 Boca
                </p>
              </TypeRow>
              <TypeRow label="Datos, fechas y firmas (mono)">
                <p
                  className="font-mono text-xs uppercase tracking-[0.14em]"
                  style={{ color: "var(--color-neutral-500)" }}
                >
                  Por Tomás Rivera · 18 Abr · 1:27
                </p>
              </TypeRow>
              <TypeRow label="Etiqueta arriba del título (rojo)">
                <p className="overline">Entrevista · Reserva · Nuevo</p>
              </TypeRow>
            </div>
          </Section>

          {/* ===== MARCOS Y SOMBRAS ===== */}
          <Section
            id="frames"
            overline="04"
            titulo="Marcos y sombras"
            descripcion="El sello visual del sitio: borde negro grueso y una sombra desplazada en lugar de blureada. Hay seis variantes según cuánto se quiere destacar la pieza."
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FrameDemo label="Marco simple">
                <div
                  className="h-32 flex items-center justify-center font-mono text-xs"
                  style={{
                    background: "var(--color-paper-pure)",
                    border: "2px solid var(--color-ink)",
                    color: "var(--color-neutral-500)",
                  }}
                >
                  Solo borde
                </div>
              </FrameDemo>
              <FrameDemo label="Sombra al pasar el mouse">
                <div
                  className="brut-hover h-32 flex items-center justify-center font-mono text-xs"
                  style={{
                    background: "var(--color-paper-pure)",
                    color: "var(--color-neutral-500)",
                  }}
                >
                  Pasale el mouse
                </div>
              </FrameDemo>
              <FrameDemo label="Marco con sombra (jerarquía alta)">
                <div
                  className="h-32 flex items-center justify-center font-mono text-xs"
                  style={{
                    background: "var(--color-paper-pure)",
                    border: "2px solid var(--color-ink)",
                    boxShadow: "8px 8px 0 var(--color-ink)",
                    color: "var(--color-neutral-500)",
                  }}
                >
                  Para destacadas
                </div>
              </FrameDemo>
              <FrameDemo label="Sombra roja (acento)">
                <div
                  className="h-32 flex items-center justify-center font-mono text-xs"
                  style={{
                    background: "var(--color-paper-pure)",
                    border: "2px solid var(--color-ink)",
                    boxShadow: "5px 5px 0 var(--color-river-red)",
                    color: "var(--color-neutral-500)",
                  }}
                >
                  Acento rojo
                </div>
              </FrameDemo>
              <FrameDemo label="Marco invertido (sobre oscuro)">
                <div
                  className="h-32 flex items-center justify-center font-mono text-xs"
                  style={{
                    background: "var(--color-ink)",
                    color: "var(--color-paper)",
                    border: "2px solid var(--color-paper)",
                    boxShadow: "4px 4px 0 var(--color-paper)",
                  }}
                >
                  Fondo negro
                </div>
              </FrameDemo>
              <FrameDemo label="Sombra roja grande (newsletter)">
                <div
                  className="h-32 flex items-center justify-center font-mono text-xs"
                  style={{
                    background: "var(--color-ink)",
                    color: "var(--color-paper)",
                    border: "2px solid var(--color-ink)",
                    boxShadow: "8px 8px 0 var(--color-river-red)",
                  }}
                >
                  Caja newsletter
                </div>
              </FrameDemo>
            </div>
          </Section>

          {/* ===== BOTONES ===== */}
          <Section
            id="botones"
            overline="05"
            titulo="Botones"
            descripcion="Botones con marco y sombra. Al pasar el mouse la sombra se aplasta y el botón se mueve para dar sensación de click. Se adaptan al fondo donde están: oscuros sobre blanco, claros sobre negro."
          >
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-0"
              style={{ border: "1px solid var(--color-neutral-200)" }}
            >
              <div
                className="p-10 flex flex-wrap items-center gap-6"
                style={{ background: "var(--color-paper)" }}
              >
                <span
                  className="font-mono text-[0.55rem] uppercase tracking-[0.18em] w-full mb-2"
                  style={{ color: "var(--color-neutral-500)" }}
                >
                  Sobre fondo claro
                </span>
                <BrutalistButton>Ver la nota →</BrutalistButton>
                <BrutalistButton variant="ghost">Secundario</BrutalistButton>
                <BrutalistButton size="sm">Chico</BrutalistButton>
                <BrutalistButton size="lg">Grande</BrutalistButton>
              </div>

              <div
                className="p-10 flex flex-wrap items-center gap-6"
                style={{ background: "var(--color-ink)" }}
              >
                <span
                  className="font-mono text-[0.55rem] uppercase tracking-[0.18em] w-full mb-2"
                  style={{ color: "var(--color-neutral-500)" }}
                >
                  Sobre fondo oscuro
                </span>
                <BrutalistButton onDark>Ver la nota →</BrutalistButton>
                <BrutalistButton variant="ghost" onDark>
                  Secundario
                </BrutalistButton>
                <BrutalistButton size="sm" onDark>
                  Chico
                </BrutalistButton>
                <BrutalistButton size="lg" onDark>
                  Grande
                </BrutalistButton>
              </div>
            </div>

            <div className="mt-8">
              <SmallLabel>Botón del newsletter (rojo)</SmallLabel>
              <a
                href="#botones"
                className="font-sports inline-flex items-center gap-2"
                style={{
                  fontSize: "0.8rem",
                  letterSpacing: "0.12em",
                  padding: "0.6rem 1rem",
                  background: "var(--color-river-red)",
                  color: "var(--color-paper-pure)",
                  border: "2px solid var(--color-ink)",
                  boxShadow: "3px 3px 0 var(--color-ink)",
                  textDecoration: "none",
                }}
              >
                Newsletter
                <span aria-hidden>→</span>
              </a>
            </div>
          </Section>

          {/* ===== FILTROS Y ETIQUETAS ===== */}
          <Section
            id="chips"
            overline="06"
            titulo="Filtros y etiquetas"
            descripcion="Para marcar el tipo de nota, una división, un jugador relacionado, o cualquier dato corto."
          >
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <button className="chip">Filtro común</button>
                <button className="chip" data-active="true">
                  Filtro activo
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
                  Tomás Rivera · 18 Abr · 1:27
                </span>
              </div>
            </div>
          </Section>

          {/* ===== FIRMA DEL AUTOR ===== */}
          <Section
            id="avatares"
            overline="07"
            titulo="Firma del autor"
            descripcion="Aparece en cada card de nota: foto circular (o iniciales si no hay foto) + nombre + fecha. Hay un tamaño normal y uno un poco más grande."
          >
            <div className="space-y-4">
              <CardAuthorMeta
                autor={notaShort.autor}
                publicada_en={notaShort.publicada_en}
              />
              <CardAuthorMeta
                autor={notaShort.autor}
                publicada_en={notaShort.publicada_en}
                size="md"
              />
              <CardAuthorMeta
                autor={{
                  id: "sin-avatar",
                  nombre: "Sin Foto",
                  rol: "editor",
                }}
                publicada_en={notaShort.publicada_en}
              />
            </div>
          </Section>

          {/* ===== ETIQUETAS SOBRE IMAGEN ===== */}
          <Section
            id="tags"
            overline="08"
            titulo="Etiquetas sobre imagen"
            descripcion="Las que se montan sobre la foto de la card: a la izquierda la etiqueta de formato (en rojo) y a la derecha el tiempo (cuando es video)."
          >
            <div className="flex flex-wrap items-center gap-4">
              <FormatTagDemo label="Short" />
              <FormatTagDemo label="Video" />
              <FormatTagDemo label="Nota" />
              <DurationPillDemo seconds={87} />
              <DurationPillDemo seconds={847} />
            </div>
          </Section>

          {/* ===== SELECTORES ===== */}
          <Section
            id="dropdowns"
            overline="09"
            titulo="Selectores desplegables"
            descripcion="Para filtrar el archivo de notas. Se abren al hacer click y se cierran al hacer click afuera o apretar Escape."
          >
            <UiDropdownDemo />
          </Section>

          {/* ===== CUERPO DE UNA NOTA ===== */}
          <Section
            id="prose"
            overline="10"
            titulo="Cuerpo de una nota"
            descripcion="Así se ve el texto adentro de una nota: primera letra grande en rojo, subtítulos serif, y bloques de cita con borde rojo a la izquierda."
          >
            <div className="article-prose">
              <p>
                Desde los once años, cada vez que River Infantiles llegaba a un
                desempate, el banco miraba al mismo pibe. Hoy tiene dieciséis,
                juega en Cuarta y carga sobre la espalda una estadística rara:
                doce penales pateados en torneos oficiales, doce goles.
              </p>
              <h2>La rutina del miércoles</h2>
              <p>
                La armó con el preparador de arqueros. Cada miércoles, al final
                del entrenamiento, se quedaba media hora extra. No a pegarle
                fuerte. A mirar.
              </p>
              <blockquote>
                «No es algo que yo haya pedido. Un día me lo dieron y no lo
                solté más.»
              </blockquote>
              <h3>El método</h3>
              <p>
                A entender cómo se movía el arquero antes de que la pelota
                saliera del pie.
              </p>
            </div>
          </Section>

          {/* ===== FRASE DESTACADA ===== */}
          <Section
            id="quotes"
            overline="11"
            titulo="Frase destacada"
            descripcion="Una cita resaltada con borde rojo a la izquierda, en italic, para llamar la atención sobre algo que dijo el entrevistado."
          >
            <blockquote className="pull-quote max-w-[68ch]">
              «Cuando te ponés esta camiseta, nada es por casualidad. Es casi
              como firmar algo sin papeles.»
            </blockquote>
            <p
              className="mt-4 font-mono text-xs uppercase tracking-[0.14em]"
              style={{ color: "var(--color-neutral-500)" }}
            >
              — Franco Mastantuono · Entrevista 17 Abr
            </p>
          </Section>

          {/* ===== SEPARADORES ===== */}
          <Section
            id="separadores"
            overline="12"
            titulo="Separadores"
            descripcion="Líneas finas y etiquetas chiquitas que se usan para dividir secciones."
          >
            <div className="space-y-8">
              <div>
                <SmallLabel>Línea fina sobre fondo claro</SmallLabel>
                <div className="hairline" />
              </div>
              <div>
                <SmallLabel>Línea fina sobre fondo oscuro</SmallLabel>
                <div className="p-6" style={{ background: "var(--color-ink)" }}>
                  <div className="hairline-dark" />
                </div>
              </div>
              <div>
                <SmallLabel>Etiqueta con guión rojo</SmallLabel>
                <div className="overline flex items-center gap-3">
                  <span
                    className="block w-8 h-[2px]"
                    style={{ background: "var(--color-river-red)" }}
                  />
                  Seguí bajando
                </div>
              </div>
              <div>
                <SmallLabel>Etiqueta de sección</SmallLabel>
                <div className="brut-label">03 · Archivo completo</div>
              </div>
            </div>
          </Section>

          {/* ===== CARDS DE NOTA ===== */}
          <Section
            id="notacard"
            overline="13"
            titulo="Cards de nota"
            descripcion="Una sola card adaptada a tres tipos de contenido: video corto (vertical), video largo (horizontal) y nota escrita."
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div>
                <VariantLabel>Video corto · vertical</VariantLabel>
                <NotaCard nota={notaShort} />
              </div>
              <div>
                <VariantLabel>Video largo · horizontal</VariantLabel>
                <NotaCard nota={notaYoutube} />
              </div>
              <div>
                <VariantLabel>Nota o entrevista · vertical</VariantLabel>
                <NotaCard nota={notaArticulo} />
              </div>
            </div>
          </Section>

          {/* ===== CARDS MEDIANAS ===== */}
          <Section
            id="teaser"
            overline="14"
            titulo="Cards medianas"
            descripcion="Para mostrar tres notas seguidas debajo de la principal: imagen + etiqueta + título + firma."
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {teaserPool.map((n) => (
                <TeaserCard key={n.id} nota={n} />
              ))}
            </div>
          </Section>

          {/* ===== CARD GRANDE ===== */}
          <Section
            id="wide"
            overline="15"
            titulo="Card grande"
            descripcion="La que aparece a la izquierda del bento de la home, ocupando dos columnas. Marco con sombra fuerte para destacar."
          >
            <div className="max-w-3xl">
              <WideFeatureCard nota={entrevistaArticulo} />
            </div>
          </Section>

          {/* ===== NOTA PRINCIPAL ===== */}
          <Section
            id="hero"
            overline="16"
            titulo="Nota principal de la portada"
            descripcion="La primera pieza arriba de todo: texto a la izquierda y foto a la derecha, marco con sombra grande."
          >
            <HeroFeature nota={destacada} />
          </Section>

          {/* ===== LISTA DE NOTICIAS ===== */}
          <Section
            id="noticias"
            overline="17"
            titulo="Lista de noticias"
            descripcion="Caja al costado del bento con noticias breves. Cada item con número, foto chiquita y título."
          >
            <div className="max-w-md">
              <NoticiasList notas={noticias} />
            </div>
          </Section>

          {/* ===== LISTA NUMERADA ===== */}
          <Section
            id="ultimas"
            overline="18"
            titulo="Lista numerada"
            descripcion="Estilo lo último de la cantera: número rojo grande, tipo y división, título y fecha."
          >
            <UltimasList notas={ultimas} />
          </Section>

          {/* ===== CAJA DEL NEWSLETTER ===== */}
          <Section
            id="newsletter"
            overline="19"
            titulo="Caja del newsletter"
            descripcion="La caja oscura al final de la home para suscribirse al mail. Form de email + botón rojo."
          >
            <NewsletterBand />
          </Section>

          {/* ===== BOTONES DE REDES ===== */}
          <Section
            id="social"
            overline="20"
            titulo="Botones de redes"
            descripcion="Aparecen fijos a la izquierda en todas las páginas (en pantallas grandes). Llevan a las redes del periodista: X, Instagram, TikTok, YouTube, Facebook."
          >
            <div
              className="inline-flex flex-col gap-2 p-2"
              style={{
                background: "var(--color-paper)",
                border: "2px solid var(--color-ink)",
                boxShadow: "4px 4px 0 var(--color-ink)",
              }}
            >
              {["X", "IG", "TT", "YT", "FB"].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center justify-center font-sports text-[0.65rem]"
                  style={{
                    width: "44px",
                    height: "44px",
                    border: "2px solid var(--color-ink)",
                    background: "var(--color-paper-pure)",
                    color: "var(--color-ink)",
                    letterSpacing: "0.08em",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
            <p
              className="mt-4 text-sm max-w-md"
              style={{ color: "var(--color-neutral-500)" }}
            >
              (Acá hay un ejemplo estático. En el sitio aparecen fijos a la
              izquierda y siguen el scroll.)
            </p>
          </Section>

          {/* ===== NAV — VARIANTES DE COLOR ===== */}
          <Section
            id="nav-color"
            overline="21"
            titulo="Barra de navegación — variantes de color"
            descripcion="Cinco esquemas para la parte de arriba, todos con la paleta del sitio. La barra de secciones (abajo) queda negra en todas; lo que cambia es la franja superior y el masthead del medio."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              <NavVariant
                name="A · Capas de tinta (actual)"
                desc="Rojo profundo → tinta elevada → tinta. Profundidad sutil."
                barra="#C21020"
                masthead="#141414"
                seccion="#0A0A0A"
              />
              <NavVariant
                name="B · Rojo arriba"
                desc="Franja roja plena arriba, el resto negro."
                barra="#EB192E"
                masthead="#0A0A0A"
                seccion="#0A0A0A"
              />
              <NavVariant
                name="C · Monolito negro"
                desc="Todo negro, el rojo solo como acento."
                barra="#0A0A0A"
                masthead="#0A0A0A"
                seccion="#0A0A0A"
              />
              <NavVariant
                name="D · Masthead claro"
                desc="Franja roja, masthead blanco, secciones negras."
                barra="#EB192E"
                masthead="#FFFFFF"
                seccion="#0A0A0A"
              />
              <NavVariant
                name="E · Rojo dominante"
                desc="Masthead rojo pleno entre dos negros."
                barra="#0A0A0A"
                masthead="#EB192E"
                seccion="#0A0A0A"
              />
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
  descripcion,
  children,
}: {
  id: string;
  overline: string;
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="flex items-baseline gap-6 mb-4">
        <span
          className="font-mono text-xs tabular-nums"
          style={{ color: "var(--color-river-red)" }}
        >
          /{overline}
        </span>
        <h2 className="font-display text-3xl md:text-4xl">{titulo}</h2>
      </div>
      {descripcion && (
        <p
          className="text-base leading-relaxed max-w-2xl mb-8"
          style={{ color: "var(--color-neutral-700)" }}
        >
          {descripcion}
        </p>
      )}
      <div className="hairline mb-10" />
      {children}
    </section>
  );
}

function BrandSwatch({
  name,
  uso,
  bg,
  fg,
  bordered,
}: {
  name: string;
  uso: string;
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
        <span className="block font-display text-3xl">{name}</span>
      </div>
      <div
        className="px-5 py-4 text-sm"
        style={{ color: "var(--color-neutral-700)" }}
      >
        {uso}
      </div>
    </div>
  );
}

function Swatch({
  name,
  hex,
  uso,
}: {
  name: string;
  hex: string;
  uso: string;
}) {
  const isDark = ["#0A0A0A", "#141414", "#111113"].includes(hex);
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
          background: hex,
          color:
            isDark || hex === "#EB192E" || hex === "#C21020"
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
          className="text-xs mt-0.5"
          style={{ color: "var(--color-neutral-500)" }}
        >
          {uso}
        </p>
      </div>
    </div>
  );
}

function SmallLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-sm mb-3"
      style={{ color: "var(--color-neutral-500)" }}
    >
      {children}
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

function TypeRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <SmallLabel>{label}</SmallLabel>
      {children}
    </div>
  );
}

function FrameDemo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <SmallLabel>{label}</SmallLabel>
      {children}
    </div>
  );
}

function FormatTagDemo({ label }: { label: string }) {
  return (
    <div
      className="inline-block px-2 py-1 text-[0.65rem] font-sports tabular-nums"
      style={{
        background: "var(--color-river-red)",
        color: "var(--color-paper-pure)",
        border: "2px solid var(--color-ink)",
        letterSpacing: "0.12em",
      }}
    >
      {label}
    </div>
  );
}

function DurationPillDemo({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return (
    <div
      className="inline-block px-2 py-1 text-[0.7rem] font-mono tabular-nums"
      style={{
        background: "var(--color-ink)",
        color: "var(--color-paper-pure)",
        border: "2px solid var(--color-ink)",
      }}
    >
      {m}:{s.toString().padStart(2, "0")}
    </div>
  );
}

function isLight(hex: string): boolean {
  return ["#FFFFFF", "#FAFAF7", "#FFF"].includes(hex.toUpperCase());
}

function NavVariant({
  name,
  desc,
  barra,
  masthead,
  seccion,
}: {
  name: string;
  desc: string;
  barra: string;
  masthead: string;
  seccion: string;
}) {
  const fg = (bg: string) => (isLight(bg) ? "#0a0a0a" : "#ffffff");
  const dim = (bg: string) =>
    isLight(bg) ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.62)";

  return (
    <div>
      <p
        className="font-mono text-[0.7rem] uppercase tracking-[0.14em] mb-1"
        style={{ color: "var(--color-river-red)" }}
      >
        {name}
      </p>
      <p className="text-xs mb-3" style={{ color: "var(--color-neutral-500)" }}>
        {desc}
      </p>
      <div style={{ border: "2px solid var(--color-ink)" }}>
        {/* barrita */}
        <div
          className="flex items-center justify-between px-3"
          style={{ background: barra, height: "24px" }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: "0.5rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: dim(barra),
            }}
          >
            Mar 27 May
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: "0.5rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: dim(barra),
            }}
          >
            Edición · Nº 001
          </span>
        </div>

        {/* masthead */}
        <div
          className="grid items-center gap-2 px-3 py-3"
          style={{ background: masthead, gridTemplateColumns: "1fr auto 1fr" }}
        >
          <span
            className="justify-self-end text-right font-display"
            style={{ fontSize: "0.85rem", lineHeight: 1, color: fg(masthead) }}
          >
            Inferiores{" "}
            <span style={{ fontStyle: "italic", color: "var(--color-river-red)" }}>
              R.
            </span>
          </span>
          <span
            className="justify-self-center inline-flex items-center justify-center shrink-0"
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "9999px",
              background: "#fff",
              overflow: "hidden",
            }}
          >
            <Image src="/logo.webp" alt="" width={38} height={38} />
          </span>
          <span
            className="justify-self-start font-display italic"
            style={{ fontSize: "0.75rem", lineHeight: 1, color: dim(masthead) }}
          >
            Notas
          </span>
        </div>

        {/* barra de secciones */}
        <div
          className="flex items-center gap-2 px-3"
          style={{
            background: seccion,
            height: "32px",
            borderBottom: "3px solid var(--color-river-red)",
          }}
        >
          <span className="font-sports" style={{ fontSize: "0.55rem", color: "#fff" }}>
            Divisiones
          </span>
          <span
            className="font-sports"
            style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.7)" }}
          >
            Notas
          </span>
          <span
            className="font-sports"
            style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.7)" }}
          >
            Entrevistas
          </span>
          <span
            className="ml-auto inline-block shrink-0"
            style={{
              border: "1px solid rgba(255,255,255,0.3)",
              width: "60px",
              height: "14px",
            }}
          />
          <span
            className="font-sports shrink-0"
            style={{
              fontSize: "0.5rem",
              color: "#fff",
              background: "var(--color-river-red)",
              border: "1px solid #fff",
              padding: "2px 6px",
            }}
          >
            News
          </span>
        </div>
      </div>
    </div>
  );
}
