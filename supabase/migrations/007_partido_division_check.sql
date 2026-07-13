-- proximo_partido.division nació sin check (a diferencia de notas/sujetos):
-- un valor fuera de la lista rompería el link /division/[division] de la
-- barra roja (dynamicParams=false → 404) en todas las páginas.
alter table public.proximo_partido
  drop constraint if exists proximo_partido_division_check;

alter table public.proximo_partido
  add constraint proximo_partido_division_check
  check (division in ('primera','reserva','cuarta','quinta','sexta','septima','octava','novena','femenino'));
