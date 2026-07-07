interface DatosFirma {
  avatar_url?: string;
  rol_publico?: string;
  bio?: string;
  redes: { x?: string; instagram?: string; youtube?: string };
}

/** Qué le falta al perfil público de la firma (cada hueco es SEO desperdiciado). */
function itemsPerfil(a: DatosFirma): Array<{ label: string; ok: boolean }> {
  return [
    { label: "foto", ok: Boolean(a.avatar_url) },
    { label: "cargo", ok: Boolean(a.rol_publico?.trim()) },
    { label: "bio", ok: Boolean(a.bio?.trim()) },
    { label: "redes", ok: Boolean(a.redes.x || a.redes.instagram || a.redes.youtube) },
  ];
}

/** Barra de 4 segmentos + "Perfil 3/4". Verde tinta cuando está completo. */
export default function PerfilCompleto({ autor }: { autor: DatosFirma }) {
  const items = itemsPerfil(autor);
  const faltan: string[] = [];
  for (const i of items) if (!i.ok) faltan.push(i.label);
  const completos = items.length - faltan.length;
  const completo = faltan.length === 0;

  return (
    <div
      title={completo ? "Perfil público completo" : `Falta: ${faltan.join(", ")}`}
      className="inline-flex items-center gap-2.5"
    >
      <span aria-hidden className="flex gap-1">
        {items.map((i) => (
          <span
            key={i.label}
            className={`w-5 h-1.5 ${i.ok ? "bg-[var(--color-river-red)]" : "bg-black/10"}`}
          />
        ))}
      </span>
      <span
        className={`font-mono text-[10px] uppercase tracking-[0.14em] ${
          completo ? "text-[var(--estado-publicada)]" : "text-black/45"
        }`}
      >
        {completo ? "Perfil completo" : `Perfil ${completos}/${items.length}`}
      </span>
      <span className="sr-only">{completo ? "" : `Falta: ${faltan.join(", ")}`}</span>
    </div>
  );
}
