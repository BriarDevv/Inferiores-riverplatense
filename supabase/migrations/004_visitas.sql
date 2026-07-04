-- 004_visitas.sql — lectura de visitas para el panel + vista agregada.

-- El staff puede LEER visitas (para stats). Nadie las escribe desde el cliente:
-- el insert lo hace la ruta del servidor con service role.
create policy "visitas lee staff" on public.nota_visitas for select
  using (public.es_editor());

-- Agregado por nota. security_invoker: respeta la RLS del que consulta.
create view public.nota_visitas_resumen
  with (security_invoker = true) as
select
  nota_id,
  count(*)::int as total,
  (count(*) filter (where visto_en > now() - interval '7 days'))::int as ult_7d,
  (count(*) filter (where visto_en > now() - interval '30 days'))::int as ult_30d
from public.nota_visitas
group by nota_id;

grant select on public.nota_visitas_resumen to authenticated, anon;
