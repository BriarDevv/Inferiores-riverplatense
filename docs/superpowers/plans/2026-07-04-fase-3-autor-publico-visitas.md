# Fase 3 — Autor público + visitas: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans.

**Goal:** `/autor/[slug]` público (E-E-A-T), contador de visitas propio en Supabase, y stats reales en el panel (resumen + columna de visitas en la tabla).

## Tasks

### Task 1: Migración 004 — lectura de visitas para staff + vista agregada
- Policy `select` en `nota_visitas` para `es_editor()`.
- Vista `nota_visitas_resumen` (`security_invoker = true`): `nota_id, total, ult_7d, ult_30d`.

### Task 2: Autor con slug en la capa pública
- `Autor` gana `slug?`; los SELECT de notas (público y admin) traen `autor.slug`; mapper lo pasa.
- `lib/autores.ts` (público): `getAutorPorSlug`, `getSlugsDeAutores`, tipo `AutorPublico` (bio, cargo, redes, email, foto).

### Task 3: Página `/autor/[slug]` (SSG)
- Header editorial: foto grande, cargo, nombre, bio, redes/contacto.
- Todas sus notas (grid de `TeaserCard`).
- `generateStaticParams` + metadata + JSON-LD `Person`/`ProfilePage`.
- Bylines linkeados: byline del detalle de nota + `AuthorBio` → `/autor/[slug]`.
- Sitemap: sumar autores.

### Task 4: Contador de visitas
- `app/api/visita/route.ts` (POST `{slug}`): resuelve nota, hash sha256(ip+ua+día), dedupe 30 min, insert con service role (la tabla no es escribible por anon).
- `components/article/RegistrarVisita.tsx` (client): ping una vez por sesión (sessionStorage) tras montar. Se agrega al detalle de nota.

### Task 5: Stats en el panel
- `lib/admin/stats.ts`: lee `nota_visitas_resumen` con el cliente de sesión (RLS staff).
- Resumen: celda "Visitas · 7d" en el marcador + lista "Más leídas".
- `/admin/notas`: columna Visitas (total) mergeada.

### Verificación
typecheck + tests + e2e: visitar una nota pública → ver el contador subir en el panel. Build final. Commit por task.
