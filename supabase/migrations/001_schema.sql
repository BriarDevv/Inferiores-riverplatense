-- 001_schema.sql — Inferiores Riverplatense
create table if not exists public.autores (
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

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  rol text not null default 'editor' check (rol in ('admin','editor')),
  autor_id text references public.autores (id) on delete set null,
  creado_en timestamptz not null default now()
);

create table if not exists public.sujetos (
  id text primary key,
  tipo text not null check (tipo in ('jugador','tecnico','equipo')),
  nombre text not null,
  slug text unique,
  division text check (division in ('primera','reserva','cuarta','quinta','sexta','septima','octava','novena','femenino')),
  bio text,
  foto_url text,
  creado_en timestamptz not null default now()
);

create table if not exists public.notas (
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
create index if not exists notas_publicada_en_idx on public.notas (publicada_en desc);
create index if not exists notas_tags_idx on public.notas using gin (tags);

create table if not exists public.nota_sujetos (
  nota_id text not null references public.notas (id) on delete cascade,
  sujeto_id text not null references public.sujetos (id) on delete cascade,
  primary key (nota_id, sujeto_id)
);

create table if not exists public.nota_visitas (
  id bigint generated always as identity primary key,
  nota_id text not null references public.notas (id) on delete cascade,
  visto_en timestamptz not null default now(),
  referer text,
  hash_visitante text
);
create index if not exists nota_visitas_nota_idx on public.nota_visitas (nota_id, visto_en);

-- Bucket público de imágenes (fotos de autor + posters; se usa desde Fase 2)
insert into storage.buckets (id, name, public)
values ('imagenes', 'imagenes', true)
on conflict (id) do nothing;
