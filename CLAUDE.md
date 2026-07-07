# Inferiores Riverplatense

Sitio de periodismo dedicado a las divisiones formativas del **Club Atlético River Plate**. Portfolio / publicación de un periodista que hace **notas, entrevistas y noticias** sobre las inferiores.

> **Importante para futuras sesiones**: NO es un mega-site editorial. Es un **portfolio periodístico enfocado en notas, entrevistas y noticias**. Evitar features de mega-portal (feeds tipo TikTok a pantalla completa, tickers de resultados en vivo, widgets de scores/fixtures, comentarios/cuentas públicas, multi-autor). Las cosas se ajustan al uso real.
>
> **⚠️ Nav (revertido 2026-05): el usuario CAMBIÓ de opinión sobre el "nav simple".** Ahora SÍ usa un **masthead de diario de 3 niveles** (barra roja con info + masthead negro con logo grande + barra de secciones sticky con dropdowns Divisiones/Notas + buscador), estilo Roca&Madre / Doble Amarilla, y lo aprobó. El buscador y los filtros por división/tipo/tema son features deseadas. **No restaurar el nav de 4 items.** (Memoria `feedback_nav_simple`, actualizada).

---

## Estado actual (modo DEMO enriquecido)

Sigue siendo material de demo para cliente, pero ya **no** está recortado a `/` + `/ui`: el 2026-05-31 se repusieron las páginas internas y se sumó SEO. Rutas vivas:

- **Portada `/`** con contenido real: hero → 3 teasers → bento → newsletter. Tiene **modo filtrado** (`?tipo` / `?division` / `?tema` / `?q`) que alimenta el nav. ✓
- **`/nota/[slug]`** (SSG, 22 páginas) — detalle de nota: `.article-prose`, byline con tiempo de lectura, badge **"Lo contamos primero"** (`primicia`), sujetos linkeados al hub, JSON-LD, OG por nota, ShareBar (WhatsApp/X/copiar), AuthorBio, relacionadas. ✓
- **`/jugador/[slug]`** (SSG, 5 jugadores) — hub de seguimiento: bio + contador + **línea de tiempo** de toda la cobertura del jugador. El diferenciador de cantera. ✓
- **`/sobre`** — página del periodista (Pablo Molina): bio + stats reales (notas/divisiones/jugadores) + CTAs. ✓
- **`/contacto`** — métodos directos (mail/WhatsApp para datos y primicias) + form (fake submit, sin backend aún). ✓
- **Nav masthead de diario** (3 niveles, responsive con hamburguesa). Sobre/Contacto viven en la barra roja superior + footer + panel mobile. Ver sección Nav. ✓
- **Footer brutalist**, **SocialRail** (desktop), **ScrollToTop**, **NewsletterBand** (`#newsletter`). ✓
- **`/ui`** = design system en lenguaje no técnico (visible para el cliente; `disallow` en robots). ✓
- **SEO**: `sitemap.xml`, `robots.txt`, `feed.xml` (RSS), `not-found.tsx` (404 brutalist), `metadataBase` + iconos. ✓
- **Cards/links internos** → ahora apuntan a `/nota/${slug}` reales. ✓

### ✅ Contenido REAL + dominio (2026-07-07) — SE FUERON LOS MOCKS

- **Dominio comprado: `inferioresriverplatense.com`**. `lib/site.ts` centraliza `SITE_URL`: `NEXT_PUBLIC_SITE_URL` lo pisa siempre; sin env var, producción cae al dominio y dev a localhost. Lo importan layout/nota/jugador/autor/sitemap/robots/feed/equipo-actions (no queda ningún fallback duplicado). `robots` ahora también disallow `/admin`.
- **Contenido real en la DB**: `scripts/seed-data.ts` = 22 notas (`nr-01..nr-22`) redactadas a partir de hechos reales de may–jul 2026 (Superclásico de Reserva por penales + final vs Racing, historia de Meloni, 8 juveniles citados por Escudero, gira de Coudet en Alicante, 2-2 vs Flamengo en Faro, final del Apertura perdida con Belgrano, mercado Otamendi/Arambarri/Borré/Beltrán/Correa, lesión de Ruberto, renovación de Subiabre, MagiCup 2014, femenino, estructura del semillero) + 8 sujetos reales (5 jugadores con hub: Meloni, Pellegrini, Sayago, Subiabre, Ruberto; Spiff sin slug; técnicos Escudero y Coudet). **Texto propio** (no copiado de medios) e **imágenes Unsplash verificadas una por una** (nada de fotos de agencias, por derechos).
- **Cuerpos en Tiptap**: el seed convierte `parrafos` ("## " = h2, "> " = cita) a JSON Tiptap en la columna `cuerpo` → editables en el panel tal cual. `contenido` legacy queda null; el tiempo de lectura ahora sale del cuerpo (`textoDelCuerpo()` en `lib/render-cuerpo.ts`).
- **`scripts/seed.ts`** ahora: borra los mocks si existen (`id ~ '^n-[0-9]+$'` y `jug|tec|eq-*`; los FK cascade limpian pivote y visitas) y upsertea el contenido real. Idempotente. ⚠️ Las visitas viejas se fueron con las notas mock: el contador arranca de cero.
- **`lib/mock-data.ts` BORRADO.** `/ui` usa fixtures propios (`app/(sitio)/ui/_fixtures.ts`); `SobreAutorBand` y `/sobre` leen la firma real vía `getAutorPrincipal()` (`lib/autores.ts`).
- ⚠️ **Lección**: si tras cambiar contenido aparecen 404 "fantasma" en páginas SSG que existen en la DB → `rm -rf .next` y rebuild (el fetch-cache viejo de `.next/cache` envenena el prerender; el build NO falla, hornea la página como 404).
- Pendiente inmediato: deploy en Vercel + DNS del dominio (el código ya apunta ahí solo).

### ✅ Fase 1 "Cimientos Supabase" COMPLETADA (2026-07-04)

En camino al **dashboard admin** (spec: `docs/superpowers/specs/2026-07-04-admin-dashboard-design.md`, plan: `docs/superpowers/plans/2026-07-04-fase-1-cimientos-supabase.md`):

- **Supabase conectado** (proyecto `mqsbbptkhkkjjrkdwgvf`, región us-west-2). Keys en `.env.local` (URL + anon/publishable + `SUPABASE_DB_URL` para scripts). NO hay service_role key; los scripts locales usan conexión directa Postgres.
- **Schema en DB**: `autores` (firmas), `profiles` (cuentas, rol admin/editor), `sujetos`, `notas` (con `estado` borrador/programada/publicada), `nota_sujetos`, `nota_visitas` + bucket `imagenes`. Migraciones versionadas en `supabase/migrations/*.sql` — correr con `npx tsx scripts/run-migrations.ts`.
- **RLS activa y verificada** (`scripts/check-rls.ts`): anon solo lee publicadas; escritura bloqueada sin sesión; `nota_visitas` invisible al cliente.
- **Seed**: `npx tsx scripts/seed.ts` (idempotente). Desde 2026-07-07 siembra el CONTENIDO REAL de `scripts/seed-data.ts` y elimina los mocks si siguen en la DB (`lib/mock-data.ts` ya no existe).
- **`lib/notas.ts` lee de Supabase** (misma interfaz; cliente anónimo sin cookies para que funcione en SSG/build). Mapper DB→`Nota` en `lib/notas-mapper.ts` con tests (`npm test`, vitest).
- **Auth**: login magic-link (`/admin/login`, estética "acreditación de prensa"), callback `/auth/callback` (valida que exista `profile`, si no → sin acceso), **`proxy.ts`** (Next 16, ex-middleware) protege `/admin/*`. Placeholder `/admin` muestra sesión+rol.
- **Route groups**: páginas públicas en `app/(sitio)/` con su layout (Nav/Footer/SocialRail/Lenis); root layout = solo fuentes/metadata; `/admin` tiene layout limpio propio.

### ✅ Fase 2 "El Panel" COMPLETADA (2026-07-04)

Panel funcional en `/admin` (plan: `docs/superpowers/plans/2026-07-04-fase-2-panel.md`), estética "mesa de redacción" (sidebar ink + Anton, chips de estado, tablas brutalist):

- **Layout**: `app/admin/(panel)/layout.tsx` (guard + `AdminSidebar`); login fuera del grupo. CSS del panel al final de `globals.css` (`.admin-*`, `.chip-estado-*`, `.editor-cuerpo`).
- **Resumen `/admin`**: scoreboard (publicadas/borradores/programadas/firmas) + borradores para retomar + últimas publicadas.
- **Notas `/admin/notas`**: tabla filtrable (estado/tipo/división/firma/búsqueda, GET sin JS) + acciones por fila (`NotaAcciones`: publicar/despublicar/destacar/borrar-solo-admin).
- **Editor `/admin/notas/nueva|[id]`**: `EditorNota` + `TiptapEditor` (B/I/H2/H3/cita/listas/link/imagen-upload/YouTube; edita con `.article-prose` = WYSIWYG real). Sidebar metadata: firma/tipo/división/formato/sujetos/tags/primicia/destacada/poster-upload + publicación borrador|ahora|programada.
- **⚠️ Estados**: en DB solo persisten `borrador`/`publicada`. "Programada" es DERIVADO (publicada con fecha futura; la RLS la oculta hasta que llegue — sin cron). Editar una publicada NO le pisa la fecha original.
- **Autores `/admin/autores`**: grilla + `EditorAutor` (foto upload, bio, cargo, redes). Solo admin escribe; editor ve solo-lectura.
- **Uploads**: `lib/admin/upload.ts` → bucket `imagenes` (`posters/`, `autores/`); host de Storage agregado a `next.config.mjs` remotePatterns.
- **Render público**: `lib/render-cuerpo.ts` (`@tiptap/html`); la nota pública prioriza `cuerpo` Tiptap y cae a `contenido` legacy. `generateStaticParams` de notas ya NO usa MOCK_NOTAS.
- **Capa admin**: `lib/admin/notas-admin.ts` (list/get con sesión, RLS decide) + `lib/admin/actions.ts` (server actions con errores traducidos + revalidatePath).
- Flujo verificado e2e con Playwright: crear → subir poster a Storage → borrador → publicar → visible en el sitio → borrar → 404.

### ✅ Fase 3 "Autor público + visitas" COMPLETADA (2026-07-04)

- **`/autor/[slug]`** (SSG) — perfil público de la firma: ficha con foto/cargo/bio/redes/contacto + grid de toda su cobertura. JSON-LD `ProfilePage`/`Person` (E-E-A-T). En sitemap. Bylines linkeados: byline del detalle de nota + `AuthorBio` (que ahora lee bio/cargo REALES de la DB vía `lib/autores.ts`, se borraron las bios hardcodeadas).
- **Contador de visitas propio**: `POST /api/visita` (service role; valida slug publicado, hash sha256 de ip+ua+día, dedupe 30 min) + `RegistrarVisita` (ping client con sessionStorage) en el detalle de nota. Migración `004_visitas.sql`: policy de lectura staff + vista `nota_visitas_resumen` (total/7d/30d, `security_invoker`).
- **Stats en el panel**: `lib/admin/stats.ts`; Resumen con celda "Visitas · 7 días" en el marcador + lista "Más leídas"; tabla de Notas con columna Visitas.
- `Autor` ganó `slug?` (viene en los SELECT de notas público y admin).

### ✅ Fase 4 "Estadísticas + Equipo" COMPLETADA (2026-07-04) — DASHBOARD TERMINADO

- **`/admin/estadisticas`** — selector de período (7d/30d/histórico vía `?periodo`), top 10 notas con barras, rankings por división/tipo/firma. Todo del contador propio.
- **`/admin/equipo`** (solo admin) — invitar por email con rol (crea el `profile` al invitar, `inviteUserByEmail`), cambiar rol, vincular cuenta↔firma, revocar acceso (borra el profile; el callback rechaza sin profile). Guardas: no podés sacarte admin ni revocarte a vos mismo; cada action re-verifica admin server-side.
- `lib/admin/equipo.ts` es **server-only** (lee `auth.users` con service role); `lib/admin/equipo-actions.ts` = actions.
- Sidebar con Estadísticas + Equipo (Equipo solo visible para admin).
- Auth de Supabase ya configurado (signups OFF, admin invitado con profile). Rate limit SMTP gratis ~2 mails/hora: la pantalla Equipo lo avisa; fallback `scripts/gen-login-link.ts`.

### ✅ Rediseño del panel v2 "Cierre de edición" — Fases 1–3 + responsive (2026-07-04)

Propuesta completa en `docs/superpowers/specs/2026-07-04-admin-redesign-v2-propuesta.md` (fases 4–6 pendientes: sparklines/deltas, stats con referers+CSV, autores/equipo pro). Hecho:

- **Feedback core**: `Toasts.tsx` (provider en el layout del panel, `useToast()`), `ConfirmDialog.tsx` (`<dialog>` nativo brutalist — NO queda ningún `window.confirm`), `SelloEstado.tsx` (sellos con tokens semánticos `--estado-*`: verde tinta publicada / azul programada / gris borrador / ámbar pendiente; **el rojo River queda reservado a identidad+acción**). Cambio de rol en Equipo ahora confirma con consecuencias.
- **Notas pro**: filtros auto-aplicables (`FiltrosNotas.tsx`, GET client-side + debounce), chips de filtros activos que se quitan de a uno, orden por columna (`?orden=fecha|visitas|titulo&dir=`), paginación (25/pág), filas con poster thumb + avatar de firma + sello primicia, menú ⋯ (`MenuAccionesNota.tsx`, posicionado `fixed` para escapar del overflow de la tabla) con Duplicar (`duplicarNota` action). Tabla→cards en mobile vía CSS (`data-label` en celdas); columnas Tipo/División `hidden lg:table-cell` (en tablet viven en filtros/cards).
- **Editor blindado** (`EditorNota` reescrito + `BarraEditor`/`ChecklistPublicacion`/`PreviewCardNota`): barra sticky con sello + estado de guardado + submit; **autosave cada 30s solo de borradores** (`silencioso: true` no revalida rutas); aviso al salir con cambios (beforeunload + ConfirmDialog); contador de palabras/lectura; **checklist que bloquea publicar incompleto** (borradores pueden guardarse incompletos — `validar()` solo exige bajada/poster al publicar); tab "Cómo se ve" con la TeaserCard real; metadata en `<details>` plegables. Las páginas nueva/[id] ya no usan PageHeader (la barra lo reemplaza).
- **Responsive verificado** (Playwright, 45 combinaciones ruta×ancho sin overflow horizontal): sidebar mobile con **hamburguesa** (2026-07-05: reusa `.nav-burger`/`.nav-mobile-panel`/`.dropdown-backdrop` del nav del sitio; el `.admin-sidebar` sticky es el ancestro posicionado del panel; cierra al navegar/Escape/backdrop) + "+ nueva" compacta y usuario/Salir dentro del panel; marcador 2 col en mobile. ⚠️ **`.admin-shell { position: relative; overflow-x: clip }` es load-bearing**: sin el `relative`, los `sr-only` (absolutos sin ancestro posicionado) anclan en `<html>` y le inflan el scroll horizontal a toda la página; `clip` no rompe los sticky.
- `.chip-estado-*` fue reemplazado por `.sello-*`; `NotaAcciones.tsx` borrado (lo reemplaza `MenuAccionesNota`).

### ✅ Autores v2 "Legajo de firmas" (2026-07-05)

Spec: `docs/superpowers/specs/2026-07-05-autores-legajo-design.md`.
- **Grilla**: cards de legajo con mini marcador (N notas · N visitas · última hace X), `PerfilCompleto` (barra 4 segmentos foto/cargo/bio/redes + "Perfil 3/4", `itemsPerfil()` exportado) y dos acciones: Editar legajo + Ver perfil público ↗ (la card ya no es un link entero).
- **Detalle `[id]`** = legajo: PageHeader nombre+cargo+CTA perfil público, tira con foto + PerfilCompleto + marcador (Publicadas/Borradores/Visitas Anton), grid `[form enmarcado | NotasDeFirma]`. `NotasDeFirma` lista hasta 10 notas con sello+fecha+visitas y pie "Ver todas en Notas →" (`?autor=`).
- Nueva firma: form enmarcado solo. Datos: `listNotasAdmin({autor_id})` + mapa de visitas (nada nuevo en server).

### ✅ Editor de notas v2 "La redacción" — canvas editorial (2026-07-05)

Spec: `docs/superpowers/specs/2026-07-05-editor-canvas-design.md`. El editor dejó de ser formulario:

- **Canvas**: hoja `brut-frame-shadow` de 760px donde se escribe SOBRE la nota como se publica — overline contextual (tipo · división + primicia-badge), título textarea auto-grow sin borde (`.canvas-titulo`, Newsreader clamp), bajada como copete (`.canvas-bajada`, contador solo con foco), **URL inline** ("/nota/slug ✎", click para editar), filete, y el cuerpo Tiptap **en modo canvas** (`enCanvas`: sin caja, toolbar flotante sticky `.toolbar-canvas`). Foco accesible: outline punteado rojo con offset (no desplaza texto).
- **BarraEditor v2, sin radios**: borrador → `[Guardar borrador]` + `[Publicar ▾]` (Publicar ahora / Programar fecha… con panel datetime anclado; ítems deshabilitados muestran el motivo del checklist adentro del menú) · publicada → `[Guardar cambios]` + `▾ Despublicar` (ConfirmDialog; guarda cambios y baja a borrador = `guardarNota` modo borrador) · programada → `[Guardar]` + `▾` (Publicar ahora / Cambiar fecha… / Despublicar). Contexto a la izquierda: "Nueva nota"/"Editando" + sello.
- `EditorNota`: `modo` dejó de ser estado UI — cada acción llama `guardar(modo, fecha?)`. Enter en el form = acción primaria del estado. Ficha reordenada: "¿Lista para salir?" (checklist) → Clasificación → Imagen → Extras (sin radios). Autosave gatillado por `estadoActual === "borrador"`.
- ⚠️ Tailwind v4: `lg:grid-cols-[minmax(0,1fr)_320px]` NO genera la clase (la coma) — usar `lg:grid-cols-[1fr_320px]` + `min-w-0` en el hijo.

### ✅ Estadísticas v2 "Historia en 3 actos" (2026-07-05)

Spec: `docs/superpowers/specs/2026-07-05-estadisticas-v2-design.md`. `/admin/estadisticas` reescrita: un solo scroll con 3 secciones (separador = título Anton + regla 2px + detalle mono, sin overline con raya) y **el período afecta a TODA la página** (`?periodo=7d|30d|90d|total`, default 7d):

- **Datos period-aware**: `getVisitasCrudas(desde)` en `lib/admin/stats.ts` lee `nota_visitas` cruda (RLS staff de 004; paginado de a 1000) — para el delta trae `2×período` y se parte con `partirPorCorte`. Agregaciones PURAS en `lib/admin/stats-periodo.ts` (serie diaria TZ Buenos Aires, `agruparPorSemana` si >60 puntos, porHora/porDispositivo/porFuente/porNota, `normalizarFuente` parsea el referer completo) con tests vitest. Las vistas SQL `visitas_por_*` quedan solo para el Resumen.
- **La evolución**: módulo grande `[1fr_300px]` — gráfico diario/semanal (GraficoBarras `tono="claro"` alto 190) + insight; panel ink con total gigante Anton, `Delta` (ganó prop `contexto`), mejor día y promedio diario. En Histórico la serie arranca en la primera visita y no hay delta.
- **Qué rinde**: ranking COMPLETO de notas del período (posición + barra + total histórico como columna secundaria, oculta en Histórico) + 3 rankings División/Tipo/Firma con `FilasBarra conPorcentaje` (nueva prop).
- **Quién lee**: fuentes con %, `BarraDividida` mobile(rojo)/desktop(ink)/sin-dato(gris) y horario de 24 barras con la franja pico resaltada (GraficoBarras ganó prop `resaltados: number[]`) + "tu mejor ventana".
- Verificado: 16 combinaciones período×ancho (375/768/1024/1440) sin overflow horizontal.

### ✅ Resumen v2 "Tablero de cierre" (2026-07-04)

Spec: `docs/superpowers/specs/2026-07-04-resumen-tablero-design.md`. `/admin` rediseñado:

- **Migración `005_resumen.sql`**: columna `dispositivo` en `nota_visitas` + vistas `security_invoker` `visitas_por_dia/hora/dispositivo/referer` (staff-only vía RLS de la tabla base; hora en TZ Buenos Aires).
- **⚠️ Fix del referer**: el header Referer del ping era la URL de la propia nota. Ahora `RegistrarVisita` manda `document.referrer` en el body (`ref`) y la API lo valida (descarta host propio). Filas viejas → "Sin dato". La API también detecta `dispositivo` del UA.
- **Franja tablero** (ink + shadow-red): Visitas·7días GIGANTE con `Delta` vs los 7 previos + 4 números chicos (Publicadas con "+N esta semana") + `GraficoBarras` de 14 días (SVG propio, pico en rojo) con insight textual ("El sábado fue el mejor día: N visitas").
- **NotaDelMomento**: la más leída de la semana con poster + visitas estampadas + "N× más que la segunda" + top 2°–5° al pie (reemplaza el módulo "Más leídas").
- **Mini-módulos** (`FilasBarra`): De dónde llegan (fuentes normalizadas en `getFuentes()`: Google/IG/X/etc.), Mobile vs Desktop, A qué hora leen (`franjaPico` = mejor ventana de 4hs).
- **ProximasProgramadas** (agenda con fecha en cubo) + Para retomar + Últimas publicadas en fila de 3.
- **Ritmo de publicación** como descripción del PageHeader ("Última nota hace N días · M en {mes}", en rojo si N>7). `PageHeader.descripcion` ahora acepta ReactNode.
- Regla de armonía: `gap-6`/`mb-6` únicos, todos los módulos = `brut-frame-shadow` + header ink, `items-stretch` con contenido centrado en los minis.

### Pendiente (post-dashboard)

- Del rediseño v2 del panel queda: estados de invitación (pendiente/reenviar) en Equipo. CSV en Estadísticas se descartó a propósito (se agrega si aparece la necesidad).
- SMTP propio (Resend u otro) para que invitaciones/logins no choquen el rate limit.
- Cablear form de `/contacto` y newsletter a algo real.
- Handles reales en `SocialRail` + mail/WhatsApp reales en `/contacto`.
- Deploy a Vercel + DNS de `inferioresriverplatense.com` (comprado 2026-07-07; el código ya cae a ese dominio en prod vía `lib/site.ts`). Opcional: subdominio `admin.*` (rewrite).

---

## Stack

- **Next.js 16** (App Router, Turbopack) — corre en 16.2.4
- **React 19.2**
- **TypeScript 6** (`strict` true)
- **Tailwind v4** (vía `@tailwindcss/postcss`)
- **Lenis** (smooth scroll, vía `LenisProvider`)
- **GSAP** (instalado, sin uso activo todavía)
- **Supabase JS** (instalado, pendiente de conectar)

### Fuentes (Google Fonts, via `next/font/google`)

- **Newsreader** → `--font-display` (titulares, pull quotes, logo)
- **Anton** → `--font-sports` (scores/marcadores; también nav items y labels por ser condensed + uppercase)
- **Inter** → `--font-body` (cuerpo)
- **JetBrains Mono** → `--font-mono` (meta, datos, overlines)

> Las fuentes de A/B sin uso (`Fraunces`, `Instrument_Serif`, `Playfair_Display`, `Bebas_Neue`) **ya fueron borradas** de `layout.tsx` (2026-05). El `@theme` en `globals.css` y el `<style>` de `layout.tsx` ahora mapean ambos a las CSS vars de next/font (mantener en sync).

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
- **Offset shadows pixel-perfect** (ej: `5px 5px 0`, hero/wide/noticias usan `8px 8px 0`), sin blur.
- **Sin rounded corners** anywhere (excepto avatares circulares y el logo badge).
- **Sin blurs** (ni shadows difusos ni backdrop-blur decorativos).
- **Hover snap** 120-160ms ease-out.
- **Hover "press" en CTAs**: la sombra se aplasta (5px→2px) + el botón se traslada 3px. Usar las clases `.brut-cta-*` (ver abajo).
- **Uppercase + tracking ancho** en labels de sección y nav (Anton).

### Sistema de dos rojos (por contraste / a11y)

- **`--color-river-red` (#EB192E)** — brillante. Para **superficies, bordes, fills de botones/badges, cuadritos decorativos, el borde 4px del nav, hovers y texto grande** (wordmark, números de stats, "404").
- **`--color-river-red-deep` (#C21020)** — profundo. Para **texto rojo CHICO sobre fondo claro** (overlines, kickers, labels, meta) y para la **barra roja superior del nav** (texto blanco chico encima). Pasa contraste AA; el brillante no (queda ~4.46:1).

### Accesibilidad (a11y) — estado

Auditado con **axe-core (WCAG 2.1 AA)**: pasan headings, landmarks, labels, foco, alt. Implementado: skip link "Saltar al contenido" + `.sr-only`; `aria-haspopup`/`aria-controls` + retorno de foco en dropdowns y panel mobile; `aria-live` en form de contacto y "copiar link"; avatares/logo decorativos con `alt=""`.

> **Excepción de marca DOCUMENTADA (decisión del usuario):** el texto **blanco sobre el rojo brillante `#EB192E`** (botón Newsletter, CTAs `.brut-cta-red`, format tags, badges, `.primicia-badge`) da **4.45:1**, a 0.05 del mínimo AA 4.5:1. **Se mantiene a propósito** porque #EB192E es el Pantone oficial del club y la brecha es imperceptible. **NO "arreglar" oscureciendo esos fondos** salvo pedido explícito.

### Utilidades CSS ya listas (en `app/globals.css`)

- `.font-display` / `.font-sports` / `.font-mono` / `.font-body`
- `.overline` — tipografía de overline editorial (rojo, mono, tracking)
- `.brut-frame` / `.brut-frame-red` — borde 2px
- `.brut-frame-shadow` / `.brut-frame-shadow-red` — borde + offset shadow
- `.brut-hover` / `.brut-hover-red` — hover que revela offset shadow
- `.brut-label` — etiqueta de sección (overline mono + tracking).
- `.brut-cta-red` / `.brut-cta-ink` / `.brut-cta-red-lg` — **CTAs con hover press** (sombra se aplasta + translate). `-red`/`-ink` = color del fondo; `-lg` = variante grande (ScrollToTop).
- `.chip` — botón tipo chip (dropdown items, tags)
- `.pull-quote` — cita con borde izquierdo rojo 3px
- `.hairline` / `.hairline-dark` — separadores finos
- `.bento` — grid 3col × 2row del bloque "Esta semana" (ver Estructura).
- `.article-prose` — tipografía de cuerpo de nota (drop cap rojo, h2/h3, blockquote). **En uso** en `/nota/[slug]`.
- `.share-btn` / `.primicia-badge` / `.sujeto-chip` — utilidades del detalle de nota (compartir, badge "lo contamos primero", chip de jugador linkeable).
- `.chips-scroller` — scroll horizontal de las secciones del nav **sin scrollbar visible**.
- **Scrollbar custom** (14px, track con borde ink, thumb ink, hover rojo).

> ⚠️ **Antipattern: el símbolo `§` no se usa en el sitio.** Si ves "§ Sección" en algún lado, sacalo — fue una idea temprana que el usuario rechazó.

### Componentes base (UI)

- `components/ui/BrutalistButton.tsx` — CTA primario. Borde 2px + offset shadow. Prop `onDark` adapta color del frame. Hover: shadow 5px→2px + traslada 3px.
- `components/ui/Dropdown.tsx` — filtro con label + valor seleccionado. Menu abierto tiene offset shadow 5px. Cerrar con click afuera o Escape.

### Cards y listas

- `components/cards/HeroFeature.tsx` — nota destacada. Split 50/50, borde 2px ink + shadow `8px 8px 0`, `minHeight 540px`. Meta empieza con avatar circular 32px. CTA "Leer la nota" usa `.brut-cta-ink`.
- `components/cards/WideFeatureCard.tsx` — entrevista wide del bento. Imagen 16:9 arriba + footer. Borde 2px ink + shadow `8px 8px 0` (matchea el hero). Usa `CardAuthorMeta size="md"`.
- `components/cards/NotaCard.tsx` — 3 variantes según `variant`/`formato`: `short` (9:16), `youtube` (16:9), `articulo` (4:5). Frame 2px ink, hover revela offset shadow. ArticleCard: `h-full flex flex-col`, footer `flex-1`, meta en `mt-auto`.
- `components/cards/TeaserCard.tsx` — card de los 3 teasers bajo el hero. Imagen 4:3 + footer. `h-full flex flex-col`, footer `flex-1`, meta en `mt-auto` (para que el autor quede al pie aunque el título sea de 1 línea).
- `components/cards/CardAuthorMeta.tsx` — bloque autor: avatar circular (24px `sm` / 28px `md`) con fallback de iniciales + nombre + punto rojo + fecha.
- `components/lists/NoticiasList.tsx` — `aside` de la columna de noticias del bento. Header + items (número + thumb 72×72 + meta + título) + footer. `h-full flex flex-col`, `overflow:hidden`, `min-height:0`, shadow `8px 8px 0`.
- `components/lists/UltimasList.tsx` — lista numerada (número Anton rojo + kicker + título + fecha). Disponible, no usada en la portada actual.

### Layout

- `components/layout/Nav.tsx` — **client component** (usa `useSearchParams`, por eso va envuelto en `<Suspense>` en `layout.tsx`). **Masthead de diario de 3 niveles** (ver sección Nav). La barra de secciones es `sticky top-0 z-50` con bottom border **4px red**. Responsive: en `<md` colapsa a una **hamburguesa** que abre un panel (buscador + secciones + chips). ⚠️ Las clases custom del nav (`.inline-search`, `.nav-burger`, `.nav-mobile-panel`) NO fijan `display` — eso lo controla Tailwind (`hidden`/`md:hidden`/`lg:flex`); si una clase custom fija `display`, pisa el responsive (bug ya corregido).
- `components/layout/Footer.tsx` — logo 72×72, secciones (Notas/Entrevistas/Noticias/UI), 9 divisiones, copyright + CTA newsletter. Top border 4px red.
- `components/layout/NewsletterBand.tsx` — client, `id="newsletter"` (target del CTA del nav). Fondo ink + shadow rojo `8px`. Disclaimer "Sin spam. Te das de baja desde cualquier mail.".
- `components/layout/SocialRail.tsx` — server, fijo a la izquierda en desktop. Orden: X, Instagram, TikTok, YouTube, Facebook. Hrefs placeholder.
- `components/layout/ScrollToTop.tsx` — client, fijo abajo a la derecha. Aparece con `scrollY > 400` (solo opacity, sin transform, para no chocar con el hover de `.brut-cta-red-lg`).
- `components/layout/LenisProvider.tsx` — wrapper de smooth scroll.

---

## Estructura del proyecto

```
app/
  layout.tsx              → root, fuentes, Lenis, Nav (en Suspense), SocialRail, Footer, ScrollToTop, metadata+viewport
  page.tsx                → portada (hero + teasers + bento + newsletter) + modo filtrado (?tipo/?division/?tema/?q)
  nota/[slug]/page.tsx    → detalle de nota (SSG, generateStaticParams + generateMetadata + JSON-LD)
  jugador/[slug]/page.tsx → hub de jugador con línea de tiempo (SSG)
  sobre/page.tsx          → página del periodista (bio + stats)
  contacto/page.tsx       → contacto (mail/WhatsApp + form)
  not-found.tsx           → 404 brutalist
  sitemap.ts              → sitemap (home + notas + jugadores)
  robots.ts               → robots (disallow /ui)
  feed.xml/route.ts       → RSS 2.0
  ui/
    page.tsx              → design system aplicado, lenguaje no técnico
    _components/UiDropdownDemo.tsx
  globals.css             → tokens + utilidades brutalist + nav + .bento + .article-prose + scrollbar

components/
  layout/   Nav.tsx (masthead 3 niveles + responsive), Footer, NewsletterBand, SocialRail, ScrollToTop, LenisProvider
  ui/       BrutalistButton, Dropdown
  cards/    HeroFeature, WideFeatureCard, NotaCard (short/youtube/articulo), TeaserCard, CardAuthorMeta
  lists/    NoticiasList, UltimasList (sin usar en portada)
  article/  ShareBar (client: WhatsApp/X/copiar), AuthorBio (bio al pie de la nota)
  contacto/ ContactForm (client: form fake-submit)

lib/
  types.ts      → Nota, Sujeto, Autor, FiltrosNota
  site.ts       → SITE_URL canónica (env > dominio en prod > localhost en dev)
  notas.ts      → capa de acceso: getNotas (con q/tags), getNotaPorSlug, getNotasRelacionadas, getSujetoPorSlug, getNotasPorSujeto, getSlugsDeJugadores
  constants.ts  → divisiones, tipos, formatters, norm(), tiempoLectura(), formatearFechaLarga()

scripts/
  seed-data.ts  → CONTENIDO REAL: 22 notas nr-01..nr-22 + 8 sujetos + 2 autores (fuente de verdad del seed)
  seed.ts       → limpia mocks + upsertea seed-data (cuerpos → Tiptap)

public/
  logo.webp               → badge circular del club (nav + footer)
```

### Layout de la portada `/` (orden de secciones)

1. **Hero** — `getNotaDestacada()` → `HeroFeature`.
2. **Teasers** — 3 `TeaserCard` (lo que no entra en el bento, sin youtube ni noticia).
3. **Bento "Esta semana"** — grid `.bento`: `WideFeatureCard` (cols 1-2, row 1) + 3 `NotaCard variant="articulo"` (nota-a col1·row2, nota-b col2·row2, nota-c col3·row2) + `NoticiasList` (col3·row1).
4. **NewsletterBand**.

> El slotting del bento elige por tipo/formato y usa un `Set` de reservados para que un teaser no duplique una nota del bento.

---

## Modelo de datos

Definido en `lib/types.ts`:

- **`Nota`** — pieza periodística. Campos clave:
  - `formato`: `short` | `youtube` | `articulo`
  - `tipo`: `entrevista` | `perfil` | `cronica` | `analisis` | `columna` | `noticia`
  - `fuente`: `propio` | `youtube` | `instagram` | `tiktok`
  - `video_url`, `youtube_id`, `poster_url`, `duracion_seg`
  - `quote_overlay` (opcional, kinetic typography sobre short)
  - `autor`, `sujetos[]`, `tags[]`
  - `publicada_en`, `actualizada_en`, `destacada`, `primicia` ("lo contamos primero"), `capitulos[]`
- **`Sujeto`** — polimórfico. `tipo`: `jugador` | `tecnico` | `equipo`. Campos `slug` + `bio` (para el hub `/jugador/[slug]`). Una nota puede tener 0..N sujetos.
- **`Autor`** — `rol`: `admin` | `editor`. Autor principal del mock: **Pablo Molina**; colaboradora: Sofía Domínguez.
- **`FiltrosNota`** — tipo, division, formato, sujeto_id, **`q`** (full-text), **`tags`** (match any), orden. La búsqueda full-text (sin acentos) vive en `lib/notas.ts`, NO inline en `page.tsx`.

### Divisiones soportadas

`primera` · `reserva` · `cuarta` · `quinta` · `sexta` · `septima` · `octava` · `novena` · `femenino`

### Tipos de nota

`entrevista` · `perfil` · `cronica` · `analisis` · `columna` · `noticia`

> Nota mock: todos los `youtube_id` están vacíos (`""`) — se sacó el Rick Astley placeholder. Cargar IDs reales cuando haya videos.

---

## Nav (masthead de diario — 3 niveles)

> Revierte el "nav simple" anterior. El usuario lo pidió e iteró hasta aprobarlo ("el fondo negro eso esta impecable").

**NIVEL 1 — barra roja**: fecha `es-AR` + Buenos Aires (izq) · kicker "De la Novena a la Primera" (centro) · redes Instagram/X/YouTube + "Nº 001" (der). Centro y derecha se ocultan en `<md`.

**NIVEL 2 — masthead negro (ink)**: logo badge `logo.webp` + wordmark "Inferiores *Riverplatense*" centrado, escalable (`clamp`), envuelve en pantallas chicas.

**NIVEL 3 — barra de secciones (sticky, ink, border-bottom 4px red)**:
- Dropdown **Divisiones▾** (9 divisiones) + dropdown **Notas▾** (perfil/cronica/analisis/columna) + **Entrevistas** (`?tipo=entrevista`) + **Noticias** (`?tipo=noticia`) + **Traspasos** (`?tema=traspasos`) + **Primera**/**Reserva** (`?division=`).
- **Buscador** (`flex-1`, atajo ⌘K) → empuja a `/?q=`.
- CTA **Newsletter** (ancla a `#newsletter`).
- **Mobile (`<md`)**: las secciones + buscador colapsan en una **hamburguesa** que abre un panel (buscador full-width + links + chips de divisiones/notas + Newsletter).

La portada (`app/page.tsx`) tiene **modo filtrado** que consume estos params (`?tipo`/`?division`/`?tema`/`?q`) y renderiza una grilla de resultados.

⚠️ Cuidado con el responsive: las clases custom NO deben fijar `display` (lo controla Tailwind). El `z-index` del `.dropdown-backdrop` es **40** (debajo de la barra sticky `z-50`) para que dropdowns/panel queden por encima.

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

### Imágenes remotas

`next.config.mjs` tiene `remotePatterns` para Unsplash (mock). Ojo: algunas URLs de Unsplash dan 404 — verificar con `curl` antes de usar.

---

## Pendiente priorizado

### Hecho (2026-05-31)
- ✅ Detalle `/nota/[slug]` (con `.article-prose`, byline, primicia, share, bio, relacionadas, JSON-LD, OG).
- ✅ Hub `/jugador/[slug]` con línea de tiempo.
- ✅ `/sobre` (bio + stats) y `/contacto` (mail/WhatsApp + form fake). Linkeados desde nav (barra roja) + footer + panel mobile.
- ✅ `href` de cards apuntando a la nota real.
- ✅ SEO: sitemap, robots, RSS (`feed.xml`), 404, OG/Twitter por nota, `metadataBase`.

### Para retomar desarrollo (post-demo)
1. **Cablear el form de `/contacto` y el newsletter** a algo real (Supabase/email). Hoy ambos son fake (no persisten).
2. **Handles reales en `SocialRail`** y mail/WhatsApp reales en `/contacto` (hoy placeholders).
3. **OG dinámico por nota** (`opengraph-image.tsx` con `ImageResponse`) si se quiere algo más lindo que el `poster_url`.

### Medio plazo (ABM real)
4. **Conectar Supabase** (auth + DB + storage).
5. **Schema SQL**:
   - `profiles` (extends `auth.users`, rol admin/editor)
   - **`sujetos` (UNA tabla con columna `tipo` jugador/tecnico/equipo)** — recomendado en vez de 3 tablas separadas: matchea el tipo `Sujeto` plano del código y permite FK real en el pivote. Incluir `slug`.
   - `notas` (principal; con `slug` único, índice desc en `publicada_en`, y `tsvector` generado para búsqueda)
   - `nota_sujetos` (pivote `nota_id` + `sujeto_id`, FK reales)
   - tags como `text[]` + índice GIN (no sobre-normalizar) · `suscriptores` (newsletter)
   - **RLS desde el día 1**: lectura pública de notas publicadas; escritura solo rol admin/editor.
6. **ABM protegido** — login magic-link, CRUD de notas, asociación a sujetos.
7. **Upload de video vertical** — Supabase Storage directo, no Mux (costo).
8. **Embed YouTube** — solo guardar ID, el player lazy-load.

### Largo plazo (pulido)
9. ✅ Hub `/jugador/[slug]` (hecho, versión con timeline). Pendiente opcional: `/tecnico/[slug]`, `/equipo/[slug]`.
10. Newsletter real (si se decide) — hoy el form es fake (no persiste).
11. ✅ SEO base (sitemap/robots/RSS/OG/JSON-LD). Pendiente: dominio real + `NEXT_PUBLIC_SITE_URL` en prod (hoy cae a `localhost:3000`).

---

## Historial de decisiones importantes (orden cronológico)

1. Proyecto inicialmente pensado como mega-site editorial → **restringido** a portfolio de notas/entrevistas/noticias.
2. Paleta: primero `#D6001C` burgundy → migrado al oficial `#EB192E` (Pantone 1788 C).
3. Tipografía: Fraunces → Instrument Serif → **Newsreader** (ganó por feel periodístico).
4. Anton se reserva a scores/marcadores; los nav items lo usan por ser condensed + uppercase.
5. Botones: Flat / Brutalist / Stadium / Pill / Underline → ganó **Brutalist** adaptive.
6. Nav: primero se rechazaron las variantes con masthead/dropdowns/search (se quería simple). **Después (2026-05) el usuario REVIRTIÓ y adoptó el masthead de diario de 3 niveles** (con dropdowns + buscador), estilo Roca&Madre/Doble Amarilla, y lo aprobó. El "nav simple" quedó obsoleto. (Memoria `feedback_nav_simple`, actualizada).
7. Se borró todo el contenido viejo de la portada (Hero/ShortsRail/FilterBar/BentoGrid/detalle) y se rearrancó con el enfoque portfolio. Después se construyó el contenido real actual (hero + teasers + bento + newsletter) "robando" estructura de un portal de referencia (RocaYMadre) pero adaptado a la UI brutalist.
8. Se agregó el tipo de contenido **"noticia"** (notas cortas/breves) para dar variedad a la portada.
9. Logo: se reemplazó el monograma "I" por un **badge circular** real (`logo.webp`); se le sacó el fondo brutalist que se había probado.
10. Glifo `§` **vetado** en todo el sitio (era prefijo de overlines/labels). (Memoria: `feedback_no_section_mark`).
11. **Modo demo**: se borraron `/sobre`, `/contacto`, `/nota/[slug]` y `components/article/*` para que el cliente solo vea portada + `/ui`. Todos los links internos van a `/`.
12. `/ui` reescrito en **lenguaje no técnico** (sin nombres de clases CSS, sin aspect ratios, sin anglicismos) porque es para que el cliente entienda el sistema de diseño.
13. CTAs con **hover "press"** (sombra se aplasta + translate), unificado vía clases `.brut-cta-*`.
14. **Nav responsive (2026-05)**: el masthead colapsa a hamburguesa en `<md`. Bug clave corregido: clases custom que fijaban `display` pisaban el `hidden`/`md:hidden` de Tailwind → se sacó `display` de `.inline-search`/`.nav-burger`/`.nav-mobile-panel`.
15. **Páginas internas + SEO repuestas (2026-05-31)**: tras un code-review + investigación de portales deportivos, se reconstruyó `/nota/[slug]`, `/jugador/[slug]` (hub con timeline, el diferenciador de cantera) y todo el SEO. Se movió la búsqueda a `lib/notas.ts`, se sumó `primicia` ("lo contamos primero") y se limpió código muerto (4 fuentes, dark-mode sin toggle, doble `<main>`). (Memoria: `project_paginas_internas_repuestas`).

---

## Reglas del juego (para futuras iteraciones)

1. **Mantener brutalist en todo**: bordes 2px, offset shadows pixel-perfect, sin rounded, sin blur.
2. **Respetar el stack tipográfico**: Newsreader + Anton + Inter + Mono. No meter fuentes nuevas sin motivo claro.
3. **Pensar "portfolio periodístico"** antes de agregar features. ¿Sirve a mostrar las notas/entrevistas/noticias? Si no, probablemente sobra.
4. **Nav = masthead de diario de 3 niveles** (barra roja + masthead + secciones sticky con dropdowns + buscador), responsive con hamburguesa. NO volver al nav de 4 items. Mantenerlo brutalist y cuidar que las clases custom no fijen `display` (rompe el responsive).
5. **Sin `§`** en ningún lado.
6. **`/ui` en lenguaje no técnico** mientras sea material de cliente.
7. **Iteración con `/ui`**: cualquier componente nuevo se agrega primero al playground para verificar que encaja.
8. **Capa de datos desacoplada**: todo pasa por `lib/notas.ts`. Cuando se conecta Supabase, solo cambia ese archivo.
9. **CTAs con hover press**: usar las clases `.brut-cta-*`, no reinventar el efecto.
