# DESIGN.md — Inferiores Riverplatense

> Revista digital editorial sobre las divisiones inferiores del Club Atlético River Plate.
> Dirección visual: **chiaroscuro editorial, rojo River como acento cinematográfico, negro profundo como base, blanco como respiro.**
> Inspirada en `ferrari` (getdesign.md) y en magazines deportivos de larga forma (The Players' Tribune, Panenka, The Athletic long-reads).
>
> **Contenido híbrido**: la mayoría de las notas son **verticales 9:16** (estilo TikTok/Reels), algunas son **horizontales 16:9** (YouTube embebido con info más larga), y eventualmente puede haber **texto puro**. El diseño debe sentirse natural con los tres formatos conviviendo.

---

## 1. Principios de diseño

1. **Editorial, no blog**. Las notas son el producto. La jerarquía tipográfica hace el trabajo pesado.
2. **Una foto importa más que cinco**. Imagen grande, recortada con intención, nunca decorativa.
3. **Rojo con disciplina**. El rojo River es acento, no fondo. Aparece donde hay significado (categoría, estado, énfasis).
4. **Negro con textura**. Fondos oscuros en grano sutil, no plano aburrido. Profundidad cinematográfica.
5. **Ritmo, no uniformidad**. Tamaños de tarjetas variados (hero / destacada / estándar) tipo bento editorial.
6. **Silencio tipográfico**. Espacio en blanco agresivo alrededor de títulos grandes. Menos es más para que el contenido respire.

---

## 2. Paleta

```css
:root {
  /* Rojo River — acento principal */
  --color-river-red: #D6001C;          /* base */
  --color-river-red-deep: #A30015;     /* hover / pressed */
  --color-river-red-soft: #FFE5E9;     /* tints sobre blanco */

  /* Negro cinematográfico */
  --color-ink: #0A0A0B;                /* fondo oscuro principal */
  --color-ink-elevated: #14141A;       /* superficies elevadas sobre fondo oscuro */
  --color-ink-contrast: #1E1E25;       /* bordes sutiles sobre fondo oscuro */

  /* Blancos y neutros cálidos */
  --color-paper: #FAFAF7;              /* fondo claro, levemente crema */
  --color-paper-pure: #FFFFFF;         /* cards sobre paper */
  --color-neutral-900: #111113;
  --color-neutral-700: #3A3A3F;
  --color-neutral-500: #6B6B72;
  --color-neutral-300: #C8C8CD;
  --color-neutral-200: #E4E4E7;
  --color-neutral-100: #F2F2EF;

  /* Estado / semántico */
  --color-live: #D6001C;               /* nota en vivo / reciente */
  --color-archive: #6B6B72;            /* nota archivada */
}
```

**Reglas de uso del rojo:**
- Categoría de la nota (chip/tag).
- Subrayado animado del link hover.
- Acento en hora/fecha de publicación en vivo.
- Botón primario (CTA de lectura).
- NUNCA como fondo de bloques largos. NUNCA como color de párrafo.

**Modo claro = default** (es una revista, se lee mejor en paper). Modo oscuro opcional para la portada y la lectura nocturna.

---

## 3. Tipografía

Dos familias con roles claros.

```css
:root {
  --font-display: "Fraunces", "Playfair Display", Georgia, serif;
  --font-body: "Inter", "Söhne", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}
```

- **Display serif** para títulos de nota, hero y H1. Con leve `font-variation-settings` para peso editorial (opticales si están disponibles).
- **Sans serif** para UI, metadatos, cuerpo y filtros.
- **Mono** para timestamps, minutos de partido, datos estadísticos.

### Escala

```css
:root {
  --text-hero:      clamp(3.5rem, 2rem + 7vw, 8.5rem);    /* portada, nota destacada */
  --text-title:     clamp(2rem, 1.2rem + 3vw, 4rem);       /* títulos de nota grandes */
  --text-subtitle:  clamp(1.25rem, 1rem + 0.8vw, 1.75rem); /* bajadas */
  --text-lead:      clamp(1.125rem, 1rem + 0.3vw, 1.25rem);/* intro de nota */
  --text-body:      1.0625rem;                              /* cuerpo */
  --text-meta:      0.8125rem;                              /* autor, fecha */
  --text-micro:     0.6875rem;                              /* overlines tipo "ENTREVISTA" */

  --leading-tight:  1.05;
  --leading-snug:   1.2;
  --leading-body:   1.7;

  --tracking-tight: -0.03em;
  --tracking-meta:  0.08em;   /* overlines en UPPERCASE */
}
```

**Overline** (la etiqueta "ENTREVISTA · RESERVA" arriba del título) siempre en:
`font-family: var(--font-body); text-transform: uppercase; letter-spacing: var(--tracking-meta); font-size: var(--text-micro); font-weight: 600; color: var(--color-river-red);`

---

## 4. Espaciado y grilla

```css
:root {
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;
  --space-section: clamp(4rem, 3rem + 5vw, 9rem);
  --content-max: 1440px;
  --reading-max: 68ch;
}
```

Grilla principal de portada: **12 columnas** con gutter `clamp(16px, 2vw, 32px)`.
Nota individual: centrada en columna de `--reading-max`.

---

## 5. Layouts clave

### 5.1 Portada (`/`) — layout híbrido editorial

```
┌─────────────────────────────────────────────────────────────┐
│  NAVBAR (transparente sobre hero, se vuelve sólida)         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   HERO HÍBRIDO (100vh)                                      │
│   ┌───────────────────────────┬─────────────────────┐       │
│   │                           │                     │       │
│   │   LADO TEXTO (60%)        │   VIDEO VERTICAL    │       │
│   │                           │   9:16 AUTO-LOOP    │       │
│   │   · Overline rojo         │   (muted, muestra   │       │
│   │   · Título display serif  │    el short         │       │
│   │     GIGANTE (clamp 8vw)   │    destacado)       │       │
│   │   · Bajada + meta         │                     │       │
│   │   · CTA "VER LA NOTA"     │   Si la destacada   │       │
│   │                           │   es YouTube:       │       │
│   │                           │   thumbnail 16:9    │       │
│   │                           │   + botón play      │       │
│   └───────────────────────────┴─────────────────────┘       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│   RAIL DE SHORTS (scroll horizontal tipo stories)           │
│   "En el feed" ────────────────────────────────→            │
│   [9:16][9:16][9:16][9:16][9:16][9:16][9:16][...]           │
│   · Auto-play mute al entrar al viewport                    │
│   · Click abre VerticalFeed full-screen                     │
├─────────────────────────────────────────────────────────────┤
│   BARRA DE FILTROS sticky                                   │
│   [Todas] [Entrevistas] [Perfiles] [Crónicas] [...]         │
│   [Primera · Reserva · 4ta · 5ta · 6ta · 7ta · 8va]         │
│   [formato: todos ▼] [orden: recientes ▼]                   │
├─────────────────────────────────────────────────────────────┤
│   GRILLA BENTO MIXTA (12 cols)                              │
│   ┌────────────┬──────┬──────┐                              │
│   │ YouTube    │ 9:16 │ 9:16 │  ← horizontal ocupa 2 cols,  │
│   │ (6 cols)   │      │      │    verticales ocupan 1 col   │
│   ├──────┬─────┴──────┤      │                              │
│   │ 9:16 │ Quote/text │      │  ← bloques de texto/cita     │
│   │      │ (3 cols)   │      │    rompen el ritmo           │
│   ├──────┼────────────┴──────┤                              │
│   │ 9:16 │  YouTube           │                              │
│   │      │  (6 cols)          │                              │
│   └──────┴────────────────────┘                              │
├─────────────────────────────────────────────────────────────┤
│   FOOTER editorial (sobre fondo --color-ink)                │
└─────────────────────────────────────────────────────────────┘
```

**Reglas de ritmo en la grilla mixta:**
- Vertical (9:16) = 1 columna × 2 filas.
- Horizontal/YouTube (16:9) = 2 columnas × 1 fila.
- Cita o bloque de texto = 1 columna × 1 fila (para aire editorial).
- Nunca más de **3 verticales seguidas** sin romper con un horizontal o texto.
- Cada fila debe tener al menos **una variación de formato** — evitar parrilla uniforme.

### 5.2 Nota individual (`/nota/[slug]`) — tres variantes según formato

**Variante A — Short vertical (`formato: 'short'`)**
- Player vertical 9:16 centrado, altura `min(85vh, 900px)`.
- Fondo de la página en `--color-ink` con grano.
- A la derecha del video (desktop) o debajo (mobile): overline rojo + título display + bajada + autor + sujetos (chips de jugador/técnico/equipo) + descripción.
- Controles: play/pause, mute, progreso, compartir. Mute ON por default.
- Al terminar: sugerencia de siguiente short + botón "seguir en feed".

**Variante B — YouTube (`formato: 'youtube'`)**
- Player 16:9 al ancho completo del área de lectura (max 1100px).
- Debajo: título, bajada, autor, meta, descripción larga editorial.
- Debajo del player: **capítulos** si los hay (timestamps clickables que saltan el video).
- Sujetos relacionados como chips debajo de la descripción.

**Variante C — Artículo (`formato: 'articulo'`)**
- Portada de nota: foto full-bleed + título display serif en capa oscura con gradiente.
- Meta bar sticky: autor · fecha · categoría · tiempo de lectura · compartir.
- Cuerpo: columna `68ch`, `Inter 1.0625rem / 1.7`.
- Pull quotes: display serif `clamp(1.75rem, 3vw, 2.75rem)` con borde izquierdo rojo 3px.
- Imágenes intercaladas full-bleed con caption monoespaciada.

**Común a las tres:** bloque de autor + 3 notas relacionadas (misma división o mismo sujeto) al final.

### 5.3 Feed vertical full-screen (`/feed` o modal desde cualquier short)

Modo TikTok. Un short por viewport, scroll snap vertical.

```
┌────────────────────────────────┐
│  ✕                             │  ← cerrar (vuelve a la card origen)
│                                │
│                                │
│     [VIDEO VERTICAL 9:16]      │
│     auto-play, mute default    │
│                                │
│                                │
│                                │
│  ENTREVISTA · RESERVA          │  ← overline rojo
│  Título de la nota aquí        │  ← display serif
│  por Autor · 2d                │  ← mono
│                                │
│  [♥] [💬] [↗] [🔇]             │  ← acciones verticales
│                                │
│  ───── swipe up ↑              │
└────────────────────────────────┘
```

- **Scroll snap** CSS (`scroll-snap-type: y mandatory`) para que cada video quede encuadrado.
- **Auto-play + mute** al entrar en viewport (IntersectionObserver al 70% visible).
- **Precarga inteligente**: solo carga el video actual + el siguiente. Los demás son póster.
- **Gestos mobile**: swipe up = siguiente, swipe down = anterior, tap = play/pause, doble tap = like.
- **Desktop**: flechas ↑↓ del teclado, rueda del mouse con throttle, scroll también funciona.
- **Cierre con GSAP Flip**: el card de origen y el video modal comparten `data-flip-id` → animación fluida de expansión/colapso.

### 5.4 Archivo filtrado (`/categoria/[slug]` o `/?division=reserva&formato=short`)

### 5.3 Archivo filtrado (`/categoria/[slug]`)

- Cabecera con nombre de categoría en display gigante + conteo de notas.
- Grilla estándar (3 columnas en desktop).
- Sin hero destacado.

---

## 6. Componentes

### 6.1 NotaCard — componente unificado con 3 formatos

El componente decide su variante visual según `nota.formato`:

**`formato: 'short'` → ShortCard (vertical 9:16)**
```
┌──────────┐
│          │
│  VIDEO   │  ← poster estático, al entrar en viewport
│  9:16    │    auto-play muted y loop
│          │
│  overlay │  ← gradiente inferior negro → transparente
│  meta    │  ← título sobre el video en la parte inferior
└──────────┘
   ENTREVISTA · 6TA     ← overline rojo debajo
   por Autor · 2d       ← mono
```
- Sin imagen separada: el video ES la tarjeta.
- Indicador de duración arriba-derecha: `0:42` en chip negro traslúcido.
- Click → abre VerticalFeed modal (ver 6.8) con transición GSAP Flip.
- Hover desktop: el video acelera sutilmente (`playbackRate: 1.25`) y sube el volumen del ícono.

**`formato: 'youtube'` → YouTubeCard (horizontal 16:9)**
```
┌───────────────────────────────┐
│                               │
│    [thumbnail YT 16:9]        │  ← `maxresdefault.jpg` o poster custom
│           ▶                   │  ← botón play grande al hover
│                   ┌─────┐     │
│                   │12:34│     │  ← duración abajo-derecha
│                   └─────┘     │
└───────────────────────────────┘
   ANÁLISIS · PRIMERA            ← overline rojo
   Título de la nota larga       ← display serif
   por Autor · 5d                ← mono
```
- Ocupa 2 columnas en la grilla bento.
- Click → página de detalle `/nota/[slug]` con YouTube embebido.

**`formato: 'articulo'` → ArticleCard (texto + foto)**
- Foto 4/5 o 1/1 + overline + título + bajada + meta.
- Variante especial sin foto (`text-only`): cita grande en display serif sobre fondo `--color-ink` con firma.

**Reglas comunes a las tres:**
- Hover en desktop: elevación sutil `transform: translateY(-2px)`, título con subrayado rojo 2px que entra desde la izquierda.
- Sin sombras burdas. Separación por espacio blanco y bordes `1px solid --color-neutral-200` cuando hace falta.
- Chip de formato en esquina superior izquierda si la grilla lo pide: `SHORT` / `VIDEO` / `NOTA`.

### 6.2 FilterBar

Sticky debajo del hero. Dos filas:

- **Tipo de nota** (chips): Todas · Entrevistas · Perfiles · Crónicas · Análisis · Columnas.
- **Categoría / División** (chips): Primera · Reserva · 4ta · 5ta · 6ta · 7ta · 8va · 9na · Femenino.
- Extremo derecho: selector de orden (Recientes / Más leídas / Por jugador).

Chip activo: fondo `--color-ink`, texto `--color-paper`, con un subrayado animado rojo 2px en el borde inferior.
Chip inactivo: fondo transparente, borde `1px solid --color-neutral-300`, hover eleva a `--color-neutral-100`.

Filtros se combinan (tipo + categoría). URL refleja estado: `/?tipo=entrevista&division=reserva`.

### 6.3 Nav

- Izquierda: logo "Inferiores Riverplatense" en display serif condensado + monograma rojo.
- Centro: Portada · Entrevistas · Perfiles · Jugadores · Archivo.
- Derecha: buscador (ícono que expande a input overlay) + suscripción (botón rojo).
- Estado scrolled: fondo `--color-paper` con `backdrop-filter: blur(12px)` y borde inferior de 1px.

### 6.4 PlayerCard (ficha de jugador, para `/jugadores/[slug]`)

- Retrato vertical 4/5.
- Nombre display serif, puesto en mono UPPERCASE, división actual como chip rojo.
- Listado de notas vinculadas al jugador, debajo, en estilo de lista editorial con hairline separators.

### 6.5 Buttons

```css
.btn-primary {
  background: var(--color-river-red);
  color: var(--color-paper-pure);
  padding: 0.875rem 1.5rem;
  border-radius: 2px;   /* radios bajos, editorial, no pill */
  font-family: var(--font-body);
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: background 180ms var(--ease-out-expo), transform 180ms;
}
.btn-primary:hover { background: var(--color-river-red-deep); transform: translateY(-1px); }

.btn-ghost {
  background: transparent;
  color: var(--color-ink);
  border: 1px solid var(--color-neutral-300);
  /* resto idem */
}
```

### 6.6 VerticalFeed (modal TikTok)

Componente full-screen que lista shorts en scroll snap vertical. Ver layout en sección 5.3.

API esperada:
```ts
<VerticalFeed
  notas={shortsArray}           // solo notas con formato 'short'
  initialSlug={slug}            // short que abre primero
  onClose={() => ...}            // cierra con Flip hacia card origen
  filter={{ division, tipo }}    // respeta filtros activos
/>
```

Comportamiento:
- Monta 3 `<video>` a la vez (anterior, actual, siguiente) para que la transición sea instantánea.
- El resto son posters con blurhash hasta que se acercan al viewport.
- Barra de progreso ultra-fina 1px arriba, color `--color-river-red`.
- Modo "auto-advance" opcional: cuando el video termina, va al siguiente después de 400ms.
- Persiste el estado mute del usuario en `localStorage`.

### 6.7 PullQuote

```
  ▌ "Cita del jugador entrevistado en
  ▌  display serif grande, leading ajustado,
  ▌  con la firma debajo en mono."
     — Nombre del jugador, 5ta División
```

Borde izquierdo rojo 3px, padding `--space-6` izquierda.

---

## 7. Imagen y tratamiento fotográfico

- Fotos de entrevistas en **blanco y negro** en cards secundarias, con overlay rojo `mix-blend-mode: multiply; opacity: 0.08` para unificar.
- Fotos **a color** solo en: hero de portada, portada de nota individual, y galerías internas.
- Grain sutil sobre hero: `background-image: url('noise.png'); opacity: 0.06; mix-blend-mode: overlay;`.
- Captions siempre en mono, `color: --color-neutral-500`, con guión largo: `— Foto: Nombre`.

---

## 8. Motion

```css
:root {
  --dur-fast: 150ms;
  --dur-normal: 280ms;
  --dur-slow: 520ms;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
```

- Entrada de la portada: hero con leve parallax del 6% sobre scroll, texto con fade+rise 24px en cascada (duración 520ms con stagger 80ms).
- Hover de links de nota: subrayado rojo 2px que entra desde la izquierda (`transform: scaleX(0→1)`, origen `left`, duración 280ms).
- Filtros: cambio de estado activo con transición de fondo 180ms.
- **Respetar `prefers-reduced-motion`**: desactivar parallax, staggers y cualquier animación decorativa.

---

## 9. Accesibilidad

- Contraste mínimo AA en cuerpo, AAA objetivo en títulos.
- Foco visible en todo interactivo: `outline: 2px solid var(--color-river-red); outline-offset: 3px;`.
- Navegación por teclado completa en FilterBar (flechas entre chips, Enter para activar).
- Alt descriptivo en todas las fotos (no "imagen" genérico — nombre del jugador y contexto).
- `prefers-reduced-motion` respetado.
- Jerarquía semántica: `<article>` por nota, `<time datetime="...">`, `<figure>` + `<figcaption>`.

---

## 10. Performance (targets)

- LCP < 2.0s en portada. Hero image precargada con `fetchpriority="high"`.
- Tipografías: solo 2 pesos del display (400, 700) y 3 del body (400, 500, 700) para arrancar.
- Imágenes: AVIF/WebP, dimensiones explícitas, lazy loading fuera de hero.
- JS de la portada < 100kb gzipped. Animaciones en CSS salvo parallax (IntersectionObserver + rAF).

---

## 11. Don'ts (anti-patrones para este proyecto)

- ❌ Plantilla genérica de blog con sidebar de "últimas entradas".
- ❌ Rojo como fondo de bloques grandes.
- ❌ Carrusel auto-playing de notas en portada.
- ❌ Sombras difusas tipo Material Design en cards.
- ❌ Iconografía genérica de redes en el hero.
- ❌ Modal oscuro al entrar pidiendo newsletter (está bien más abajo, no de entrada).
- ❌ Fuentes del sistema sin intención editorial.
- ❌ Animaciones decorativas en el cuerpo de la nota (molestan la lectura).

---

## 12. Stack recomendado

- **Framework**: Astro (ideal para sitio editorial con poca interactividad) o Next.js 15 (App Router) si se prevé CMS integrado.
- **CMS**: Sanity, Contentful o directamente MDX en el repo para empezar.
- **Estilos**: CSS variables + Tailwind v4 (o CSS modules puro). Nada de UI kits genéricos.
- **Tipografía**: Google Fonts con `display=swap` y preload de la variante crítica. Alternativa: auto-host via Fontsource.
- **Imágenes**: Next/Image o Astro `<Image>` con formatos modernos.
- **Analítica**: Plausible o Umami (livianos, sin cookies intrusivas).

---

## 13. Cómo jugamos con el formato vertical-first

El contenido vertical 9:16 es una **ventaja de diseño**, no una limitación. Ideas concretas que convierten el formato en identidad:

### 13.1 Hero híbrido con short en vivo
La portada no es una foto estática: el **short destacado se reproduce en loop muted** al lado del título editorial gigante. El título display serif vive en la mitad izquierda, el video vertical en la derecha. Da la sensación de revista + broadcast. Sobre mobile, el video ocupa 100vh detrás del título con overlay oscuro.

### 13.2 Rail de shorts "En el feed"
Arriba de la grilla editorial, un **rail horizontal scrolleable** con los últimos 8-10 shorts (9:16). Auto-play muted al entrar en viewport, uno a la vez (no todos juntos — mata la batería y la performance). Estilo stories pero editorial: overline rojo debajo de cada card, no círculo con borde.

### 13.3 Grilla bento mixta con ritmo forzado
Verticales y horizontales se mezclan con reglas estrictas (ver 5.1): el lector nunca ve una parrilla uniforme. El horizontal de YouTube funciona como **respiro visual** entre columnas verticales. Bloques de texto/cita rompen aún más el ritmo.

### 13.4 Transición card → feed con GSAP Flip
Cuando clickeás un short en la grilla o el rail, la card **se expande hacia el centro** y se transforma en el VerticalFeed full-screen. Shared element via `data-flip-id`. Al cerrar, vuelve a su posición original. Esto hace que la navegación se sienta como una app nativa, no como una web.

### 13.5 Kinetic typography sobre el short
Durante los primeros 2 segundos del video, una **cita textual del entrevistado aparece superpuesta** en display serif grande, con animación de entrada (GSAP SplitText por palabra). Luego se desvanece. Le da peso editorial al contenido efímero. Opcional por nota (campo `quote_overlay` en el schema).

### 13.6 "Modo feed" dedicado
Un botón en el nav lleva a `/feed`, una experiencia 100% TikTok-like pero con los shorts del sitio. Sirve para sesiones largas de scroll, para mobile sobre todo. Los filtros siguen aplicando, así que podés hacer "modo feed de la Reserva" o "modo feed de entrevistas".

### 13.7 Poster frame inteligente
Cada short tiene un **poster frame elegido a mano** en el ABM (frame del video en `t=X` o imagen subida aparte). No el primer frame automático que suele ser feo. Esto se nota mucho en la grilla cuando los videos no están reproduciendo.

### 13.8 Metadata overlaid vs. debajo
- En **rail** y **modo feed**: metadata sobre el video (overlay inferior con gradiente).
- En **grilla bento**: metadata debajo del video, editorial clásico.
- Nunca las dos cosas juntas — la grilla necesita respirar.

### 13.9 Página de sujeto con feed vertical dedicado
`/jugador/[slug]` o `/tecnico/[slug]` muestra **todas las notas vinculadas a esa persona**. Si la mayoría son shorts, la página entera puede ser un VerticalFeed filtrado. Si son mixtas, grilla bento pero todas de ese sujeto.

---

## 14. Checklist de calidad visual

Antes de aceptar un componente:

- [ ] ¿Se ve como una pieza de revista deportiva, no como template?
- [ ] ¿El rojo está usado con intención, no decorativamente?
- [ ] ¿Hay jerarquía clara por escala tipográfica, no por color?
- [ ] ¿La foto está recortada con criterio editorial?
- [ ] ¿Hay respiración suficiente alrededor del título principal?
- [ ] ¿El hover estado se siente diseñado, no default?
- [ ] ¿Funciona igual de bien en 320px y en 1920px?
- [ ] ¿Respeta `prefers-reduced-motion`?
