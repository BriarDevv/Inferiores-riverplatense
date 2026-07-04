import type { EstadoNota } from "@/lib/types";

export type TipoSello = EstadoNota | "activo" | "pendiente" | "sin-acceso" | "primicia";

const SELLOS: Record<TipoSello, { label: string; clase: string }> = {
  publicada: { label: "Publicada", clase: "sello-publicada" },
  programada: { label: "Programada", clase: "sello-programada" },
  borrador: { label: "Borrador", clase: "sello-borrador" },
  activo: { label: "Activo", clase: "sello-publicada" },
  pendiente: { label: "Invitación pendiente", clase: "sello-pendiente" },
  "sin-acceso": { label: "Sin acceso", clase: "sello-borrador" },
  primicia: { label: "Primicia", clase: "sello-primicia" },
};

interface SelloEstadoProps {
  tipo: TipoSello;
  /** Dato extra tras el label, ej. la fecha de una programada ("sáb 6 · 18:00"). */
  detalle?: string;
}

/** Sello de goma de la redacción: estado siempre con texto, nunca solo color. */
export default function SelloEstado({ tipo, detalle }: SelloEstadoProps) {
  const s = SELLOS[tipo];
  return (
    <span className={`sello ${s.clase}`}>
      {s.label}
      {detalle && <span className="font-normal opacity-80">· {detalle}</span>}
    </span>
  );
}
