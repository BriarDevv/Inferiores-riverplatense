interface DeltaProps {
  /** Variación porcentual; null = sin base de comparación (no se muestra nada). */
  pct: number | null;
  /** Contra qué se compara (para lectores de pantalla). */
  contexto?: string;
}

/** Variación vs el período anterior, estilo scoreboard: ▲ verde, ▼ rojo, = gris. */
export default function Delta({ pct, contexto = "respecto de los 7 días anteriores" }: DeltaProps) {
  if (pct === null) return null;
  const sube = pct > 0;
  const baja = pct < 0;
  const color = sube
    ? "text-[#4ade80]" // verde legible sobre ink
    : baja
      ? "text-[var(--color-river-red)]"
      : "text-white/40";
  return (
    <span className={`font-sports text-sm tracking-wide ${color}`}>
      <span aria-hidden>{sube ? "▲" : baja ? "▼" : "="}</span>
      <span className="sr-only">{sube ? "subió" : baja ? "bajó" : "sin cambios"}</span>{" "}
      {Math.abs(pct)}%
      <span className="sr-only"> {contexto}</span>
    </span>
  );
}
