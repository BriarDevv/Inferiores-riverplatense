-- 002_rls.sql — políticas de seguridad
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

-- Visitas: sin políticas => ni anon ni authenticated leen/escriben.
-- El insert lo hará una ruta de servidor (Fase 3) con privilegios.

-- Storage: lectura pública, escritura staff
create policy "imagenes lectura publica" on storage.objects for select
  using (bucket_id = 'imagenes');
create policy "imagenes escribe staff" on storage.objects for insert
  with check (bucket_id = 'imagenes' and public.es_editor());
create policy "imagenes update staff" on storage.objects for update
  using (bucket_id = 'imagenes' and public.es_editor());
create policy "imagenes delete staff" on storage.objects for delete
  using (bucket_id = 'imagenes' and public.es_editor());
