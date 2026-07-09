import Link from "next/link";
import { REDES } from "@/components/layout/SocialRail";

/**
 * Redes del medio al pie de cada nota. El rail fijo (SocialRail) solo aparece
 * en monitores muy anchos para no tapar contenido; acá las redes quedan
 * siempre a mano, en el remate natural de la lectura.
 */
export default function RedesNota() {
  return (
    <div
      className="mt-8 pt-6 flex items-center gap-3 flex-wrap"
      style={{ borderTop: "1px solid var(--color-neutral-200)" }}
    >
      <span
        className="font-mono text-[0.62rem] uppercase tracking-[0.16em]"
        style={{ color: "var(--color-neutral-500)" }}
      >
        Seguí la cobertura
      </span>
      {REDES.map((r) => (
        <Link
          key={r.label}
          href={r.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Seguir en ${r.label}`}
          className="share-btn"
        >
          {r.icon}
        </Link>
      ))}
    </div>
  );
}
