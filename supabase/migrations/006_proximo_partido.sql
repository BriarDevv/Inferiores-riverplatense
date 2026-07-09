-- 006_proximo_partido.sql — el partido que anuncia la barra roja del sitio.
-- Tabla singleton (una sola fila, id = true): se carga a mano desde el panel
-- y la barra la muestra mientras el partido sea futuro (+ unas horas de gracia).
create table if not exists public.proximo_partido (
  id boolean primary key default true check (id),
  rival text not null,
  division text not null,
  fecha timestamptz not null,
  torneo text,
  actualizado_en timestamptz not null default now()
);

alter table public.proximo_partido enable row level security;

drop policy if exists "partido lectura publica" on public.proximo_partido;
create policy "partido lectura publica" on public.proximo_partido
  for select using (true);

drop policy if exists "partido escribe staff" on public.proximo_partido;
create policy "partido escribe staff" on public.proximo_partido
  for all using (public.es_editor()) with check (public.es_editor());
