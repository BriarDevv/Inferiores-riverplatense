# Autores v2 — "Legajo de firmas"

Aprobado. Rework de `/admin/autores` (grilla) y `/admin/autores/[id]` (detalle), en el
carril unificado 6xl. Sin backend nuevo: `listNotasAdmin` + mapa de visitas existentes.

## Grilla `/admin/autores`

Cards de legajo (grid `lg:grid-cols-2 gap-6`), cada una:
- Foto 96 circular (fallback iniciales), cargo overline, nombre display.
- **Mini marcador**: "16 notas · 342 visitas · última hace 3 días" (mono).
- **PerfilCompleto**: barra de 4 segmentos (foto / cargo / bio / redes) + "Perfil 3/4"
  ("Perfil completo" en verde tinta si 4/4; `title` con lo que falta).
- Acciones: `[Editar legajo]` (cta ink) + `Ver perfil público ↗` (link mono, target blank).
La card deja de ser un link entero (tiene dos acciones).

## Detalle `/admin/autores/[id]` — el legajo

- `PageHeader` con el nombre como título, el cargo como descripción y el CTA
  "Ver perfil público ↗".
- **Tira de legajo** (brut-frame, papel puro): foto + PerfilCompleto + marcador de la
  firma (Publicadas · Borradores · Visitas totales, números Anton rojos).
- Grid `lg:grid-cols-[1fr_380px]`:
  - Izquierda: `EditorAutor` (el form actual, sin cambios de campos).
  - Derecha: **NotasDeFirma** — módulo con header ink "Las notas que firmó (N)", filas
    con título + SelloEstado + fecha + visitas, cada una linkeando a `/admin/notas/{id}`;
    pie "Ver todas en Notas →" (`/admin/notas?autor={id}`). Tope 10 filas.
    Vacío: "Todavía no firmó notas. Cuando cargues una con esta firma, aparece acá."

## Nueva firma `/admin/autores/nueva`
Solo `PageHeader` "Nueva firma" + form (sin columna de notas).

## Componentes nuevos
- `PerfilCompleto.tsx` (server): segmentos + label; helper exportado con los ítems
  faltantes para el `title`.
- `NotasDeFirma.tsx` (server): props `autorId`, `notas: NotaAdmin[]`, `visitas: Map`.

## Verificación
Screenshots grilla + legajo (1440/375), typecheck, commit, CLAUDE.md.
