# Rediseño del panel admin — "Cierre de edición" (v2)

> Propuesta de mejora profunda de frontend/UX/UI del dashboard, escrita tras auditar el código real
> (`app/admin/(panel)/*`, `components/admin/*`, `lib/admin/*`, bloque `.admin-*` de `globals.css`).
> Respeta las decisiones locked-in del proyecto (CLAUDE.md): brutalist editorial, paleta oficial
> `#EB192E`/`#C21020`, Newsreader/Anton/Inter/JetBrains Mono, sin rounded, sin blur, sin `§`.

---

## A. Diagnóstico del panel actual

Lo que ya está bien (no tocar la base): la identidad "mesa de redacción" existe y es coherente
(sidebar ink, barra roja de cierre, marcador tipo scoreboard, headers ink en módulos, numeración
Anton). La arquitectura es sana: server components + server actions + RLS, sin estado duplicado.

Lo que hace que hoy se sienta "funciona pero básico":

### 1. Cero feedback de acciones (el problema Nº 1)
- Publicar, destacar, cambiar rol, vincular firma: la acción corre, `router.refresh()`, y la UI
  cambia **sin decir nada**. No hay toast, no hay estado "guardando", no hay confirmación visual.
- Las confirmaciones destructivas usan `window.confirm()` nativo (NotaAcciones:74 del flujo
  borrar, EquipoAcciones:74 revocar): rompe la estética, no es accesible con foco atrapado, y no
  explica consecuencias.
- En Equipo, **cambiar el rol es un `onChange` de un select**: un mis-click convierte a alguien en
  admin sin confirmación. Es el punto más riesgoso de UX del panel.

### 2. Filtros de Notas: correctos pero lentos de usar
- Cuatro selects + botón "Filtrar" = 3 interacciones por filtro. No hay submit automático, no hay
  chips de filtros activos ("3 filtros activos ✕"), no hay ordenamiento por columna, no hay
  paginación (a 500 notas la tabla explota), no se puede filtrar por destacada/primicia.

### 3. La tabla de Notas no aprovecha lo editorial
- Sin thumbnail del poster (existe `poster_url`), sin avatar de la firma (existe `foto_url`), sin
  badge de primicia (existe el campo), la ★ de destacada va inline en el título en vez de ser un
  marcador de columna. La fila no cuenta la historia de la nota de un vistazo.

### 4. Resumen sin lectura temporal
- El marcador muestra números absolutos sin comparación ("Visitas · 7 días: 48" — ¿es mejor o
  peor que la semana pasada?). No hay evolución diaria (los timestamps están en `nota_visitas`,
  solo falta agregarlos por día), no hay módulo de "próximas programadas".

### 5. El editor no protege el trabajo
- Sin autosave, sin aviso de cambios sin guardar al salir (cerrás la pestaña y perdiste 40
  minutos de nota), sin contador de palabras/tiempo de lectura, sin checklist de publicación
  ("falta poster", "bajada muy corta"), sin preview de cómo queda la card en la portada.
- La barra de acciones vive al fondo del form: en una nota larga hay que scrollear para guardar.

### 6. Estadísticas responde "cuánto" pero no "qué cambió"
- No hay evolución temporal, no hay comparación contra el período anterior, no hay desglose por
  referer (¡la columna `referer` ya se guarda en `nota_visitas` y no se usa!), no hay texto de
  insight ("La nota más leída duplicó a la segunda").

### 7. Equipo: conceptos confundidos y copy que filtra lo técnico
- "sin acceso" como estado no distingue "invitado que nunca aceptó" de "acceso revocado".
- El copy de UI menciona `scripts/gen-login-link.ts`: instrucción de developer en pantalla de
  usuario final.

### 8. Responsive y a11y
- Las tablas solo tienen `overflow-x-auto`: en mobile son incómodas. Sin transformación a cards.
- Acciones que refrescan la página no anuncian nada a lectores de pantalla (falta `aria-live`).

### Sobre las sugerencias del brief que NO voy a adoptar (y por qué)
- **Paleta `#D71920` / grises Tailwind**: no. La paleta River `#EB192E`/`#C21020` es decisión
  locked-in del proyecto y es la marca. Se **extiende** con tokens semánticos (abajo), no se pisa.
- **shadcn/Radix/Tremor/Recharts**: no hacen falta. El design system brutalist propio ya existe;
  meter una librería de componentes traería estética ajena (rounded, blur, motion) que habría que
  pelear clase por clase. Los gráficos que necesitamos (sparkline + barras) son SVG de 30 líneas,
  sin dependencia, dentro del presupuesto de bundle.
- **Dark mode**: el panel ya tiene su dualidad (estructura ink oscura + superficie papel). Un
  toggle duplicaría el costo de QA sin beneficio editorial. Descartado.
- **Bulk actions y virtualización**: hoy hay 22 notas y 1–2 personas cargando. Paginación +
  ordenamiento cubren hasta ~1000 notas. Bulk actions es YAGNI; queda anotado para cuando exista
  el dolor real.

---

## B. Dirección visual: "Cierre de edición"

No es un rediseño desde cero: es **subir el volumen de lo que ya funciona** y llenar los huecos.

- **Concepto**: el panel es la contratapa del diario — la parte que el lector no ve. Misma
  tipografía y grilla que el sitio, pero con densidad de herramienta: números tabulares, sellos,
  chips de estado como fichas de archivo, líneas de cierre.
- **Paleta**: la oficial, más tokens semánticos de estado (solo para el admin):

  | Token | Valor | Uso |
  |---|---|---|
  | `--estado-publicada` | `#166534` (verde tinta) | chip + texto de estado |
  | `--estado-publicada-bg` | `#DCFCE7` | fondo del chip |
  | `--estado-programada` | `#1E40AF` (azul sobrio) | chip programada |
  | `--estado-programada-bg` | `#DBEAFE` | fondo |
  | `--estado-borrador` | `#52525B` | chip borrador |
  | `--estado-borrador-bg` | `#E4E4E7` | fondo |
  | `--delta-sube` / `--delta-baja` | verde tinta / `#C21020` | variación vs período anterior |

  Regla: **el rojo River queda reservado a identidad y acción primaria**; los estados nunca usan
  rojo (así "borrar" y "error" no compiten con la marca). Ningún estado se comunica solo por
  color: siempre chip con texto (y flecha ▲/▼ en deltas).
- **Tipografía**: sin cambios de familias. Se formaliza la escala del panel: Anton para números y
  headers de módulo, Newsreader bold para títulos de nota en listas, Inter para formularios y
  celdas, Mono para meta/fechas/slugs. Números siempre `tabular-nums`.
- **Firma visual del rediseño** (el detalle memorable): el **sello de estado** — chips de estado
  con borde 2px del color de tinta correspondiente y texto uppercase mono, como sello de goma de
  redacción ("PUBLICADA", "PROGRAMADA · MAÑ 18:00", "BORRADOR"). Y los **deltas de scoreboard**:
  cada número del marcador lleva debajo su variación en Anton chico ("▲ 32%" / "▼ 12%" / "= sin
  cambios") contra el período anterior.

---

## C. Arquitectura de navegación

Se mantiene la estructura (Resumen / Notas / Autores / Estadísticas / Equipo). Cambios puntuales:

1. **Sidebar**: se agrega botón "+ Nueva nota" (CTA rojo, arriba de la navegación) — la acción
   más frecuente hoy requiere pasar por Resumen o Notas. Debajo del email del usuario se muestra
   la **firma vinculada** ("firma: Pablo Molina") si existe.
2. **Barra de cierre** (la roja de arriba): gana un dato útil — cantidad de **programadas
   pendientes** ("2 programadas ●") linkeando a `/admin/notas?estado=programada`. Deja de ser
   solo decorativa.
3. Sin breadcrumbs (la jerarquía es de 2 niveles, el PageHeader ya da contexto). Sin búsqueda
   global (la búsqueda vive en Notas, que es donde se busca).

---

## D. Rediseño por pantalla

### D1. Resumen — "La mesa, hoy"

Layout (desktop):

```
[PageHeader: Hola, X — La mesa, hoy            (+ Nueva nota)]
[MARCADOR ink: 5 celdas, número Anton + DELTA vs período ant.]
[SPARKLINE ancho: visitas por día, últimos 14 días, SVG]
[Para retomar ½] [Últimas publicadas ½]
[Más leídas   ½] [Próximas programadas ½]
```

- **Deltas en el marcador**: "Visitas · 7 días: 48 ▲ 32%" (contra los 7 días anteriores). Verde
  tinta sube, rojo profundo baja, gris sin cambios. Requiere una vista SQL nueva (ver §Datos).
- **Sparkline de visitas por día** (14 días): SVG propio, barras 2px estilo brutalist (no curva
  suave), eje solo con primera/última fecha en mono. Debajo, una línea de insight generada en
  server: "El martes fue el mejor día: 23 visitas, empujadas por «{título}»."
- **Próximas programadas**: mini timeline (fecha mono grande + título + firma), reemplaza el
  tercer uso de ListaNotas suelto. Vacío: "Nada programado. Podés dejar una nota lista con fecha
  desde el editor."
- Para el rol **editor** (no admin), el marcador y las listas se filtran a sus notas, con el
  overline "Tus números".

### D2. Notas — la tabla central

- **Filtros auto-submit**: los selects disparan el GET al cambiar (progressive enhancement: sin
  JS sigue existiendo el botón Filtrar). La búsqueda con debounce 300ms.
- **Chips de filtros activos** bajo la barra: `[Estado: Borradores ✕] [División: Séptima ✕]` +
  "Limpiar todo". Cada chip es un link que quita ese parámetro.
- **Ordenamiento por columna** (`?orden=visitas|fecha|titulo&dir=`): headers clickeables con
  flecha; server-side, sin JS extra.
- **Paginación** (`?pagina=`, 25 por página): "1–25 de 132 notas · ‹ ›" en mono, al pie.
- **Filas más editoriales**:
  - Columna Nota: **thumbnail del poster 56×42** (o placeholder rayado "sin poster") + título
    Newsreader + slug mono. Marcadores compactos a la izquierda del título: `★` destacada (rojo),
    sello `PRIMICIA` (mini chip rojo borde 2px).
  - Columna Firma: **avatar 24px** + nombre.
  - Columna Estado: sello nuevo (§B). Para programadas, el sello incluye la fecha corta.
  - Acciones: se compactan en menú "⋯" (popover brutalist con borde 2px + offset shadow) con
    Editar / Ver en el sitio / Publicar–Despublicar / Destacar / **Duplicar** (nueva action,
    copia como borrador con slug `-copia`) / Borrar (solo admin, en rojo, al final, separado por
    hairline).
- **Mobile (<md)**: la tabla se transforma en **cards apiladas** (título + sello + firma + fecha
  + visitas + menú ⋯). CSS puro con `display:block` en filas + labels, sin componente duplicado.

### D3. Editor de nota — donde se vive

- **Barra superior sticky** (dentro del área de contenido): a la izquierda "‹ Notas" + sello de
  estado actual; al centro **indicador de guardado** ("Guardado 18:42" / "Guardando…" / "Cambios
  sin guardar" en ámbar); a la derecha las acciones: [Guardar borrador] [Vista previa ↗]
  [Publicar ▾]. El botón de publicar es el único rojo.
- **Autosave de borradores**: cada 30s si hay cambios y la nota está en borrador (nunca
  auto-publica ni toca publicadas — ahí solo marca "cambios sin guardar"). Server action ya
  existente `guardarNota` reutilizada con flag `esAutosave` (no revalida rutas públicas).
- **Aviso al salir**: `beforeunload` + intercepción de navegación interna si hay cambios.
- **Contador**: bajo el editor, mono chico: "1.240 palabras · ~6 min de lectura" (usa el
  `tiempoLectura()` que ya existe en `lib/constants.ts` — mismo número que verá el lector).
- **Checklist de publicación** (en el sidebar, arriba del bloque Publicación): lista de checks
  en vivo — ✓ Título / ✓ Bajada (min 80 caracteres) / ✗ Poster / ✓ División / ✗ Al menos un
  sujeto (recomendado). Los obligatorios bloquean "Publicar ahora" con explicación; los
  recomendados solo avisan. Es la garantía de calidad SEO sin llamarse "SEO".
- **Preview de card**: tab en el sidebar ("Metadata | Preview") que renderiza la `TeaserCard`
  real con los datos actuales — el componente ya existe, es literalmente importar y pasarle la
  nota armada. Responde "¿cómo se ve en la portada?" sin publicar.
- **Metadata agrupada en secciones plegadas** (`<details>` estilizado, sin JS): Publicación
  (abierta) / Clasificación / Multimedia / Extras (primicia, destacada, tags).

### D4. Autores

- Cards actuales quedan; se agrega:
  - **Indicador de perfil completo**: barra de 4 segmentos (foto / bio / cargo / redes) con
    "Perfil 3/4" en mono. Un perfil incompleto es SEO perdido — esto lo hace visible.
  - **Visitas acumuladas** de la firma en la card (dato ya disponible cruzando notas × visitas).
  - Botón "Ver perfil público ↗" directo en la card (hoy hay que entrar a editar).
- El form gana la misma barra superior sticky del editor de notas (coherencia).

### D5. Equipo

- **Cambiar rol deja de ser un onChange silencioso**: el select abre `ConfirmDialog` — "¿Hacer
  admin a fulano@…? Va a poder borrar notas, gestionar el equipo y cambiar roles." / Confirmar.
- **Revocar** usa `ConfirmDialog` (no `window.confirm`), con el mismo copy actual mejorado.
- **Estados claros**: sello "ACTIVO" (verde tinta) / "INVITACIÓN PENDIENTE" (ámbar, si
  `ultimoAcceso === null`) / "SIN ACCESO" (gris, si no tiene profile). Con la pendiente aparece
  la acción "Reenviar invitación".
- **Copy sin fugas técnicas**: la nota al pie pasa a "El plan actual permite pocos emails por
  hora. Si una invitación no llega, reintentá en una hora." (el fallback del script queda solo
  en CLAUDE.md, para vos).
- Encabezado con la aclaración conceptual permanente: "Los usuarios entran al panel; las firmas
  aparecen en el sitio. Una cuenta puede estar vinculada a una firma."

### D6. Estadísticas

- **Filtros arriba**: período (chips actuales) + **firma** + **división** (selects GET). Todo lo
  de abajo respeta los filtros.
- **KPIs con comparación**: "48 visitas ▲ 32% vs período anterior" + "12 notas con lecturas" +
  "Mejor día: martes 30".
- **Gráfico principal**: evolución diaria (mismo componente Sparkline del Resumen, versión
  grande con eje). Insight en texto al pie.
- **Referers**: módulo nuevo "De dónde llegan" — barras horizontales por dominio del referer
  (google / instagram / directo / otros), normalizando el host en server. El dato ya se guarda
  y hoy se tira.
- Top 10 y rankings por división/tipo/firma quedan (ya están bien), heredan los filtros.
- **Exportar CSV**: link "Descargar CSV" del detalle por nota (route handler simple). Barato y
  útil para el cliente.

### D7. Login

Ya cumple (acreditación de prensa, estados de envío). Solo se alinea el copy de error de email
no autorizado: "Solo pueden entrar cuentas invitadas por un administrador."

---

## E. Sistema de componentes (nuevos/modificados)

| Componente | Tipo | Descripción | Se usa en |
|---|---|---|---|
| `Toast` + `ToastProvider` | client | Esquina inf. der., borde 2px + offset shadow, ink (ok) / rojo profundo (error), auto-cierra 4s, `role="status"` `aria-live="polite"`, apilable | todas las actions |
| `ConfirmDialog` | client | `<dialog>` nativo estilizado brutalist: título Anton, cuerpo Inter, botón peligroso rojo profundo a la derecha, foco atrapado (nativo), Escape cierra | borrar, revocar, cambiar rol, despublicar |
| `SelloEstado` | server | chip borde 2px + mono uppercase, variantes publicada/programada(+fecha)/borrador/activo/pendiente | tablas, editor, equipo |
| `MenuAcciones` | client | popover ⋯ con borde 2px + shadow 5px, items `.chip`, cierra con click afuera/Escape, `aria-haspopup` | tabla notas |
| `Sparkline` | server | SVG barras por día, sin dependencia; props `datos: {fecha, valor}[]`, `alto`, `conEje` | resumen, estadísticas |
| `Delta` | server | ▲/▼/= + %, verde tinta/rojo profundo/gris, con `<span class="sr-only">` "subió/bajó" | marcador, KPIs stats |
| `ChipsFiltrosActivos` | server | chips-link que quitan su parámetro + "Limpiar todo" | notas, estadísticas |
| `Paginacion` | server | mono "1–25 de N · ‹ ›", links GET | notas |
| `ChecklistPublicacion` | client | checks en vivo derivados del estado del form | editor |
| `BarraEditor` | client | barra sticky superior con estado de guardado y acciones | editor nota y autor |
| `FilaCardMobile` | css | transformación tabla→cards bajo `md` (solo CSS en `.admin-table`) | notas, equipo |

Server actions nuevas: `duplicarNota(id)`, `reenviarInvitacion(userId)`. Route handler nuevo:
`/admin/estadisticas/csv`.

### Datos (mínimo SQL nuevo, migración `005_stats.sql`)
- Vista `nota_visitas_por_dia` (`security_invoker`, lectura staff): `nota_id, dia, visitas` —
  alimenta sparklines, deltas de período y "mejor día".
- Vista o query de referers normalizados (puede resolverse en TS server-side sobre una query
  agregada simple; decidir en implementación por volumen).

---

## F. Flujos críticos (comportamiento exacto)

- **Crear y publicar**: Nueva nota → escribe (autosave silencioso cada 30s, "Guardado 18:42") →
  checklist en verde → Publicar ▾ → "Ahora" o "Programar" → toast "Publicada. Ver en el sitio ↗"
  (el toast lleva el link).
- **Publicar bloqueado**: checklist con ✗ obligatorio → botón deshabilitado con texto al lado:
  "Falta el poster para publicar."
- **Borrar nota**: ⋯ → Borrar → ConfirmDialog "Borrar «{título}». Esta acción no se puede
  deshacer. Las visitas registradas se pierden." → toast "Nota borrada."
- **Cambiar rol**: select → ConfirmDialog con consecuencias del rol → toast "Ahora {email} es
  admin."
- **Filtrar notas**: click en select → recarga con filtro aplicado + chip visible → click en ✕
  del chip lo saca. Cero botones intermedios (pero el botón existe sin JS).
- **Salir con cambios**: navegación → dialog "Tenés cambios sin guardar. ¿Guardar como borrador
  antes de salir?" [Guardar y salir] [Salir sin guardar] [Seguir editando].

## G. Microcopy (tono redacción, es-AR profesional)

- Vacíos: "Todavía no hay notas en esta división." · "Ninguna nota coincide con esos filtros —
  probá quitando la división o ampliando el período." · "Nada programado para los próximos días."
- Errores: "No se pudo guardar. Tus cambios siguen acá; probá de nuevo." · "La imagen supera los
  5 MB. Comprimila y volvé a intentar."
- Permisos: "Solo un administrador puede borrar notas." (tooltip en acción deshabilitada, no
  ocultarla al editor: ver la acción y saber por qué no puede es más claro).
- Éxitos: "Publicada. Ver en el sitio ↗" · "Borrador guardado." · "Programada para el sáb 6,
  18:00." · "Invitación enviada a {email}."

## H. Responsive
- Desktop: como está + mejoras. Tablet: sidebar ya colapsa a barra horizontal (existente);
  filtros envuelven; editor apila metadata debajo del cuerpo. Mobile: tablas→cards (E),
  marcador 2 columnas (existente), editor consultable (no optimizado para escribir largo).

## I. Accesibilidad (checklist de cierre)
- [ ] Toasts con `role="status"`; errores de action con `role="alert"` (ya hay algunos).
- [ ] ConfirmDialog: `<dialog>` nativo → foco atrapado + Escape gratis; foco vuelve al disparador.
- [ ] MenuAcciones: `aria-haspopup`, `aria-expanded`, cierre con Escape, foco al abrir.
- [ ] Sort headers: `aria-sort` en `<th>`.
- [ ] Deltas y sellos: texto siempre presente, `sr-only` para dirección de flechas.
- [ ] Sparkline: `role="img"` + `aria-label` con resumen ("48 visitas en 14 días, pico el martes").
- [ ] Contrast check de los tokens de estado nuevos sobre sus fondos (AA texto chico).

## J. Performance
- Sin dependencias nuevas de UI/charts (SVG propio). Tiptap ya carga solo en el editor
  (verificar `dynamic import` en la implementación; si no, agregarlo).
- Toast/ConfirmDialog/MenuAcciones: client components chicos, sin portal-library.
- Debounce 300ms en búsqueda; paginación server-side evita tablas gigantes.
- El bundle del admin sigue separado del sitio público (route groups ya lo garantizan).

## K. Plan de implementación (fases)

1. **Feedback core** — tokens semánticos + `Toast` + `ConfirmDialog` + `SelloEstado` + adopción
   en todas las actions existentes (notas, autores, equipo). *El 80% de la sensación de calidad.*
2. **Notas pro** — auto-submit + chips activos + sort + paginación + fila editorial (poster,
   avatar, primicia) + `MenuAcciones` + duplicar + tabla→cards mobile.
3. **Editor blindado** — `BarraEditor` sticky + autosave + aviso de cambios + contador +
   `ChecklistPublicacion` + preview de card + metadata en secciones.
4. **Datos con memoria** — migración `005_stats.sql` (visitas por día) + `Sparkline` + `Delta`
   en Resumen + próximas programadas + barra de cierre con programadas.
5. **Estadísticas completas** — evolución + comparación + filtros firma/división + referers +
   insights + CSV.
6. **Autores y Equipo** — perfil completo, visitas por firma, estados de invitación, reenviar,
   confirmaciones de rol, copy limpio.
7. **Cierre** — pasada responsive, checklist a11y (I), screenshots Playwright de todas las
   pantallas en 375/768/1440, build de producción, actualización de spec y CLAUDE.md.

Cada fase termina con build verde + verificación visual. Fases 1–3 son el corazón; 4–6 se pueden
reordenar según ganas.

## L. Criterios de aceptación
- Ninguna acción del panel termina sin feedback visible (toast o estado inline).
- Ningún `window.confirm` queda en el código.
- Publicar con datos incompletos es imposible y el motivo es visible.
- Cerrar el editor con cambios sin guardar siempre avisa.
- La tabla de Notas es usable con 500 notas (paginada, ordenable) y en un teléfono.
- Todo número comparable muestra contra qué se compara.
- Cero copy técnico (scripts, códigos de error crudos) en pantalla.
- `npm run build` y typecheck verdes; axe sin errores nuevos.
