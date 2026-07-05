# Resumen v2 — "Tablero de cierre"

Rediseño de `/admin` (Resumen) aprobado por el usuario. Objetivo doble: **pulso del sitio +
centro de trabajo**, con prioridad explícita del usuario: **que se vea armónico en pantalla**.

## Layout (enfoque A aprobado)

```
[PageHeader: Hola, {firma} — Resumen · ritmo: "Última nota hace 3 días · 4 en julio"] [+ Nueva nota]
[FRANJA TABLERO (ink, brut-frame-shadow-red):
   5 números con contexto            |  Gráfico visitas 14 días (SVG barras)
   Visitas·7d + delta ▲%             |  día pico en rojo + insight textual
   Publicadas + "+N esta semana"     |
]
[Nota del momento (grande: poster + visitas Anton + "2,3× la segunda"    | aside apilado:
  + top 2°–5° compacto al pie — reemplaza al módulo "Más leídas")        |  De dónde llegan
                                                                          |  Mobile vs Desktop
                                                                          |  A qué hora leen ]
[Próximas programadas | Para retomar | Últimas publicadas]   (3 columnas)
```

### Reglas de armonía (el pedido explícito)
- Un solo ritmo de espaciado: `gap-6` entre módulos, `mb-6` entre filas (hoy hay mezcla 8/10).
- Todos los módulos con el MISMO lenguaje: `brut-frame-shadow` + header ink con título Anton
  (patrón `ListaNotas` existente). La franja tablero es la única pieza `shadow-red`.
- Filas con `items-stretch`: los módulos de una misma fila igualan altura.
- Mini-módulos del aside: mismo componente de barras (`FilasBarra`), misma tipografía.
- Nada de gráficos con curvas/gradientes: barras rectas, ink + rojo, estilo scoreboard.

## Datos

### Migración `005_resumen.sql`
- `alter table nota_visitas add column dispositivo text check (dispositivo in ('mobile','desktop'))`
  (nullable; filas viejas = "sin dato").
- Vistas `security_invoker` + grant (staff vía RLS de la tabla base):
  - `visitas_por_dia` → `dia (date), visitas (int)` — global, para el gráfico y los deltas.
  - `visitas_por_hora` → `hora (0-23), visitas` .
  - `visitas_por_dispositivo` → `dispositivo, visitas`.
  - `visitas_por_referer` → `host (text), visitas` (host extraído en SQL; null = directo).

### Fix del referer (bug real detectado)
El header `Referer` del ping es la URL de la propia nota → inservible para saber el origen.
`RegistrarVisita` pasa a mandar `document.referrer` en el body (`ref`); la API lo valida
(URL http/https, máx 300 chars, se descarta si el host es el propio sitio) y lo guarda en
`referer`. Las filas viejas (host propio) se agrupan como "Sin dato".

### API `/api/visita`
- Detecta `dispositivo` del user-agent (`/Mobi|Android/i` → mobile, si no desktop).
- Guarda `referer` desde `body.ref` (regla de arriba).

### `lib/admin/stats.ts` (funciones nuevas)
- `getSerieDiaria(dias=14)` → `{ dia, visitas }[]` con días faltantes en 0.
- `getDeltaVisitas7d()` → `{ actual, anterior, deltaPct | null }` (null si anterior=0).
- `getVisitasPorHora()` → `number[24]` + helper de franja pico (ventana de 4hs con más visitas).
- `getDispositivos()` → `{ mobile, desktop, sinDato }`.
- `getFuentes()` → `{ fuente, visitas }[]` normalizado en TS: Google, Instagram, X,
  Facebook, TikTok, YouTube, Directo (referer null), Otros, Sin dato.

## Componentes nuevos (`components/admin/`)
- `GraficoBarras.tsx` (server, SVG): barras verticales; props `serie {label, valor}[]`,
  `alto`; barra máxima en rojo, resto blanco/40 sobre ink (o ink sobre papel según `tono`);
  `role="img"` + `aria-label` con resumen. Sin dependencias.
- `Delta.tsx` (server): `▲ 32%` / `▼ 12%` / `=` con tokens `--estado-*` + `sr-only`.
- `FilasBarra.tsx` (server): filas label + barra horizontal + valor (mono, tabular).
- `NotaDelMomento.tsx` (server): poster 16:9, overline "La nota del momento · 7 días",
  título display, visitas en Anton + insight ("2,3× más que la segunda"), pie con top 2°–5°.
  Vacío: última publicada con copy "Todavía sin lecturas esta semana".
- `ProximasProgramadas.tsx` (server): fecha grande (día Anton + mes mono) + título + firma.
  Vacío: "Nada programado. Podés dejar una nota lista con fecha desde el editor."

## Ritmo de publicación
Línea bajo el título (prop `descripcion` de PageHeader o slot nuevo): "Última nota hace N
días · M notas en {mes}". Deriva de `publicada_en` de las notas publicadas. Si N > 7, la
frase va en rojo profundo suave como empujón ("Última nota hace 12 días").

## Estados vacíos (tono redacción)
- Gráfico sin datos: "Los primeros lectores van a aparecer acá."
- Fuentes/dispositivo/horas sin datos: "Con las próximas visitas se arma solo."
- Deltas sin período anterior: se omite el signo (no "▲ ∞%").

## Verificación
- `npx tsx scripts/run-migrations.ts` + probar `/api/visita` con dispositivo/ref.
- Screenshots Playwright 375/768/1440 del Resumen; revisar armonía (gaps, alturas).
- Typecheck + build de producción. Actualizar CLAUDE.md.
