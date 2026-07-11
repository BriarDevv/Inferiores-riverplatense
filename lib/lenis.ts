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
