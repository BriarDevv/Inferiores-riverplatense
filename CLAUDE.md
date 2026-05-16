# Inferiores Riverplatense

Sitio de periodismo dedicado a las divisiones formativas del **Club Atlético River Plate**. Portfolio / publicación de un periodista que hace **notas y entrevistas** sobre las inferiores.

> **Importante para futuras sesiones**: NO es un mega-site editorial con múltiples secciones. Es un **portfolio periodístico enfocado en notas y entrevistas**. Evitar sobre-diseñar (feeds tipo TikTok a pantalla completa, filtros de divisiones complejos en el nav, tickers en vivo, coordenadas arquitectónicas). Las cosas se ajustan al uso real.

---

## Estado actual

- Nav brutalist simple con 4 items (Notas / Entrevistas / Sobre / Contacto) ✓
- Footer brutalist con 4px red top border, colofón editorial ✓
- Portada mostrando placeholder "En construcción editorial" ✓
- `/sobre` y `/contacto` con placeholders ✓
- `/ui` con el sistema de diseño depurado (solo lo aplicado al sitio) ✓
- **Pendiente**: contenido real de portada, detalle de nota, ABM, Supabase

---

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19.2**
- **TypeScript 6** (`strict` true)
- **Tailwind v4** (vía `@tailwindcss/postcss`)
- **Lenis** (smooth scroll, cargado pero sin uso intenso aún)
- **GSAP** (instalado, sin uso activo todavía)
- **Supabase JS** (instalado, pendiente de conectar)

### Fuentes (Google Fonts, via `next/font/google`)

- **Newsreader** → `--font-display` (titulares, pull quotes, logo)
- **Anton** → `--font-sports` (scores, nav items, sports display)
- **Inter** → `--font-body` (cuerpo)
- **JetBrains Mono** → `--font-mono` (meta, datos, coordenadas)

> Las variables `Fraunces`, `Instrument_Serif`, `Playfair_Display`, `Bebas_Neue` están importadas en `layout.tsx` por historial de A/B pero no se usan en runtime. Se pueden borrar cuando se quiera.

---

## Decisiones de diseño locked-in

### Paleta oficial River Plate

| Token | Hex | Nota |
|---|---|---|
| `--color-river-red` | `#EB192E` | Oficial, Pantone 1788 C |
| `--color-river-red-deep` | `#C21020` | hover / pressed |
| `--color-river-red-soft` | `#FEE5E8` | tints |
| `--color-river-black` | `#000000` | Pantone Process Black C |
| `--color-ink` | `#0A0A0A` | cinematográfico, sin blue cast |
| `--color-paper` | `#FAFAF7` | crema editorial |
| `--color-paper-pure` | `#FFFFFF` | cards, superficies puras |

### Estética: Brutalist editorial

- **Bordes 2px** siempre (ink o rojo según contexto).
- **Offset shadows pixel-perfect** (ej: `5px 5px 0 var(--color-ink)`), sin blur.
- **Sin rounded corners** anywhere.
- **Sin blurs** (ni shadows difusos ni backdrop-blur decorativos).
- **Hover snap** 120-160ms ease-out.
- **Uppercase + tracking ancho** en labels de sección y nav (Anton).

### Utilidades CSS ya listas (en `app/globals.css`)

- `.font-display` / `.font-sports` / `.font-mono` / `.font-body`
- `.overline` — tipografía de overline editorial (rojo, mono, tracking)
- `.brut-frame` / `.brut-frame-red` — borde 2px
- `.brut-frame-shadow` / `.brut-frame-shadow-red` — borde + offset shadow
- `.brut-hover` / `.brut-hover-red` — hover que revela offset shadow
- `.brut-label` — etiqueta de sección (overline mono + tracking).
  ⚠️ **Antipattern: el símbolo `§` no se usa en el sitio.** Si ves "§ Sección" en algún lado, sacalo — fue una idea temprana que el usuario rechazó.
- `.chip` — botón tipo chip (dropdown items, tags)
- `.pull-quote` — cita con borde izquierdo rojo 3px
- `.hairline` / `.hairline-dark` — separadores finos

### Componentes base

- `components/ui/BrutalistButton.tsx` — CTA primario. Borde 2px + offset shadow. Prop `onDark` adapta color del frame (ink sobre paper, paper sobre ink). Hover: shadow 5px→2px + traslada 3px.
- `components/ui/Dropdown.tsx` — filtro con label + valor seleccionado. Menu abierto tiene offset shadow 5px. Cerrar con click afuera o Escape.
- `components/cards/NotaCard.tsx` — 3 variantes según `nota.formato`: `short` (9:16), `youtube` (16:9), `articulo` (4:5). Frame 2px ink, hover revela offset shadow rojo (short) o ink (youtube/articulo).

---

## Estructura del proyecto

```
app/
  layout.tsx              → root, fuentes, Lenis, Nav, Footer
  page.tsx                → portada (placeholder)
  sobre/page.tsx          → bio periodista (placeholder)
  contacto/page.tsx       → contacto (placeholder)
  ui/
    page.tsx              → design system aplicado
    _components/
      UiDropdownDemo.tsx  → demo interactivo de dropdowns
  globals.css             → tokens + utilidades brutalist

components/
  layout/
    Nav.tsx               → nav brutalist 4-item
    Footer.tsx            → footer brutalist
    LenisProvider.tsx     → smooth scroll wrapper
  ui/
    BrutalistButton.tsx   → CTA
    Dropdown.tsx          → filtro
  cards/
    NotaCard.tsx          → 3 variantes de card

lib/
  types.ts                → Nota, Sujeto, Autor, tipos afines
  mock-data.ts            → 8 notas demo (para /ui y futuro seed)
  notas.ts                → capa de acceso a datos (swap a Supabase)
  constants.ts            → divisiones, tipos, formatters
```

---

## Modelo de datos

Definido en `lib/types.ts`:

- **`Nota`** — pieza periodística. Campos clave:
  - `formato`: `short` | `youtube` | `articulo`
  - `fuente`: `propio` | `youtube` | `instagram` | `tiktok`
  - `video_url`, `youtube_id`, `poster_url`, `duracion_seg`
  - `quote_overlay` (opcional, kinetic typography sobre short)
  - `autor`, `sujetos[]`, `tags[]`
  - `publicada_en`, `destacada`, `capitulos[]`
- **`Sujeto`** — polimórfico. `tipo`: `jugador` | `tecnico` | `equipo`. Una nota puede tener 0..N sujetos.
- **`Autor`** — `rol`: `admin` | `editor`. Admin puede crear otros perfiles desde el ABM.
- **`FiltrosNota`** — tipo, division, formato, sujeto_id, orden.

### Divisiones soportadas

`primera` · `reserva` · `cuarta` · `quinta` · `sexta` · `septima` · `octava` · `novena` · `femenino`

### Tipos de nota

`entrevista` · `perfil` · `cronica` · `analisis` · `columna`

---

## Nav (definido)

1. **Notas** (`/`) — portada con todo el archivo
2. **Entrevistas** (`/?tipo=entrevista`) — filtro a entrevistas
3. **Sobre** (`/sobre`) — bio del periodista
4. **Contacto** (`/contacto`) — email + redes

**Sin "Suscribirse"** — se suma solo si el periodista va a mandar newsletter.

Logo izquierda: monograma rojo **I** con borde ink 2px + offset shadow 4px, seguido del wordmark `Inferiores` + `*Riverplatense*` (italic rojo).

Bottom border del nav: **4px red**. Background paper-pure.

---

## Pendiente priorizado

### Corto plazo (para demo mostrable)
1. **Reponer portada `/page.tsx`** — listado de notas con filtros (se borró todo el contenido antes de hacer el nuevo diseño).
2. **Reponer detalle `/nota/[slug]/page.tsx`** — ya había uno pero se borró.
3. **Reemplazar Hero** — decidir si va o no; si va, brutalist simple (no el de antes).

### Medio plazo (ABM real)
4. **Conectar Supabase** (auth + DB + storage).
5. **Schema SQL**:
   - `profiles` (extends `auth.users`, rol admin/editor)
   - `jugadores` / `tecnicos` / `equipos` (tablas separadas)
   - `notas` (tabla principal)
   - `nota_sujetos` (pivote polimórfico: `nota_id`, `sujeto_tipo`, `sujeto_id`)
6. **ABM protegido** — login magic-link, CRUD de notas, asociación a sujetos.
7. **Upload de video vertical** — Supabase Storage directo, no Mux (costo).
8. **Embed YouTube** — solo guardar ID, el player lazy-load.

### Largo plazo (pulido)
9. Página `/jugador/[slug]` (o `/tecnico/[slug]`, `/equipo/[slug]`) con feed filtrado.
10. Newsletter (si se decide).
11. SEO + OpenGraph + sitemap.

---

## Historial de decisiones importantes (orden cronológico)

1. Proyecto inicialmente pensado como mega-site editorial sobre inferiores de River → **restringido** a portfolio de notas/entrevistas.
2. Paleta: primero `#D6001C` burgundy → migrado al oficial `#EB192E` (Pantone 1788 C).
3. Tipografía: probamos Fraunces → Instrument Serif → Newsreader. Ganó **Newsreader** por feel periodístico.
4. Sports font: Anton se reserva solo a **scores y marcadores numéricos**, no a nav items en el sitio final (aunque los nav items también usan Anton por ser condensed + uppercase).
5. Botones: probamos Flat, Brutalist, Stadium, Pill, Underline → ganó **Brutalist** adaptive.
6. Nav: probamos 5 variantes + 5 brutalist + variantes con botones → **ninguna cerró**. El usuario quería algo más simple orientado al portfolio. Nav actual: 4 items horizontales.
7. Página: se borró todo el contenido (Hero, ShortsRail, FilterBar, BentoGrid, detalle de nota) para rearrancar desde cero con el enfoque portfolio simplificado. `/ui` quedó intacto.
8. `/ui` depurado: borrados Lab de navbars, Lab de combos tipográficos, Lab de botones. Solo queda lo aplicado.

---

## Cómo correrlo

```bash
npm run dev        # http://localhost:3000
npm run build      # producción
npm run typecheck  # tsc --noEmit
```

### Variables de entorno (cuando toque Supabase)

Ver `.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Reglas del juego (para futuras iteraciones)

1. **Mantener brutalist en todo**: bordes 2px, offset shadows pixel-perfect, sin rounded, sin blur.
2. **Respetar el stack tipográfico**: Newsreader + Anton + Inter + Mono. No meter fuentes nuevas sin motivo claro.
3. **Pensar "portfolio periodístico"** antes de agregar features. Preguntar: ¿sirve a mostrar las notas/entrevistas? Si no, probablemente sobra.
4. **Iteración con `/ui`**: cualquier componente nuevo se agrega primero al playground para verificar que encaja en el sistema.
5. **Capa de datos desacoplada**: todo pasa por `lib/notas.ts`. Cuando se conecta Supabase, solo cambia ese archivo.
6. **Placeholders**: si se arma una página nueva y el contenido real no está listo, usar el patrón de `/sobre` o `/contacto` (bloque con borde izquierdo rojo + título + descripción breve).
