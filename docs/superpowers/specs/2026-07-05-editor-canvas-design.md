# Editor de notas v2 — "La redacción" (canvas editorial)

Aprobado por el usuario: canvas editorial (estilo Ghost/Medium adaptado al brutalist del
sitio) + acciones de publicación como botones en la barra (sin radios).

## El canvas (columna de escritura)

Hoja `brut-frame-shadow` sobre papel, ancho de lectura 760px (el de la nota pública),
padding generoso. Adentro, en este orden, **sin labels de formulario**:

1. **Overline contextual** (solo lectura): cuadradito rojo + "Tipo · División" en mono
   rojo profundo — se actualiza según la ficha. Si `primicia`, aparece el
   `.primicia-badge` al lado. Es el mismo encabezado de la nota publicada.
2. **Título**: textarea auto-grow sin borde, Newsreader `clamp(2rem,4vw,3.2rem)`,
   tracking -0.025em. Placeholder "Título de la nota". Foco accesible: outline punteado
   rojo suave con offset (no desplaza el texto).
3. **Bajada**: textarea auto-grow sin borde, `text-lg/xl` gris copete. Contador de
   caracteres visible solo con foco.
4. **URL inline**: línea mono chica "/nota/{slug} ✎". Click → input inline (mismo estilo,
   borde inferior); Enter o blur cierra. Sigue autogenerándose desde el título hasta que
   se edite a mano.
5. **Filete** negro 2px (el mismo que separa el byline en la nota).
6. **Cuerpo**: Tiptap en modo canvas — sin caja propia; la toolbar pasa a ser una barra
   flotante sticky (debajo de la barra principal, borde 2px + sombra) y el texto corre
   sobre la hoja con `.article-prose`. `min-height: 55vh`.
7. Contador de palabras/lectura al pie (existente).

## La barra de acciones (BarraEditor v2)

Izquierda: `‹ Notas` · contexto ("Nueva nota" / "Editando") · SelloEstado · indicador de
guardado. Derecha: `[Vista previa]` + acciones según estado:

| Estado | Primario | Menú ▾ |
|---|---|---|
| nueva / borrador | `[Guardar borrador]` secundario + `[Publicar ▾]` rojo | Publicar ahora · Programar fecha… |
| publicada | `[Guardar cambios]` rojo | Despublicar |
| programada | `[Guardar]` rojo (mantiene fecha) | Publicar ahora · Cambiar fecha… · Despublicar |

- "Publicar ahora"/"Guardar cambios" respetan el checklist: deshabilitados con el motivo
  visible si falta algo. "Guardar borrador" siempre disponible (mínimo: título).
- "Programar fecha…" abre un panel anclado al botón (frame + sombra) con
  `datetime-local` + botón "Programar". "Cambiar fecha…" abre el mismo panel precargado.
- "Despublicar" confirma con ConfirmDialog ("guarda lo que tengas y la baja a borrador")
  y ejecuta `guardarNota` con modo `borrador`.
- El menú ▾ replica el patrón de MenuAcciones (cierra con Escape/click afuera,
  `aria-haspopup`).

## La ficha (sidebar)

Se van los radios de publicación. Nuevo orden: **"¿Lista para salir?"** (checklist) →
Clasificación (abierta) → Imagen principal (abierta) → Extras (plegada). Tabs
"La ficha / Cómo se ve" quedan.

## Sin cambios

Autosave de borradores (gatillado por `estadoActual === "borrador"`), beforeunload,
vista previa completa, toasts, server actions (`guardarNota` recibe el modo desde la
acción ejecutada; despublicar = modo borrador). Enter en el form ejecuta la acción
primaria del estado.

## Verificación
Screenshots 375/1440 (nueva, borrador, publicada), flujo programar en vivo, typecheck,
build, CLAUDE.md.
