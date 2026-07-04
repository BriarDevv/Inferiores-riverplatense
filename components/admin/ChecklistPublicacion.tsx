"use client";

export interface ItemChecklist {
  label: string;
  ok: boolean;
  obligatorio: boolean;
}

/**
 * Checklist de publicación en vivo: los obligatorios bloquean "Publicar",
 * los recomendados solo avisan. La garantía de calidad antes de salir al sitio.
 */
export default function ChecklistPublicacion({ items }: { items: ItemChecklist[] }) {
  return (
    <ul className="flex flex-col gap-1.5 mb-5">
      {items.map((item) => {
        const icono = item.ok ? "✓" : item.obligatorio ? "✕" : "○";
        const color = item.ok
          ? "text-[var(--estado-publicada)]"
          : item.obligatorio
            ? "text-[var(--color-river-red-deep)]"
            : "text-[var(--estado-pendiente)]";
        return (
          <li key={item.label} className="flex items-baseline gap-2 font-mono text-[11px] uppercase tracking-wider">
            <span aria-hidden className={`w-3 shrink-0 font-bold ${color}`}>{icono}</span>
            <span className={item.ok ? "text-black/45 line-through decoration-black/25" : "text-black/70"}>
              {item.label}
              {!item.ok && !item.obligatorio && (
                <span className="text-black/35 normal-case tracking-normal"> (recomendado)</span>
              )}
            </span>
            <span className="sr-only">{item.ok ? "— listo" : item.obligatorio ? "— falta" : "— recomendado"}</span>
          </li>
        );
      })}
    </ul>
  );
}
