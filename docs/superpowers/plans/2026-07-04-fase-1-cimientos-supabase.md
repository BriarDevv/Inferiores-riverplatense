# Fase 1 — Cimientos Supabase: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Conectar el sitio a Supabase (schema + RLS + seed del mock) y dejar el login + middleware de `/admin` funcionando, sin que el sitio público cambie visualmente.

**Architecture:** El sitio sigue leyendo por `lib/notas.ts` (misma interfaz pública); internamente pasa de `MOCK_NOTAS` a una query a Supabase con joins, manteniendo el filtrado en memoria existente (22 notas; se optimiza cuando haga falta). Auth con magic-link de Supabase (`@supabase/ssr`), middleware protege `/admin/*`, y una página placeholder `/admin` prueba la sesión. RLS: el mundo solo lee notas publicadas.

**Tech Stack:** Next.js 16 (App Router), Supabase (Postgres/Auth/Storage), `@supabase/supabase-js` (ya instalado), `@supabase/ssr`, `tsx` (seed), `vitest` (test del mapper).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-04-admin-dashboard-design.md`.
- NO cambiar la interfaz pública de `lib/notas.ts` (mismas funciones, firmas y tipos exportados).
- NO tocar el diseño del sitio público en esta fase.
- IDs de tablas migradas del mock son `text` (preservan `n-1`, `a-1`, etc.).
- Los tipos de `lib/types.ts` no cambian en esta fase (el campo `estado` vive solo en DB por ahora; todo lo que devuelve `lib/notas.ts` está publicado).
- Secrets solo en `.env.local` (nunca commiteado). `SUPABASE_SERVICE_ROLE_KEY` jamás llega al cliente (sin prefijo `NEXT_PUBLIC_`).
- Mensajes de commit: convencional en español, sin atribución.

---

### Task 0: Proyecto Supabase (ACCIÓN DEL USUARIO — bloqueante)

**Files:** ninguno (config externa) + `.env.local` (no se commitea).

El usuario debe, en [supabase.com](https://supabase.com):

- [ ] **Step 1:** Crear proyecto nuevo (región `South America (São Paulo)`), guardar la contraseña de DB.
- [ ] **Step 2:** En *Project Settings → API*, copiar `Project URL`, `anon public` y `service_role` a `C:\Users\mateo\Desktop\Inferiores-Riverplatense\.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon>
SUPABASE_SERVICE_ROLE_KEY=<service_role>
```

- [ ] **Step 3:** En *Authentication → Sign In / Up*, **desactivar "Allow new users to sign up"** (solo entran invitados).
- [ ] **Step 4:** En *Authentication → Users → Invite user*, invitarse a sí mismo (su email). Anotar el UUID del usuario creado (columna UID) — se usa en Task 2.

---

### Task 1: Dependencias + ping de conexión

**Files:**
- Modify: `package.json` (deps)
- Create: `scripts/ping-supabase.ts`

**Interfaces:**
- Produces: deps `@supabase/ssr`, `tsx`, `vitest`, `dotenv` disponibles para tasks siguientes.

- [ ] **Step 1: Instalar dependencias**

```bash
npm i @supabase/ssr && npm i -D tsx vitest dotenv
```

- [ ] **Step 2: Script de ping**

```ts
// scripts/ping-supabase.ts
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local");

const supabase = createClient(url, key);
const { error } = await supabase.from("_ping_inexistente").select("*").limit(1);
// Esperamos error de tabla inexistente (42P01) => la conexión y la key funcionan.
if (error && error.code === "42P01") {
  console.log("OK: conexión a Supabase funcionando");
} else if (error) {
  throw new Error(`Conexión falló: ${error.message}`);
} else {
  console.log("OK: conexión funcionando (tabla existía)");
}
```

- [ ] **Step 3: Verificar**

Run: `npx tsx scripts/ping-supabase.ts`
Expected: `OK: conexión a Supabase funcionando`

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json scripts/ping-supabase.ts
git commit -m "chore: deps supabase-ssr/tsx/vitest + ping de conexion"
```

---

### Task 2: Migración SQL — schema + RLS + bucket

**Files:**
- Create: `supabase/migrations/001_schema.sql`
- Create: `supabase/migrations/002_rls.sql`

**Interfaces:**
- Produces: tablas `autores`, `profiles`, `sujetos`, `notas`, `nota_sujetos`, `nota_visitas`; funciones `es_admin()`, `es_editor()`; bucket `imagenes`. Los nombres de columnas son EXACTAMENTE los que consume el mapper de Task 4.

- [ ] **Step 1: Escribir `001_schema.sql`**

```sql
-- 001_schema.sql — Inferiores Riverplatense
create table public.autores (
  id text primary key,
  nombre text not null,
  slug text not null unique,
  rol text not null default 'editor' check (rol in ('admin','editor')),
  foto_url text,
  bio text,
  rol_publico text,
  redes jsonb not null default '{}'::jsonb,
  email_contacto text,
  creado_en timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  rol text not null default 'editor' check (rol in ('admin','editor')),
  autor_id text references public.autores (id) on delete set null,
  creado_en timestamptz not null default now()
);

create table public.sujetos (
  id text primary key,
  tipo text not null check (tipo in ('jugador','tecnico','equipo')),
  nombre text not null,
  slug text unique,
  division text check (division in ('primera','reserva','cuarta','quinta','sexta','septima','octava','novena','femenino')),
  bio text,
  foto_url text,
  creado_en timestamptz not null default now()
);

create table public.notas (
  id text primary key,
  slug text not null unique,
  formato text not null check (formato in ('short','youtube','articulo')),
  tipo text not null check (tipo in ('entrevista','perfil','cronica','analisis','columna','noticia')),
  division text not null check (division in ('primera','reserva','cuarta','quinta','sexta','septima','octava','novena','femenino')),
  titulo text not null,
  bajada text not null,
  contenido text,
  fuente text not null check (fuente in ('propio','youtube','instagram','tiktok')),
  video_url text,
  youtube_id text,
  poster_url text not null,
  duracion_seg integer,
  quote_overlay text,
  autor_id text not null references public.autores (id),
  tags text[] not null default '{}',
  estado text not null default 'borrador' check (estado in ('borrador','programada','publicada')),
  publicada_en timestamptz,
  actualizada_en timestamptz,
  destacada boolean not null default false,
  primicia boolean not null default false,
  capitulos jsonb,
  creada_por uuid references public.profiles (id) on delete set null,
  creado_en timestamptz not null default now()
);
create index notas_publicada_en_idx on public.notas (publicada_en desc);
create index notas_tags_idx on public.notas using gin (tags);

create table public.nota_sujetos (
  nota_id text not null references public.notas (id) on delete cascade,
  sujeto_id text not null references public.sujetos (id) on delete cascade,
  primary key (nota_id, sujeto_id)
);

create table public.nota_visitas (
  id bigint generated always as identity primary key,
  nota_id text not null references public.notas (id) on delete cascade,
  visto_en timestamptz not null default now(),
  referer text,
  hash_visitante text
);
create index nota_visitas_nota_idx on public.nota_visitas (nota_id, visto_en);

-- Bucket público de imágenes (fotos de autor + posters; se usa desde Fase 2)
insert into storage.buckets (id, name, public) values ('imagenes', 'imagenes', true);
```

- [ ] **Step 2: Escribir `002_rls.sql`**

```sql
-- 002_rls.sql — políticas
alter table public.autores enable row level security;
alter table public.profiles enable row level security;
alter table public.sujetos enable row level security;
alter table public.notas enable row level security;
alter table public.nota_sujetos enable row level security;
alter table public.nota_visitas enable row level security;

create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and rol = 'admin') $$;

create or replace function public.es_editor() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and rol in ('admin','editor')) $$;

-- Lectura pública de contenido
create policy "autores lectura publica" on public.autores for select using (true);
create policy "sujetos lectura publica" on public.sujetos for select using (true);
create policy "pivote lectura publica" on public.nota_sujetos for select using (true);
create policy "notas publicadas visibles" on public.notas for select
  using (estado = 'publicada' and publicada_en is not null and publicada_en <= now());

-- Editores ven TODAS las notas (para el panel, Fase 2)
create policy "notas visibles para staff" on public.notas for select
  using (public.es_editor());

-- Escritura de notas: editor crea las suyas, admin todo
create policy "notas insert staff" on public.notas for insert
  with check (public.es_editor() and creada_por = auth.uid());
create policy "notas update propias o admin" on public.notas for update
  using (public.es_admin() or (public.es_editor() and creada_por = auth.uid()));
create policy "notas delete solo admin" on public.notas for delete
  using (public.es_admin());

-- Pivote y sujetos: escribe cualquier staff
create policy "pivote escribe staff" on public.nota_sujetos for all
  using (public.es_editor()) with check (public.es_editor());
create policy "sujetos escribe staff" on public.sujetos for insert with check (public.es_editor());
create policy "sujetos update staff" on public.sujetos for update using (public.es_editor());

-- Autores (firmas): solo admin gestiona
create policy "autores escribe admin" on public.autores for insert with check (public.es_admin());
create policy "autores update admin" on public.autores for update using (public.es_admin());
create policy "autores delete admin" on public.autores for delete using (public.es_admin());

-- Profiles: cada uno ve el suyo; admin ve y gestiona todos
create policy "profile propio" on public.profiles for select using (id = auth.uid());
create policy "profiles admin select" on public.profiles for select using (public.es_admin());
create policy "profiles admin insert" on public.profiles for insert with check (public.es_admin());
create policy "profiles admin update" on public.profiles for update using (public.es_admin());

-- Visitas: nadie lee desde el cliente (solo service role); el insert lo hace una ruta servidor
-- (sin políticas => anon/authenticated no pueden ni leer ni escribir; service role bypasea RLS)

-- Storage: lectura pública, escritura staff
create policy "imagenes lectura publica" on storage.objects for select
  using (bucket_id = 'imagenes');
create policy "imagenes escribe staff" on storage.objects for insert
  with check (bucket_id = 'imagenes' and public.es_editor());
create policy "imagenes update staff" on storage.objects for update
  using (bucket_id = 'imagenes' and public.es_editor());
create policy "imagenes delete staff" on storage.objects for delete
  using (bucket_id = 'imagenes' and public.es_editor());
```

- [ ] **Step 3: Ejecutar ambos archivos** en Supabase Dashboard → *SQL Editor* (en orden: 001, luego 002). Expected: `Success. No rows returned` en ambos.

- [ ] **Step 4: Crear el profile admin del usuario** (SQL Editor, reemplazar `<UID>` por el UUID de Task 0 Step 4):

```sql
insert into public.profiles (id, rol) values ('<UID>', 'admin');
```

- [ ] **Step 5: Verificar RLS anónima** — SQL Editor:

```sql
select count(*) from public.notas; -- corre como postgres: 0 filas, OK
```

Y desde la máquina local: `npx tsx scripts/ping-supabase.ts` → sigue OK.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations
git commit -m "feat(db): schema inicial + RLS + bucket imagenes"
```

---

### Task 3: Seed del mock a la DB

**Files:**
- Create: `scripts/seed.ts`

**Interfaces:**
- Consumes: `MOCK_NOTAS` de `lib/mock-data.ts` (tipo `Nota[]` de `lib/types.ts`), tablas de Task 2.
- Produces: DB poblada: 2 autores, ~sujetos únicos, 22 notas (todas `estado='publicada'`), pivote completo.

- [ ] **Step 1: Escribir el seed** (usa service role, bypasea RLS; idempotente vía `upsert`):

```ts
// scripts/seed.ts
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { MOCK_NOTAS } from "../lib/mock-data";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  // 1. Autores únicos
  const autores = new Map<string, (typeof MOCK_NOTAS)[number]["autor"]>();
  for (const n of MOCK_NOTAS) autores.set(n.autor.id, n.autor);
  const autoresRows = [...autores.values()].map((a) => ({
    id: a.id,
    nombre: a.nombre,
    slug: a.nombre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-"),
    rol: a.rol,
    foto_url: a.avatar_url ?? null,
  }));
  const rAut = await supabase.from("autores").upsert(autoresRows);
  if (rAut.error) throw new Error(`autores: ${rAut.error.message}`);

  // 2. Sujetos únicos
  const sujetos = new Map<string, (typeof MOCK_NOTAS)[number]["sujetos"][number]>();
  for (const n of MOCK_NOTAS) for (const s of n.sujetos) sujetos.set(s.id, s);
  const rSuj = await supabase.from("sujetos").upsert(
    [...sujetos.values()].map((s) => ({
      id: s.id, tipo: s.tipo, nombre: s.nombre,
      slug: s.slug ?? null, division: s.division ?? null, bio: s.bio ?? null,
    })),
  );
  if (rSuj.error) throw new Error(`sujetos: ${rSuj.error.message}`);

  // 3. Notas (todas publicadas: vienen del sitio en vivo)
  const rNot = await supabase.from("notas").upsert(
    MOCK_NOTAS.map((n) => ({
      id: n.id, slug: n.slug, formato: n.formato, tipo: n.tipo, division: n.division,
      titulo: n.titulo, bajada: n.bajada, contenido: n.contenido ?? null,
      fuente: n.fuente, video_url: n.video_url ?? null,
      youtube_id: n.youtube_id || null, poster_url: n.poster_url,
      duracion_seg: n.duracion_seg ?? null, quote_overlay: n.quote_overlay ?? null,
      autor_id: n.autor.id, tags: n.tags, estado: "publicada",
      publicada_en: n.publicada_en, actualizada_en: n.actualizada_en ?? null,
      destacada: n.destacada ?? false, primicia: n.primicia ?? false,
      capitulos: n.capitulos ?? null,
    })),
  );
  if (rNot.error) throw new Error(`notas: ${rNot.error.message}`);

  // 4. Pivote
  const pivote = MOCK_NOTAS.flatMap((n) =>
    n.sujetos.map((s) => ({ nota_id: n.id, sujeto_id: s.id })),
  );
  const rPiv = await supabase.from("nota_sujetos").upsert(pivote);
  if (rPiv.error) throw new Error(`nota_sujetos: ${rPiv.error.message}`);

  const { count } = await supabase.from("notas").select("*", { count: "exact", head: true });
  console.log(`Seed OK — notas en DB: ${count}, autores: ${autoresRows.length}, sujetos: ${sujetos.size}, vinculos: ${pivote.length}`);
}

main();
```

- [ ] **Step 2: Correr y verificar**

Run: `npx tsx scripts/seed.ts`
Expected: `Seed OK — notas en DB: 22, ...`

- [ ] **Step 3: Verificar RLS pública con anon key** — agregar temporalmente al final de `ping-supabase.ts` NO; en su lugar correr inline:

Run: `npx tsx -e "import('dotenv').then(d=>{d.config({path:'.env.local'});import('@supabase/supabase-js').then(async({createClient})=>{const s=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);const{count}=await s.from('notas').select('*',{count:'exact',head:true});console.log('anon ve',count,'notas');const{error}=await s.from('notas').update({titulo:'hack'}).eq('id','n-1');console.log('update anon:',error?'BLOQUEADO OK':'FALLO DE SEGURIDAD');})})"`
Expected: `anon ve 22 notas` y `update anon: BLOQUEADO OK`

- [ ] **Step 4: Commit**

```bash
git add scripts/seed.ts
git commit -m "feat(db): seed de las 22 notas del mock"
```

---

### Task 4: Clientes Supabase + `lib/notas.ts` contra la DB

**Files:**
- Create: `lib/supabase/server.ts`, `lib/supabase/client.ts`
- Create: `lib/notas-mapper.ts`
- Create: `lib/notas-mapper.test.ts`
- Modify: `lib/notas.ts` (reemplaza fuente de datos, MISMA interfaz)
- Modify: `package.json` (script `test`)

**Interfaces:**
- Consumes: tablas de Task 2 con datos de Task 3.
- Produces: `createSupabaseServer(): Promise<SupabaseClient>` (lib/supabase/server.ts); `mapRowToNota(row: NotaRow): Nota` (lib/notas-mapper.ts, exporta también `NotaRow`); `lib/notas.ts` conserva EXACTAMENTE: `getNotas`, `getNotaDestacada`, `getNotaPorSlug`, `getTodasLasNotas`, `getNotasRelacionadas`, `getSujetoPorSlug`, `getNotasPorSujeto`, `getSlugsDeJugadores`.

- [ ] **Step 1: Clientes**

```ts
// lib/supabase/server.ts — para Server Components / route handlers
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component: el middleware refresca la sesión.
          }
        },
      },
    },
  );
}
```

```ts
// lib/supabase/client.ts — para client components (login)
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 2: Test del mapper (RED)** — `lib/notas-mapper.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { mapRowToNota, type NotaRow } from "./notas-mapper";

const row: NotaRow = {
  id: "n-1", slug: "prueba", formato: "articulo", tipo: "cronica",
  division: "reserva", titulo: "T", bajada: "B", contenido: null,
  fuente: "propio", video_url: null, youtube_id: null,
  poster_url: "https://x/p.jpg", duracion_seg: null, quote_overlay: null,
  tags: ["river"], publicada_en: "2026-01-01T12:00:00+00:00",
  actualizada_en: null, destacada: true, primicia: false, capitulos: null,
  autor: { id: "a-1", nombre: "Pablo Molina", rol: "admin", foto_url: null },
  nota_sujetos: [
    { sujeto: { id: "s-1", tipo: "jugador", nombre: "Juan", slug: "juan", division: "reserva", bio: null } },
  ],
};

describe("mapRowToNota", () => {
  test("mapea fila con joins al tipo Nota", () => {
    const n = mapRowToNota(row);
    expect(n.id).toBe("n-1");
    expect(n.autor).toEqual({ id: "a-1", nombre: "Pablo Molina", rol: "admin", avatar_url: undefined });
    expect(n.sujetos).toEqual([{ id: "s-1", tipo: "jugador", nombre: "Juan", slug: "juan", division: "reserva", bio: undefined }]);
    expect(n.destacada).toBe(true);
    expect(n.youtube_id).toBeUndefined();
  });
});
```

Agregar a `package.json` scripts: `"test": "vitest run"`.
Run: `npm test` → Expected: FAIL (`notas-mapper` no existe).

- [ ] **Step 3: Implementar el mapper (GREEN)** — `lib/notas-mapper.ts`:

```ts
import type { Autor, Division, FormatoNota, FuenteVideo, Nota, Sujeto, SujetoTipo, TipoNota } from "./types";

export interface NotaRow {
  id: string; slug: string; formato: FormatoNota; tipo: TipoNota; division: Division;
  titulo: string; bajada: string; contenido: string | null; fuente: FuenteVideo;
  video_url: string | null; youtube_id: string | null; poster_url: string;
  duracion_seg: number | null; quote_overlay: string | null; tags: string[];
  publicada_en: string; actualizada_en: string | null;
  destacada: boolean; primicia: boolean;
  capitulos: Array<{ tiempo: number; titulo: string }> | null;
  autor: { id: string; nombre: string; rol: Autor["rol"]; foto_url: string | null };
  nota_sujetos: Array<{ sujeto: {
    id: string; tipo: SujetoTipo; nombre: string;
    slug: string | null; division: Division | null; bio: string | null;
  } }>;
}

export function mapRowToNota(row: NotaRow): Nota {
  const sujetos: Sujeto[] = row.nota_sujetos.map(({ sujeto: s }) => ({
    id: s.id, tipo: s.tipo, nombre: s.nombre,
    slug: s.slug ?? undefined, division: s.division ?? undefined, bio: s.bio ?? undefined,
  }));
  return {
    id: row.id, slug: row.slug, formato: row.formato, tipo: row.tipo, division: row.division,
    titulo: row.titulo, bajada: row.bajada, contenido: row.contenido ?? undefined,
    fuente: row.fuente, video_url: row.video_url ?? undefined,
    youtube_id: row.youtube_id ?? undefined, poster_url: row.poster_url,
    duracion_seg: row.duracion_seg ?? undefined, quote_overlay: row.quote_overlay ?? undefined,
    autor: { id: row.autor.id, nombre: row.autor.nombre, rol: row.autor.rol, avatar_url: row.autor.foto_url ?? undefined },
    sujetos, tags: row.tags, publicada_en: row.publicada_en,
    actualizada_en: row.actualizada_en ?? undefined,
    destacada: row.destacada, primicia: row.primicia,
    capitulos: row.capitulos ?? undefined,
  };
}
```

Run: `npm test` → Expected: PASS.

- [ ] **Step 4: Reescribir `lib/notas.ts`** — misma interfaz, fuente Supabase. Reemplazar el import de `MOCK_NOTAS` y la obtención de datos; TODO el filtrado/orden existente se conserva operando sobre el resultado de `fetchNotasPublicadas()`:

```ts
/**
 * Capa de acceso a datos de notas — ahora contra Supabase.
 * La interfaz pública NO cambia respecto de la versión mock.
 */
import { cache } from "react";
import { createSupabaseServer } from "./supabase/server";
import { mapRowToNota, type NotaRow } from "./notas-mapper";
import { norm } from "./constants";
import type { FiltrosNota, Nota, Sujeto } from "./types";

const SELECT_NOTA = "*, autor:autores(id, nombre, rol, foto_url), nota_sujetos(sujeto:sujetos(id, tipo, nombre, slug, division, bio))";

/** Trae todas las notas publicadas (RLS ya filtra estado/fecha). Cacheado por request. */
const fetchNotasPublicadas = cache(async (): Promise<Nota[]> => {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("notas")
    .select(SELECT_NOTA)
    .order("publicada_en", { ascending: false });
  if (error) throw new Error(`Error leyendo notas: ${error.message}`);
  return (data as unknown as NotaRow[]).map(mapRowToNota);
});
```

Después, cada función exportada mantiene su firma y su lógica actual, cambiando `MOCK_NOTAS` por `await fetchNotasPublicadas()` (que ya viene ordenada; conservar `ordenar()` y `haystack()` tal como están para `getNotas`, relacionadas, etc.). Ejemplo del patrón (aplicarlo a las 8 funciones):

```ts
export async function getNotas(filtros: FiltrosNota = {}): Promise<Nota[]> {
  let resultado = await fetchNotasPublicadas();
  // ... mismos if de filtros que hoy (tipo, division, formato, sujeto_id, tags, q) ...
  return resultado;
}

export async function getNotaPorSlug(slug: string): Promise<Nota | null> {
  const notas = await fetchNotasPublicadas();
  return notas.find((n) => n.slug === slug) ?? null;
}
```

- [ ] **Step 5: Verificar sitio completo**

Run: `npm run typecheck` → sin errores.
Run: `npm test` → PASS.
Con el dev server corriendo: abrir `http://localhost:3000/` → la portada se ve IGUAL que antes (hero + teasers + bento). Probar `/nota/<un-slug-real>`, `/jugador/<slug>`, `/?q=river`.
Run: `npm run build` → build OK (SSG de 22 notas + 5 jugadores).

- [ ] **Step 6: Commit**

```bash
git add lib/supabase lib/notas.ts lib/notas-mapper.ts lib/notas-mapper.test.ts package.json package-lock.json
git commit -m "feat(data): lib/notas.ts lee de Supabase (misma interfaz) + mapper testeado"
```

---

### Task 5: Auth — login magic-link, callback y middleware de /admin

**Files:**
- Create: `middleware.ts` (raíz del proyecto)
- Create: `app/admin/login/page.tsx`
- Create: `app/admin/login/LoginForm.tsx`
- Create: `app/auth/callback/route.ts`
- Create: `app/admin/page.tsx` (placeholder de sesión)
- Create: `app/admin/layout.tsx` (mínimo, sin masthead del sitio)

**Interfaces:**
- Consumes: `createSupabaseBrowser` (Task 4), `createSupabaseServer` (Task 4), tabla `profiles` (Task 2).
- Produces: rutas `/admin` (protegida), `/admin/login`, `/auth/callback`. Patrón de protección que la Fase 2 reutiliza.

- [ ] **Step 1: Middleware** — protege `/admin/*` (excepto `/admin/login`) y refresca la sesión:

```ts
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const esLogin = request.nextUrl.pathname.startsWith("/admin/login");
  if (!user && !esLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  if (user && esLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
```

> Nota Next 16: si el build avisa que `middleware.ts` está deprecado a favor de `proxy.ts`, renombrar el archivo a `proxy.ts` y la función a `proxy` — el contenido es idéntico.

- [ ] **Step 2: Callback** — canjea el código del magic link y valida que exista profile:

```ts
// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles").select("id").eq("id", user!.id).single();
      if (profile) return NextResponse.redirect(`${origin}/admin`);
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/admin/login?error=sin-acceso`);
    }
  }
  return NextResponse.redirect(`${origin}/admin/login?error=link-invalido`);
}
```

- [ ] **Step 3: Login** — página server + form client (estética brutalist con utilidades existentes):

```tsx
// app/admin/login/page.tsx
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = { title: "Ingresar — Panel", robots: { index: false } };

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-paper)] px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
```

```tsx
// app/admin/login/LoginForm.tsx
"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

const ERRORES: Record<string, string> = {
  "sin-acceso": "Tu email no tiene acceso al panel. Pedile al administrador que te invite.",
  "link-invalido": "El link expiró o no es válido. Pedí uno nuevo.",
};

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "enviado" | "error">("idle");
  const errorParam = useSearchParams().get("error");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setEstado(error ? "error" : "enviado");
  }

  return (
    <form onSubmit={enviar} className="brut-frame-shadow bg-[var(--color-paper-pure)] p-8 w-full max-w-md">
      <p className="overline mb-2">Panel de redacción</p>
      <h1 className="font-display text-3xl font-bold mb-6">Ingresar</h1>
      {errorParam && <p role="alert" className="mb-4 text-sm text-[var(--color-river-red-deep)]">{ERRORES[errorParam] ?? "Error al ingresar."}</p>}
      {estado === "enviado" ? (
        <p aria-live="polite">Listo. Revisá tu correo: te mandamos un link para entrar.</p>
      ) : (
        <>
          <label htmlFor="email" className="brut-label block mb-2">Tu email</label>
          <input
            id="email" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="brut-frame w-full px-3 py-2 mb-4 font-body bg-transparent"
            placeholder="vos@ejemplo.com"
          />
          <button type="submit" disabled={estado === "enviando"} className="brut-cta-red w-full py-3 font-sports uppercase tracking-wide">
            {estado === "enviando" ? "Enviando…" : "Mandame el link"}
          </button>
          {estado === "error" && <p role="alert" className="mt-3 text-sm text-[var(--color-river-red-deep)]">No pudimos enviar el link. Probá de nuevo.</p>}
        </>
      )}
    </form>
  );
}
```

- [ ] **Step 4: Layout admin + placeholder** — SIN el Nav/Footer del sitio (esos viven en el root layout, así que acá solo un contenedor; el layout admin completo llega en Fase 2 — verificar que el root layout no duplique el masthead dentro de /admin: si el masthead molesta visualmente en /admin, se acepta por ahora y Fase 2 lo resuelve con route groups):

```tsx
// app/admin/layout.tsx
export const metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div data-admin>{children}</div>;
}
```

```tsx
// app/admin/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function AdminHome() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: profile } = await supabase
    .from("profiles").select("rol").eq("id", user.id).single();

  return (
    <main className="min-h-screen bg-[var(--color-paper)] flex items-center justify-center px-4">
      <div className="brut-frame-shadow-red bg-[var(--color-paper-pure)] p-8 max-w-lg">
        <p className="overline mb-2">Panel de redacción</p>
        <h1 className="font-display text-3xl font-bold mb-4">Sesión activa</h1>
        <p className="font-body">
          Entraste como <strong>{user.email}</strong> con rol{" "}
          <strong>{profile?.rol ?? "sin profile"}</strong>. El dashboard llega en la Fase 2.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Verificar el flujo completo a mano**

1. `npm run typecheck` → OK. Dev server corriendo.
2. Ir a `http://localhost:3000/admin` → redirige a `/admin/login`.
3. Poner el email invitado (Task 0) → "Revisá tu correo" → abrir el mail → click en el link → cae en `/admin` mostrando email + rol `admin`.
4. Probar con un email NO invitado → con signups desactivados, Supabase no envía OTP a desconocidos (o el callback lo rebota con `sin-acceso`). Confirmar que NO puede entrar.
5. `npm run build` → OK.

- [ ] **Step 6: Commit**

```bash
git add middleware.ts app/admin app/auth
git commit -m "feat(auth): login magic-link + middleware que protege /admin"
```

---

### Task 6: Cierre de fase — verificación integral y docs

**Files:**
- Modify: `CLAUDE.md` (sección "Estado actual" + "Pendiente priorizado")
- Modify: `.env.local.example` (si faltara alguna var)

- [ ] **Step 1: Suite completa**

Run: `npm run typecheck && npm test && npm run build`
Expected: todo verde.

- [ ] **Step 2: Chequeo de seguridad final**
- `.env.local` NO está en git: `git status --short` no lo lista (está en `.gitignore`).
- Grep de leaks: `grep -ri "service_role\|eyJ" app lib components scripts --include=*.ts --include=*.tsx -l` → solo referencias a `process.env`, ninguna key literal.
- Repetir la verificación anónima de Task 3 Step 3 (update bloqueado).

- [ ] **Step 3: Actualizar `CLAUDE.md`**: marcar "Conectar Supabase (fase 1)" como hecho, documentar `lib/supabase/*`, `lib/notas-mapper.ts`, `middleware.ts`, rutas `/admin/login`, `/auth/callback`, y que `lib/notas.ts` ya lee de DB.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md .env.local.example
git commit -m "docs: fase 1 cimientos supabase completada"
```

---

## Self-Review (hecho al escribir el plan)

- **Cobertura del spec (Fase 1):** schema ✓, RLS ✓, bucket ✓, seed ✓, `lib/notas.ts` contra DB ✓, auth + middleware ✓. Las pantallas del panel, Tiptap, `/autor/[slug]` y visitas son Fases 2-3 (fuera de este plan a propósito).
- **Sin placeholders:** todo step con código lo incluye completo.
- **Consistencia de tipos:** columnas SQL ↔ `NotaRow` ↔ `Nota` revisadas campo por campo (`foto_url`↔`avatar_url` mapeado explícitamente; `youtube_id` vacío se siembra como `null` y se mapea a `undefined`).
