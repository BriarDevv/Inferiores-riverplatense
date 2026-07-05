-- 005_resumen.sql — datos para el tablero del Resumen:
-- dispositivo por visita + vistas de agregación (día / hora / dispositivo / referer).

alter table public.nota_visitas
  add column dispositivo text check (dispositivo in ('mobile', 'desktop'));

-- Todas security_invoker: heredan la RLS de nota_visitas (solo staff lee).

create view public.visitas_por_dia
  with (security_invoker = true) as
select
  (visto_en at time zone 'America/Argentina/Buenos_Aires')::date as dia,
  count(*)::int as visitas
from public.nota_visitas
group by 1;

create view public.visitas_por_hora
  with (security_invoker = true) as
select
  extract(hour from visto_en at time zone 'America/Argentina/Buenos_Aires')::int as hora,
  count(*)::int as visitas
from public.nota_visitas
group by 1;

create view public.visitas_por_dispositivo
  with (security_invoker = true) as
select dispositivo, count(*)::int as visitas
from public.nota_visitas
group by 1;

-- Host del referer (null = visita directa). El "de dónde" fino se normaliza en TS.
create view public.visitas_por_referer
  with (security_invoker = true) as
select
  substring(referer from '^https?://([^/]+)') as host,
  count(*)::int as visitas
from public.nota_visitas
group by 1;

grant select on public.visitas_por_dia,
                public.visitas_por_hora,
                public.visitas_por_dispositivo,
                public.visitas_por_referer
  to authenticated, anon;
