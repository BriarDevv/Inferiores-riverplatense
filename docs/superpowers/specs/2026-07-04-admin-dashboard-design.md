# Spec: Dashboard Admin — Inferiores Riverplatense

**Fecha:** 2026-07-04 · **Estado:** Aprobado por el usuario · **Fase 1 COMPLETADA** (2026-07-04, login verificado por el usuario)

## Desvíos de implementación (Fase 1, ya aplicados)

- **`proxy.ts`, no `middleware.ts`**: Next 16 deprecó middleware; la protección de `/admin/*` vive en `proxy.ts` (función `proxy`).
- **Keys**: el proyecto usa la key publishable nueva (`sb_publishable_...`) como anon + la **service_role legacy** en `SUPABASE_SERVICE_ROLE_KEY` (solo servidor) + `SUPABASE_DB_URL` (Postgres directo para scripts locales: `run-migrations.ts`, `seed.ts`, `make-admin.ts`).
- **Login**: `signInWithOtp` con `shouldCreateUser: false` (con signups cerrados, sin eso Supabase rechaza el envío). El callback `/auth/callback` acepta `?code=` (PKCE) **y** `?token_hash=` (links generados por admin).
- **Rate limit SMTP**: el email integrado permite ~2 mails/hora. Workaround activo: `scripts/gen-login-link.ts` genera links de acceso por API admin sin email. Pendiente Fase 2+: SMTP propio (Resend) para invitaciones reales.
- **Route group `(sitio)`**: se adelantó de Fase 2. Páginas públicas en `app/(sitio)/` con su layout (Nav/Footer/SocialRail/Lenis); root layout solo fuentes/metadata; `/admin` con layout limpio propio.
- **`autores` tiene columna extra `rol` ('admin'|'editor')** para compatibilidad con el tipo `Autor` del código; `rol_publico` sigue siendo el cargo visible ("Editor", "Colaborador").
- **`notas.contenido` es `text`** (markdown/HTML heredado del mock). El `cuerpo` jsonb de Tiptap se agrega en la migración de Fase 2 (003); convivirán durante la transición.
- **Login con diseño "acreditación de prensa"** (cabecera ink + borde rojo + sello "Nº 001") — dirección visual aprobada para todo el panel.

## Objetivo

Panel de administración para el portal de periodismo de inferiores de River: carga y gestión de notas con editor visual, perfiles de autor personalizados (nombre/foto/bio/redes) visibles en el sitio público, sistema de roles admin/editor, y estadísticas de visitas filtrables. SEO periodístico (E-E-A-T) como prioridad.

## Decisiones cerradas

| Tema | Decisión |
|---|---|
| Arquitectura | `/admin` dentro de la misma app Next.js (NO monorepo). Layout propio, middleware de auth. Subdominio `admin.*` vía rewrite en Vercel cuando haya dominio. |
| Base de datos | Supabase (Postgres + Auth magic-link + Storage). No DB propia. |
| Videos | Solo links/embeds (YouTube ID, IG, TikTok). Nunca upload de video. Storage solo para imágenes (fotos de autor, posters). |
| Roles | `admin` (todo) + `editor` (sus notas, su perfil, sus stats). |
| Perfiles | Dos entidades: **firmas** (`autores`, creables libremente sin login) + **cuentas** (`profiles`, con acceso al panel), vinculables opcionalmente. |
| Flujo de notas | Borrador → Publicada, con publicación programada (fecha futura) y despublicar. |
| Estadísticas | Contador propio en Supabase: visitas por nota, 7/30 días, rankings por autor/división/tipo, evolución. Sin herramienta externa en v1. |
| Editor | Visual tipo Word (**Tiptap**): negritas, subtítulos, citas, imágenes, embeds en el texto. |
| Estética | Brutalist, misma identidad del sitio (tokens, Anton/Newsreader, rojo River), adaptada a densidad de dashboard. |

## Schema (Supabase/Postgres)

- **`autores`** — firmas públicas: `id, nombre, slug (único), foto_url, bio, rol_publico, redes (jsonb: x/instagram/youtube), email_contacto, creado_en`. Independiente del login.
- **`profiles`** — cuentas (extiende `auth.users`): `id (= auth.users.id), rol ('admin'|'editor'), autor_id (FK nullable → autores), creado_en`.
- **`sujetos`** — una tabla polimórfica: `id, tipo ('jugador'|'tecnico'|'equipo'), nombre, slug, bio, foto_url, division`.
- **`notas`** — `id, slug (único), titulo, bajada, cuerpo (jsonb Tiptap), formato ('short'|'youtube'|'articulo'), tipo ('entrevista'|'perfil'|'cronica'|'analisis'|'columna'|'noticia'), division, fuente, video_url, youtube_id, poster_url, duracion_seg, quote_overlay, autor_id (FK → autores), tags (text[]), estado ('borrador'|'programada'|'publicada'), publicada_en (timestamptz), actualizada_en, destacada (bool), primicia (bool), creada_por (FK → profiles)`. Índices: desc en `publicada_en`, GIN en `tags`, `tsvector` generado para búsqueda.
- **`nota_sujetos`** — pivote `nota_id + sujeto_id` con FK reales.
- **`nota_visitas`** — `id, nota_id (FK), visto_en (timestamptz), referer, hash_visitante (para dedupe básico)`. Índice en `(nota_id, visto_en)`.
- **Storage**: bucket `imagenes` (subcarpetas `autores/`, `posters/`). Público para lectura.
- **RLS**: lectura pública de notas con `estado='publicada'` y `publicada_en <= now()`; lectura pública de `autores` y `sujetos`; INSERT en `nota_visitas` abierto vía ruta servidor; escritura de `notas` para editores (las propias) y admin (todas); `autores`, `profiles` y roles solo admin.
- **Seed**: migrar las 22 notas + sujetos + autores del mock actual.

## Pantallas del panel (`app/admin/`)

1. **Login** (`/admin/login`) — magic link. Solo emails invitados (con profile existente).
2. **Resumen** (`/admin`) — visitas del período, notas publicadas, gráfico de evolución, top 5 leídas, borradores recientes. Editor ve lo suyo, admin ve todo.
3. **Notas** (`/admin/notas`) — tabla filtrable (estado, tipo, división, autor, formato, fechas, búsqueda) con columna de visitas ordenable. Acciones: editar, despublicar, destacar, borrar (admin).
4. **Editor de nota** (`/admin/notas/nueva`, `/admin/notas/[id]`) — Tiptap + sidebar de metadata: firma (cualquier autor), tipo, división, formato, sujetos, tags, primicia, destacada, poster (upload), youtube_id/video_url, publicación (ahora/programada/borrador). Vista previa de card + checklist SEO simple.
5. **Autores** (`/admin/autores`) — grilla con foto; CRUD de firmas (nombre, foto con upload, bio, rol público, redes).
6. **Equipo** (`/admin/equipo`, solo admin) — invitar por email, asignar rol, vincular cuenta↔firma, revocar.
7. **Estadísticas** (`/admin/estadisticas`) — rankings por nota/autor/división/tipo, comparativas de período, filtros.

Layout: sidebar propia + header compacto, sin masthead/footer del sitio. Middleware protege `/admin/*` (excepto login).

## Cambios en el sitio público

- **`/autor/[slug]`** — página pública de autor: foto, bio, redes, todas sus notas. Bylines de cards y notas linkean acá. JSON-LD de autor (E-E-A-T).
- `lib/notas.ts` pasa de mock a Supabase (misma interfaz; las páginas casi no se tocan).
- Render del `cuerpo` Tiptap (JSON → HTML server-side) con `.article-prose`.
- Ping de visita en `/nota/[slug]` → route handler → insert en `nota_visitas` (con dedupe por hash de visitante + ventana temporal).

## Fases

1. **Cimientos** — Supabase + schema + RLS + seed + `lib/notas.ts` contra DB + auth y middleware. El sitio se ve igual pero real.
2. **Panel** — layout admin, CRUD notas con Tiptap, CRUD autores, uploads, estados/programación.
3. **Público + medición** — `/autor/[slug]`, contador de visitas, resumen con stats.
4. **Stats + equipo** — pantalla completa de estadísticas, gestión de roles/invitaciones, pulido UX.

## Verificación

Por fase: `npm run typecheck` + `npm run build` + prueba manual del flujo completo (crear nota → publicar → verla en el sitio → visita contada). RLS verificada con requests anónimas (no debe poder escribirse nada sin sesión).

## Fuera de alcance (v1)

- Upload de video / Mux.
- Analítica externa (Plausible/GA4).
- Comentarios, cuentas públicas de lectores.
- Newsletter real (el form sigue fake hasta decisión aparte).
- Workflow de revisión/aprobación editorial.
