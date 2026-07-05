interface Fila {
  label: string;
  valor: number;
}

interface FilasBarraProps {
  filas: Fila[];
  /** Texto cuando no hay datos todavía. */
  vacio: string;
  /** Muestra el % de participación de cada fila sobre el total. */
  conPorcentaje?: boolean;
}

/** Filas label + barra horizontal + valor. El lenguaje común de los mini-módulos. */
export default function FilasBarra({ filas, vacio, conPorcentaje }: FilasBarraProps) {
  const conDatos = filas.filter((f) => f.valor > 0);
  if (conDatos.length === 0) {
    return <p className="px-4 py-5 font-body text-sm text-black/45">{vacio}</p>;
  }
  const max = Math.max(1, ...conDatos.map((f) => f.valor));
  const total = conDatos.reduce((acc, f) => acc + f.valor, 0);
  return (
    <ul className="px-4 py-3.5 flex flex-col gap-2.5">
      {conDatos.map((f) => (
        <li key={f.label}>
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <span className="font-body text-[13px] font-medium truncate">{f.label}</span>
            <span className="font-mono text-xs tabular-nums text-[var(--color-river-red-deep)] shrink-0">
              {f.valor}
              {conPorcentaje && (
                <span className="text-black/40"> · {Math.round((f.valor / total) * 100)}%</span>
              )}
            </span>
          </div>
          <div className="h-1.5 bg-black/8" aria-hidden>
            <div
              className="h-full bg-[var(--color-river-red)]"
              style={{ width: `${Math.max(4, Math.round((f.valor / max) * 100))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
