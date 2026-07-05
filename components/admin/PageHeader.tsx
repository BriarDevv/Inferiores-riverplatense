interface PageHeaderProps {
  overline: string;
  titulo: string;
  descripcion?: React.ReactNode;
  /** Acción primaria (botón/link), alineada a la derecha sobre la misma línea base. */
  children?: React.ReactNode;
}

/** Header estándar de las pantallas del panel: overline + título + acción + regla. */
export default function PageHeader({ overline, titulo, descripcion, children }: PageHeaderProps) {
  return (
    <header className="mb-8 pb-5 border-b-2 border-[var(--color-ink)]">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <p className="overline mb-1">{overline}</p>
          <h1 className="font-display text-3xl md:text-[2.6rem] font-bold leading-none tracking-tight">
            {titulo}
          </h1>
        </div>
        {children && <div className="shrink-0">{children}</div>}
      </div>
      {descripcion && (
        <p className="font-body text-sm text-black/55 mt-3 max-w-xl">{descripcion}</p>
      )}
    </header>
  );
}
