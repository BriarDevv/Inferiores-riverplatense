"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toasts";
import { guardarPartido, quitarPartido } from "@/lib/admin/partido-actions";
import { DIVISIONES, labelDivision } from "@/lib/constants";
import type { ProximoPartido } from "@/lib/types";

interface FormPartidoProps {
  partido: ProximoPartido | null;
  /** false si el partido cargado ya pasó (la barra ya no lo muestra). */
  vigente: boolean;
  /** Fecha para el datetime-local (hora de Buenos Aires); "" si no hay partido. */
  fechaLocal: string;
  /** "vie 10/07 · 12:00" para la vista previa; "" si no hay partido. */
  fechaLabel: string;
}

const labelCls = "brut-label block mb-1.5";

export default function FormPartido({
  partido,
  vigente,
  fechaLocal,
  fechaLabel,
}: FormPartidoProps) {
  const router = useRouter();
  const toast = useToast();

  const [rival, setRival] = useState(partido?.rival ?? "");
  const [division, setDivision] = useState<string>(partido?.division ?? "reserva");
  const [fecha, setFecha] = useState(fechaLocal);
  const [torneo, setTorneo] = useState(partido?.torneo ?? "");
  const [pendiente, setPendiente] = useState(false);
  const [confirmarQuitar, setConfirmarQuitar] = useState(false);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setPendiente(true);
    const res = await guardarPartido({ rival, division, fecha, torneo });
    setPendiente(false);
    if (res.ok) {
      toast({ texto: "Partido cargado. Ya se anuncia en la barra del sitio.", href: "/", hrefLabel: "Ver el sitio" });
      router.refresh();
    } else {
      toast({ texto: res.error ?? "Algo falló.", tipo: "error" });
    }
  };

  const quitar = async () => {
    setPendiente(true);
    const res = await quitarPartido();
    setPendiente(false);
    setConfirmarQuitar(false);
    if (res.ok) {
      setRival("");
      setFecha("");
      setTorneo("");
      toast({ texto: "Listo. La barra vuelve a mostrar la última nota." });
      router.refresh();
    } else {
      toast({ texto: res.error ?? "Algo falló.", tipo: "error" });
    }
  };

  return (
    <div className="brut-frame-shadow bg-[var(--color-paper-pure)]">
      {/* Estado actual */}
      <div className="bg-[var(--color-ink)] text-white px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
        <span className="font-sports uppercase tracking-[0.16em] text-sm">
          {partido ? "Partido cargado" : "Sin partido cargado"}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/60">
          {partido
            ? vigente
              ? `En la barra: vs ${partido.rival} · ${labelDivision(partido.division)} · ${fechaLabel}`
              : "Ya pasó — la barra volvió a la última nota"
            : "La barra muestra la última nota"}
        </span>
      </div>

      <form onSubmit={guardar} className="p-5 sm:p-6 flex flex-col gap-5">
        <div className="grid sm:grid-cols-[1fr_180px] gap-4">
          <div>
            <label htmlFor="rival" className={labelCls}>Rival</label>
            <input
              id="rival"
              value={rival}
              onChange={(e) => setRival(e.target.value)}
              placeholder="ej: Racing"
              required
              className="admin-input w-full font-display text-xl font-bold"
            />
          </div>
          <div>
            <label htmlFor="division" className={labelCls}>División</label>
            <select
              id="division"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="admin-input w-full"
            >
              {DIVISIONES.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fecha" className={labelCls}>Fecha y hora</label>
            <input
              id="fecha"
              type="datetime-local"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              className="admin-input w-full font-mono text-sm"
            />
          </div>
          <div>
            <label htmlFor="torneo" className={labelCls}>Torneo (opcional)</label>
            <input
              id="torneo"
              value={torneo}
              onChange={(e) => setTorneo(e.target.value)}
              placeholder='ej: "Final · Torneo Proyección"'
              className="admin-input w-full"
            />
          </div>
        </div>

        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-black/40">
          Se anuncia como: <span className="text-black/70">Próximo · vs {rival.trim() || "…"} · {labelDivision(division as ProximoPartido["division"])}{fecha ? "" : " · …"}</span>
        </p>

        <div className="flex items-center gap-4 pt-1">
          <button
            type="submit"
            disabled={pendiente}
            className="brut-cta-red px-5 py-3 font-sports uppercase tracking-[0.15em] text-sm disabled:opacity-50"
          >
            {pendiente ? "Guardando…" : partido ? "Actualizar" : "Cargar partido"}
          </button>
          {partido && (
            <button
              type="button"
              disabled={pendiente}
              onClick={() => setConfirmarQuitar(true)}
              className="font-mono text-[11px] uppercase tracking-widest text-black/50 hover:text-[var(--color-river-red-deep)] transition-colors disabled:opacity-50"
            >
              Quitar de la barra
            </button>
          )}
        </div>
      </form>

      <ConfirmDialog
        abierto={confirmarQuitar}
        titulo="¿Quitar el partido?"
        descripcion="La barra roja del sitio deja de anunciarlo y vuelve a mostrar la última nota publicada."
        confirmarLabel="Quitar"
        peligroso
        pendiente={pendiente}
        onConfirmar={quitar}
        onCerrar={() => setConfirmarQuitar(false)}
      />
    </div>
  );
}
