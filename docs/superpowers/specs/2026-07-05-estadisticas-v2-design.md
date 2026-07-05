# Estadísticas v2 — "La historia en 3 actos"

**Fecha:** 2026-07-05 · **Estado:** aprobado por el usuario

Rework completo de `/admin/estadisticas`. La página actual (chips de período + top 10 + tres rankings) no cuenta ninguna historia y no muestra la mitad de lo que ya se mide. La nueva versión es un solo scroll con jerarquía en tres actos, donde **el período elegido afecta a toda la página**.

## Decisiones cerradas con el usuario

- Bloques: TODO (evolución + comparación, ranking completo, audiencia). Sin CSV.
- Estructura: historia en 3 actos en un solo scroll (se descartaron tabs y grilla pareja).
- Estética: brutalist del panel (marcos 2px, offset shadows, headers ink, Anton para números). Separadores de acto = label mono + hairline, **sin rayita arriba** (overline con raya está vetado).
- Carril `max-w-6xl mx-auto`, `gap-6`/`mb-6` consistentes como en Resumen.

## Datos

Nueva lectura period-aware en `lib/admin/stats.ts`:

- `getVisitasCrudas(desde: Date | null)` — SELECT de `nota_visitas` (`nota_id, visto_en, referer, dispositivo`) con filtro `visto_en >= desde` cuando aplica. La RLS de staff (004) ya permite leer la tabla con el cliente de sesión. Volumen chico (sitio portfolio), agregar en TS es más simple que parametrizar vistas SQL.
- Agregaciones como **funciones puras** (testeables, sin Supabase): serie diaria (relleno de días en 0; si el rango supera ~90 puntos se agrupa por semana), delta vs período anterior (requiere segundo fetch con `desde` corrido, o un solo fetch de `2×período` y partir en TS — se elige esto último: un solo query trae `2×período` y se parte), por hora (TZ America/Argentina/Buenos_Aires vía `toLocaleString`), por dispositivo, por fuente (reusa `FUENTES_CONOCIDAS`), por nota.
- Histórico: `desde = null`, delta no aplica (se muestra "—" sin comparación).
- Las vistas SQL existentes (`visitas_por_*`) quedan para el Resumen; no se tocan migraciones.

## UI

**Header:** PageHeader "Estadísticas" (sin overline) + descripción del contador propio. Selector de período: chips brutalist `7 días · 30 días · 90 días · Histórico` (`?periodo=7d|30d|90d|total`, GET, default 7d). A la derecha el resumen en mono: "N visitas · M notas con lecturas".

**Acto 1 · LA EVOLUCIÓN** — grid `lg:grid-cols-[1fr_320px]`:
- Izquierda: gráfico grande de visitas por día (SVG propio, variante grande de `GraficoBarras` — se generaliza el componente con props de alto/densidad en vez de duplicarlo), pico en rojo, ejes/fechas en mono. Insight textual debajo ("El sábado 27 fue el mejor día: 41 visitas").
- Derecha, apilados: total del período GIGANTE (Anton) + `Delta` vs período anterior + "Mejor día" (fecha + visitas) + "Promedio diario".

**Acto 2 · QUÉ RINDE**:
- Tabla completa de notas (todas las que tengan visitas > 0 en el período; sin paginación): posición Anton roja, título → `/admin/notas/[id]`, meta tipo·división·firma·fecha, barra proporcional de visitas del período, columna "total histórico". Orden fijo por visitas del período desc.
- Debajo, fila `md:grid-cols-3`: rankings División / Tipo / Firma con barra + **porcentaje de participación** ("Reserva — 38%").

**Acto 3 · QUIÉN LEE** — fila `md:grid-cols-3`, módulos `brut-frame-shadow` + header ink:
- **De dónde llegan**: fuentes normalizadas con % y barra (FilasBarra ganó soporte de %).
- **Mobile vs Desktop**: una sola barra dividida en dos colores (rojo mobile / ink desktop) con % a los lados; "sin dato" como resto gris si existe.
- **A qué hora leen**: 24 barras horarias, franja pico de 4 hs resaltada en rojo, insight "tu mejor ventana es 18–22 h".

**Separadores de acto**: componente local — número/label en mono rojo profundo + título Anton + hairline. Sin `§`, sin raya superior.

**Estados vacíos**: cada módulo con copy útil ("Sin visitas en este período. El contador suma con cada lectura del sitio."), la página nunca rompe con 0 datos.

## Archivos

- `app/admin/(panel)/estadisticas/page.tsx` — reescritura (server component, GET-only).
- `lib/admin/stats.ts` — `getVisitasCrudas` + agregaciones puras period-aware.
- `lib/admin/stats-agregar.ts` (si stats.ts pasa ~300 líneas) — funciones puras de agregación con tests vitest.
- `components/admin/GraficoBarras.tsx` — props para variante grande (alto, labels de eje).
- `components/admin/FilasBarra.tsx` — prop opcional de porcentaje.
- Componentes nuevos chicos: separador de acto y barra dividida pueden vivir en la página si no se reusan.

## Verificación

- Vitest para las agregaciones puras (partir serie, TZ de hora, agrupar por semana, fuentes).
- Playwright: los 4 períodos cargan, sin overflow horizontal a 375/768/1024/1440, y una visita de prueba (UA mobile + ref Google) aparece donde corresponde.
- `npm run typecheck` verde.
