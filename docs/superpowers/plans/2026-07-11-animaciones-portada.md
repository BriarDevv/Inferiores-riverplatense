# Animaciones de portada (GSAP + Lenis) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reveals de entrada "editorial sobrio" en la portada `/`: hero con corte de clip-path al cargar, staggers secos por grilla al entrar en viewport, overlines con micro-slide y bandas con efecto "sello", todo apagable por `prefers-reduced-motion`.

**Architecture:** Un componente cliente director (`AnimacionesPortada`) importa GSAP + ScrollTrigger dinámicamente y anima elementos marcados con `data-anim` — las páginas/cards siguen siendo server components. Lenis se publica en un registro compartido (`lib/lenis.ts`) para sincronizar ScrollTrigger con el scroll suavizado.

**Tech Stack:** Next.js 16 (App Router), React 19, GSAP 3.15 (ya instalado, sin uso), Lenis 1.3, vitest.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-10-animaciones-portada-design.md`.
- El estado inicial oculto lo setea SOLO GSAP por JS (nunca CSS): sin JS / reduced-motion / GSAP caído → contenido visible y estático. Cero CLS.
- Todas las animaciones: easing `power3.out`, duraciones 0.4–0.7s, `once: true` (no re-animan), trigger `start: "top 85%"`.
- GSAP no puede entrar al bundle inicial: import dinámico dentro de `useEffect`.
- No agregar clases de animación a `globals.css`.
- No animar nav, footer ni los items internos de `NoticiasList`.
- Comentarios y nombres en español (idioma del codebase). Sin `console.log` (solo `console.error` guardado por `NODE_ENV === "development"`).
- Verificación final: `npm run typecheck`, `npm test`, `npm run build` y `npx react-doctor` en 100/100.

---

### Task 1: Registro compartido de Lenis (`lib/lenis.ts`)

`AnimacionesPortada` puede montarse antes o después de que `LenisProvider` termine su import async; el registro maneja los dos órdenes con una suscripción.

**Files:**
- Create: `lib/lenis.ts`
- Test: `lib/lenis.test.ts`
- Modify: `components/layout/LenisProvider.tsx`

**Interfaces:**
- Produces: `registrarLenis(l: LenisCompartido | null): void`, `suscribirLenis(cb: (l: LenisCompartido) => void): () => void`, `type LenisCompartido = { on(ev: "scroll", cb: () => void): void }`. Task 3 consume `suscribirLenis`.

- [ ] **Step 1: Escribir el test que falla**

Crear `lib/lenis.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { registrarLenis, suscribirLenis, type LenisCompartido } from "./lenis";

function lenisFake(): LenisCompartido {
  return { on: () => {} };
}

describe("registro compartido de Lenis", () => {
  it("notifica al suscriptor cuando la instancia ya estaba registrada", () => {
    const instancia = lenisFake();
    registrarLenis(instancia);
    let recibida: LenisCompartido | null = null;
    suscribirLenis((l) => {
      recibida = l;
    });
    expect(recibida).toBe(instancia);
  });

  it("notifica al suscriptor que llegó antes que la instancia", () => {
    registrarLenis(null); // resetea lo del test anterior
    let recibida: LenisCompartido | null = null;
    suscribirLenis((l) => {
      recibida = l;
    });
    expect(recibida).toBeNull();
    const instancia = lenisFake();
    registrarLenis(instancia);
    expect(recibida).toBe(instancia);
  });

  it("desuscribir corta las notificaciones", () => {
    registrarLenis(null);
    let llamadas = 0;
    const desuscribir = suscribirLenis(() => {
      llamadas += 1;
    });
    desuscribir();
    registrarLenis(lenisFake());
    expect(llamadas).toBe(0);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run lib/lenis.test.ts`
Expected: FAIL — `Cannot find module './lenis'` (o equivalente).

- [ ] **Step 3: Implementación mínima**

Crear `lib/lenis.ts`:

```ts
/**
 * Registro compartido de la instancia de Lenis.
 * LenisProvider la registra cuando termina su import async; quien necesite
 * engancharse al scroll suavizado (p. ej. ScrollTrigger) se suscribe acá,
 * sin importar en qué orden se montaron.
 */
export type LenisCompartido = {
  on(ev: "scroll", cb: () => void): void;
};

let instancia: LenisCompartido | null = null;
const oyentes = new Set<(l: LenisCompartido) => void>();

export function registrarLenis(l: LenisCompartido | null): void {
  instancia = l;
  if (l) oyentes.forEach((cb) => cb(l));
}

/** Llama al callback con la instancia actual (si existe) y con las futuras. */
export function suscribirLenis(
  cb: (l: LenisCompartido) => void,
): () => void {
  oyentes.add(cb);
  if (instancia) cb(instancia);
  return () => {
    oyentes.delete(cb);
  };
}
```

Ojo con el segundo test: `suscribirLenis` NO llama al callback si `instancia` es null — el `expect(recibida).toBeNull()` pasa por omisión.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run lib/lenis.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Registrar desde LenisProvider**

Modificar `components/layout/LenisProvider.tsx` — tres toques:

1. Import arriba: `import { registrarLenis } from "@/lib/lenis";`
2. Después de `lenisInstance = lenis;` agregar: `registrarLenis(lenis);`
3. En el cleanup, después de `lenisInstance?.destroy();` agregar: `registrarLenis(null);`

El archivo queda:

```tsx
"use client";

import { useEffect } from "react";
import { registrarLenis } from "@/lib/lenis";

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let rafId: number | null = null;
    let lenisInstance: { destroy: () => void; raf: (t: number) => void } | null =
      null;
    let cancelled = false;

    (async () => {
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      const { default: Lenis } = await import("lenis");
      // El import es async: si el componente se desmontó mientras cargaba,
      // no hay que crear la instancia (quedaría corriendo sin cleanup).
      if (cancelled) return;
      const lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.3,
      });
      lenisInstance = lenis;
      registrarLenis(lenis);

      const tick = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      lenisInstance?.destroy();
      registrarLenis(null);
    };
  }, []);

  return <>{children}</>;
}
```

- [ ] **Step 6: Typecheck + commit**

Run: `npm run typecheck` — Expected: sin errores.

```bash
git add lib/lenis.ts lib/lenis.test.ts components/layout/LenisProvider.tsx
git commit -m "feat(anim): registro compartido de Lenis para sincronizar ScrollTrigger"
```

---

### Task 2: Componente director `AnimacionesPortada`

**Files:**
- Create: `components/layout/AnimacionesPortada.tsx`

**Interfaces:**
- Consumes: `suscribirLenis` de `@/lib/lenis` (Task 1).
- Produces: componente `<AnimacionesPortada />` (client, render null) que Task 3 monta en la portada. Contrato de data-attributes que Task 3 estampa en el JSX:
  - `data-anim="hero"` — wrapper del hero (timeline al cargar; adentro busca `[data-anim-hero-img]`, `[data-anim-hero-texto]` y el `article`).
  - `data-anim="grupo"` — contenedor cuyos hijos directos se staggerean al entrar en viewport.
  - `data-anim="overline"` — label rojo con micro-slide.
  - `data-anim="sello"` — bloque cuya sombra offset se "estampa" al final.

- [ ] **Step 1: Implementar el componente**

Crear `components/layout/AnimacionesPortada.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { suscribirLenis } from "@/lib/lenis";

/**
 * Director de animaciones de la portada (spec 2026-07-10).
 * Anima elementos marcados con data-anim sin convertirlos a client components.
 * El estado oculto inicial lo setea GSAP por JS: sin JS, con
 * prefers-reduced-motion o si el import falla, el contenido se ve normal.
 */
export default function AnimacionesPortada() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelado = false;
    let limpiar: (() => void) | null = null;

    (async () => {
      let gsapMod: typeof import("gsap");
      let stMod: typeof import("gsap/ScrollTrigger");
      try {
        [gsapMod, stMod] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
      } catch (error: unknown) {
        // Sin GSAP no hay animación, pero el contenido ya es visible.
        if (process.env.NODE_ENV === "development") {
          console.error("No se pudo cargar GSAP", error);
        }
        return;
      }
      if (cancelado) return;

      const gsap = gsapMod.gsap;
      const ScrollTrigger = stMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      // Lenis suaviza el scroll con su propio rAF: sin este puente,
      // ScrollTrigger mide posiciones desfasadas.
      const desuscribirLenis = suscribirLenis((lenis) => {
        lenis.on("scroll", ScrollTrigger.update);
      });

      const ctx = gsap.context(() => {
        // === HERO: timeline al cargar (el único momento "wow") ===
        const hero = document.querySelector<HTMLElement>('[data-anim="hero"]');
        if (hero) {
          const marco = hero.querySelector<HTMLElement>("article");
          const img = hero.querySelector<HTMLElement>("[data-anim-hero-img]");
          const texto = hero.querySelector<HTMLElement>("[data-anim-hero-texto]");
          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
          // La sombra offset arranca ausente y se estampa de golpe al final.
          if (marco) tl.set(marco, { boxShadow: "none" });
          if (img) {
            tl.fromTo(
              img,
              { clipPath: "inset(0 100% 0 0)" },
              { clipPath: "inset(0 0% 0 0)", duration: 0.55 },
            );
          }
          if (texto) {
            tl.fromTo(
              texto,
              { y: 28, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.5 },
              "-=0.35",
            );
          }
          if (marco) tl.set(marco, { clearProps: "boxShadow" });
        }

        // === GRUPOS: stagger seco de los hijos directos ===
        document
          .querySelectorAll<HTMLElement>('[data-anim="grupo"]')
          .forEach((grupo) => {
            const items = Array.from(grupo.children);
            if (items.length === 0) return;
            gsap.fromTo(
              items,
              { y: 24, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.45,
                ease: "power3.out",
                stagger: 0.07,
                scrollTrigger: { trigger: grupo, start: "top 85%", once: true },
              },
            );
          });

        // === OVERLINES: micro-slide horizontal ===
        document
          .querySelectorAll<HTMLElement>('[data-anim="overline"]')
          .forEach((el) => {
            gsap.fromTo(
              el,
              { x: -12, autoAlpha: 0 },
              {
                x: 0,
                autoAlpha: 1,
                duration: 0.35,
                ease: "power3.out",
                scrollTrigger: { trigger: el, start: "top 85%", once: true },
              },
            );
          });

        // === SELLOS: el bloque entra y la sombra aparece un frame después ===
        document
          .querySelectorAll<HTMLElement>('[data-anim="sello"]')
          .forEach((el) => {
            const tl = gsap.timeline({
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            });
            tl.set(el, { boxShadow: "none" })
              .fromTo(
                el,
                { y: 24, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" },
              )
              .set(el, { clearProps: "boxShadow" }, "+=0.1");
          });
      });

      limpiar = () => {
        desuscribirLenis();
        ctx.revert(); // mata tweens/triggers propios y restaura estilos inline
      };
    })();

    return () => {
      cancelado = true;
      limpiar?.();
    };
  }, []);

  return null;
}
```

Notas para el implementador:
- `gsap.context()` + `ctx.revert()` es el patrón oficial de cleanup: mata los ScrollTriggers creados adentro y restaura los estilos inline que GSAP tocó. No hace falta `ScrollTrigger.killAll()` (mataría triggers ajenos).
- `fromTo` con `scrollTrigger` tiene `immediateRender: true` por defecto: el estado "from" (oculto) se aplica al montar, DESPUÉS de la hidratación — el HTML estático nunca está oculto.
- `autoAlpha` = opacity + visibility (los elementos ocultos no reciben foco/clicks fantasma).

- [ ] **Step 2: Typecheck + commit**

Run: `npm run typecheck` — Expected: sin errores.

```bash
git add components/layout/AnimacionesPortada.tsx
git commit -m "feat(anim): director de animaciones de portada (GSAP + ScrollTrigger)"
```

---

### Task 3: Marcar el DOM con data-attributes y montar el director

**Files:**
- Modify: `app/(sitio)/page.tsx` (solo la rama de portada editorial, líneas ~281-388)
- Modify: `components/cards/HeroFeature.tsx`
- Modify: `components/layout/NewsletterBand.tsx`
- Modify: `components/layout/SobreAutorBand.tsx`

**Interfaces:**
- Consumes: `<AnimacionesPortada />` y el contrato de data-attributes de Task 2.

- [ ] **Step 1: Marcar `page.tsx`**

En `app/(sitio)/page.tsx`, SOLO en la rama de portada (no en el modo filtrado):

1. Import arriba: `import AnimacionesPortada from "@/components/layout/AnimacionesPortada";`
2. Hero: `<section className="mb-12 lg:mb-16" data-anim="hero">`
3. Bento: `<div className="bento" data-anim="grupo">`
4. Hilera "Más notas": `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8" data-anim="grupo">`
5. Grilla de jugadores: `<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6" data-anim="grupo">`
6. Overline "En la mira · jugadores que seguimos": agregar `data-anim="overline"` al `<p>`.
7. Overline "Lo último": agregar `data-anim="overline"` al `<p>`.
8. Montar el director al final del `<main>`, después de `<NewsletterBand />`: `<AnimacionesPortada />`

NO marcar la lista `UltimasList` como grupo (la spec la deja fuera; su overline sí anima).

- [ ] **Step 2: Marcar `HeroFeature.tsx`**

Dos atributos:
- Al `<div className="flex flex-col p-6 sm:p-10 lg:p-12">` (columna de texto): `data-anim-hero-texto`.
- Al `<Link ... className="relative overflow-hidden group order-first lg:order-none ...">` (contenedor de la imagen): `data-anim-hero-img`.

```tsx
<div className="flex flex-col p-6 sm:p-10 lg:p-12" data-anim-hero-texto>
```

```tsx
<Link
  href={`/nota/${nota.slug}`}
  data-anim-hero-img
  className="relative overflow-hidden group order-first lg:order-none min-h-[300px] lg:min-h-[540px] border-b-2 lg:border-b-0 lg:border-l-2"
```

⚠️ El clip-path va en el `<Link>` contenedor (ya tiene `overflow-hidden`), no en el `<Image fill>`.

- [ ] **Step 3: Marcar las bandas**

`NewsletterBand.tsx` — el `<section id="newsletter">` (que tiene la sombra roja en su `style`) recibe `data-anim="sello"`:

```tsx
<section
  id="newsletter"
  aria-labelledby="newsletter-title"
  data-anim="sello"
  style={{ ... }}
>
```

`SobreAutorBand.tsx` — el atributo va en el `<div className="p-7 sm:p-9 lg:p-10">` interno (es el que tiene `boxShadow: "8px 8px 0 var(--color-river-red)"`), NO en el `<section>`:

```tsx
<div
  className="p-7 sm:p-9 lg:p-10"
  data-anim="sello"
  style={{ ... }}
>
```

- [ ] **Step 4: Verificación completa**

```bash
npm run typecheck   # sin errores
npm test            # suite verde (incluye lib/lenis.test.ts)
npm run build       # build limpio, portada sigue SSG
```

Con el dev server corriendo, verificación en navegador (Chrome DevTools MCP o Playwright) en 375 / 768 / 1440:
1. Cargar `/`: el hero corta de izquierda a derecha, el texto encaja, la sombra 8px aparece al final.
2. Scrollear: bento, "Más notas" y jugadores staggerean UNA vez; overlines se deslizan; NewsletterBand/SobreAutorBand entran y estampan la sombra.
3. Volver a scrollear arriba/abajo: nada re-anima.
4. Emular `prefers-reduced-motion: reduce` y recargar: cero animación, todo visible.
5. `/?tipo=noticia` (modo filtrado): sin animaciones (el director no está montado).
6. Sin JS (Playwright con javaScriptEnabled false o DevTools): todo el contenido visible.
7. Chequear que no haya overflow horizontal nuevo (los `y: 24` no lo causan; el `x: -12` del overline es translate, no layout).

```bash
npx react-doctor    # debe seguir 100/100
```

- [ ] **Step 5: Commit final**

```bash
git add "app/(sitio)/page.tsx" components/cards/HeroFeature.tsx components/layout/NewsletterBand.tsx components/layout/SobreAutorBand.tsx
git commit -m "feat(anim): portada con reveals editoriales secos (hero clip-path + staggers + sellos)"
```
