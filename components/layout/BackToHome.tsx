import Link from "next/link";

/** "← Volver a la portada" — reusado en las páginas internas (nota/jugador/sobre/contacto). */
export default function BackToHome() {
  return (
    <Link
      href="/"
      className="font-mono text-[0.65rem] uppercase tracking-[0.18em] inline-flex items-center gap-2 mb-10"
      style={{ color: "var(--color-neutral-500)" }}
    >
      <span aria-hidden style={{ color: "var(--color-river-red-deep)" }}>
        ←
      </span>
      Volver a la portada
    </Link>
  );
}
