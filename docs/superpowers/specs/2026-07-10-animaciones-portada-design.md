# Animaciones de portada con GSAP + Lenis — Diseño

**Fecha:** 2026-07-10
**Alcance:** Solo la portada `/` (modo editorial, sin filtros). Nota/jugador/sobre quedan para una fase posterior si esta pasada convence.
**Intensidad aprobada:** "Editorial sobrio" — reveals secos de entrada, una sola vez, sin efectos continuos de scroll (sin scrub/parallax).

---

## Principio rector

El sitio es brutalist editorial: bordes 2px, sombras offset sin blur, hover snap de 120-160ms. Las animaciones tienen que hablar el mismo idioma: **movimiento seco y mecánico**. Nada de fades flotantes genéricos, blur, bounce ni float. Los verbos son: **cortar** (clip-path), **estampar** (la sombra offset aparece después del frame), **encajar** (snap vertical corto).

El momento memorable es UNO: el reveal del hero al cargar. El resto (staggers de grillas, overlines) es acompañamiento discreto que refuerza la jerarquía de lectura.

## Arquitectura (enfoque A aprobado)

### Componente director único

- **`components/layout/AnimacionesPortada.tsx`** — client component, se monta solo en la portada editorial (al final del JSX de `app/(sitio)/page.tsx`, junto al contenido; no en el layout).
- Importa `gsap` y `gsap/ScrollTrigger` con **import dinámico dentro de `useEffect`** (mismo patrón que `LenisProvider`): cero GSAP en el bundle inicial, cero en el server.
- Sale temprano si `prefers-reduced-motion: reduce` → **no se registra nada**, el contenido queda como está (visible, estático).
- Busca elementos por data-attributes y arma los tweens. Cleanup completo en el return del efecto (`ScrollTrigger.killAll()` acotado a los triggers propios + kill de tweens).

### Contrato de data-attributes

Los server components NO se convierten a client. Solo se marcan:

| Atributo | Uso |
|---|---|
| `data-anim="hero"` | El wrapper del HeroFeature. Timeline de carga (no scroll). |
| `data-anim="grupo"` | Contenedor de grilla (bento, teasers, "Más notas", jugadores). Sus hijos directos se staggerean al entrar en viewport. |
| `data-anim="sello"` | Bloque con sombra offset (NewsletterBand, SobreAutorBand): entra y la sombra "se estampa" ~100ms después. |
| `data-anim="overline"` | Labels rojos de sección ("En la mira", "Lo último"): micro-slide horizontal + aparición. |

**Estado inicial oculto lo setea GSAP por JS** (`gsap.set`), nunca CSS. Sin JS, con reduced-motion o si GSAP falla al cargar → el contenido se ve normal. Cero CLS, cero riesgo de página en blanco. No se toca el HTML estático que hornea SSG.

### Sincronización Lenis ↔ ScrollTrigger

Hoy `LenisProvider` corre su propio `requestAnimationFrame` aislado; ScrollTrigger no se entera del scroll suavizado. Cambio en `LenisProvider`:

- Publicar la instancia en un módulo compartido (`lib/lenis.ts` con `getLenis()` / suscripción), o mínimamente emitir `lenis.on("scroll", ...)` hacia quien lo pida.
- `AnimacionesPortada` conecta: `lenis.on("scroll", ScrollTrigger.update)`.
- Si Lenis no está (reduced-motion lo apaga), ScrollTrigger funciona igual con el scroll nativo — pero como reduced-motion también apaga las animaciones, ese caso ni se da.

## Paquete de animaciones

Todas con easing `power3.out`, duraciones 0.4–0.7s, `once: true` (no re-animan al volver a scrollear). Trigger de viewport: `start: "top 85%"`.

1. **Hero (al cargar, timeline ~0.7s):**
   - Imagen: reveal con `clip-path: inset(0 100% 0 0)` → `inset(0 0% 0 0)` (corta de izquierda a derecha, 0.55s).
   - Bloque de texto: `y: 28 → 0` + opacity, arranca solapado (-0.35s).
   - Sombra offset 8px: el frame arranca sin sombra (`box-shadow: none` vía JS) y se estampa al final del timeline en un solo paso (sin transición — aparece, brutalist).
2. **Bento:** stagger de 70ms entre items, cada uno `y: 24 → 0` + opacity 0.45s, al entrar en viewport.
3. **Teasers "Más notas" y grilla de jugadores:** mismo patrón de grupo.
4. **Overlines rojos:** `x: -12 → 0` + opacity, 0.35s.
5. **NewsletterBand / SobreAutorBand:** bloque `y: 24 → 0` + opacity 0.45s; su sombra roja offset aparece de un frame al terminar (+0.1s).

## Qué NO se hace (a propósito)

- Nada de scrub/parallax continuo (quedó descartado en la elección de intensidad).
- No se anima la lista de noticias interna del bento ítem por ítem (el contenedor `NoticiasList` entra como un item más del grupo bento).
- No se anima el nav ni el footer.
- No se agregan clases CSS de animación en `globals.css` (todo vive en el director, para no ensuciar el sistema de utilidades brutalist).
- No re-animar en navegaciones client-side repetidas de forma molesta: si la portada se re-monta, el hero re-anima — aceptado (es el comportamiento estándar y la portada no se re-visita en loop).

## Errores y accesibilidad

- `prefers-reduced-motion` → early return total (patrón ya usado en LenisProvider).
- Si el import dinámico de GSAP falla → catch silencioso a nivel de efecto: contenido visible, sin animación, sin error en consola del usuario final (log en dev).
- El contenido nunca depende de JS para ser visible (estado oculto solo post-hidratación, microtask antes del primer paint del tween).

## Testing / verificación

- `npm run typecheck` + build limpio.
- Verificación visual con Playwright/Chrome DevTools: portada a 375/768/1440 — el HTML estático (JS deshabilitado) muestra todo el contenido; con JS, el hero revela y las secciones staggerean al scroll.
- Verificar que react-doctor siga 100/100 (el director es un client component chico con efecto + cleanup, patrón ya aceptado).
- Lighthouse: el CLS tiene que seguir en ~0.001 (el estado inicial via JS no toca el layout estático) y el bundle de portada no debe sumar GSAP al chunk inicial (import dinámico).
