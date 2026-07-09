interface Punto {
  label: string;
  valor: number;
}

interface GraficoBarrasProps {
  serie: Punto[];
  /** Alto del área de barras en px. */
  alto?: number;
  /** "oscuro" = sobre fondo ink (barras blancas, pico rojo). */
  tono?: "oscuro" | "claro";
  /** Etiquetas bajo la primera y la última barra. */
  ejeIzq?: string;
  ejeDer?: string;
  /** Índices pintados en rojo además del pico (ej: la franja horaria pico). */
  resaltados?: number[];
  ariaLabel: string;
}

/**
 * Barras SVG brutalist: rectas, sin curvas ni gradientes. La barra máxima va
 * en rojo River. Sin dependencias.
 */
export default function GraficoBarras({
  serie,
  alto = 96,
  tono = "oscuro",
  ejeIzq,
  ejeDer,
  resaltados,
  ariaLabel,
}: GraficoBarrasProps) {
  const max = Math.max(1, ...serie.map((p) => p.valor));
  const n = serie.length;
  const gap = 3;
  const anchoBarra = 14;
  const ancho = n * anchoBarra + (n - 1) * gap;
  const base = tono === "oscuro" ? "rgba(255,255,255,0.35)" : "rgba(10,10,10,0.8)";
  const piso = tono === "oscuro" ? "rgba(255,255,255,0.14)" : "rgba(10,10,10,0.14)";
  const resaltadosSet = new Set(resaltados ?? []);

  return (
    <div>
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${ancho} ${alto}`}
        preserveAspectRatio="none"
        className="w-full block"
        style={{ height: alto }}
      >
        {serie.map((p, i) => {
          const h = p.valor === 0 ? 2 : Math.max(3, Math.round((p.valor / max) * (alto - 4)));
          const esPico =
            (p.valor === max && p.valor > 0) || (resaltadosSet.has(i) && p.valor > 0);
          return (
            <rect
              key={i}
              x={i * (anchoBarra + gap)}
              y={alto - h}
              width={anchoBarra}
              height={h}
              fill={esPico ? "var(--color-river-red)" : p.valor === 0 ? piso : base}
            >
              <title>{`${p.label}: ${p.valor}`}</title>
            </rect>
          );
        })}
      </svg>
      {(ejeIzq || ejeDer) && (
        <div
          className={`flex justify-between mt-1.5 font-mono text-[9px] uppercase tracking-[0.14em] ${
            tono === "oscuro" ? "text-white/40" : "text-black/40"
          }`}
        >
          <span>{ejeIzq}</span>
          <span>{ejeDer}</span>
        </div>
      )}
    </div>
  );
}
