import { formatearDuracion } from "@/lib/constants";

/** Botón de play brutalist (rojo, borde blanco). El padre lleva `group`. */
export function PlayBadge() {
  return (
    <span aria-hidden className="absolute inset-0 flex items-center justify-center">
      <span
        className="flex items-center justify-center transition-transform duration-150 group-hover:scale-110"
        style={{
          width: 64,
          height: 64,
          background: "var(--color-river-red)",
          border: "2px solid var(--color-paper-pure)",
          color: "var(--color-paper-pure)",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </span>
  );
}

/** Duración estampada abajo a la derecha (ink + bordes blancos). */
export function DuracionBadge({ seg }: { seg: number }) {
  return (
    <span
      className="absolute bottom-0 right-0 px-2 py-1 font-mono text-[0.65rem] tabular-nums"
      style={{
        background: "var(--color-ink)",
        color: "var(--color-paper-pure)",
        borderLeft: "2px solid var(--color-paper-pure)",
        borderTop: "2px solid var(--color-paper-pure)",
      }}
    >
      {formatearDuracion(seg)}
    </span>
  );
}
