"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { invitarMiembro } from "@/lib/admin/equipo-actions";

export default function InvitarForm() {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<"admin" | "editor">("editor");
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setMensaje(null);
    startTransition(async () => {
      const r = await invitarMiembro(email.trim(), rol);
      if (!r.ok) {
        setMensaje({ tipo: "error", texto: r.error ?? "No se pudo invitar." });
      } else {
        setMensaje({
          tipo: "ok",
          texto: `Listo: le mandamos la invitación a ${email.trim()} con rol ${rol}.`,
        });
        setEmail("");
        router.refresh();
      }
    });
  }

  return (
    <form
      onSubmit={enviar}
      className="brut-frame bg-[var(--color-paper-pure)] px-4 py-4 mb-8"
    >
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 flex-1 min-w-52">
          <span className="brut-label">Email del periodista</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="periodista@ejemplo.com"
            className="admin-input w-full"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="brut-label">Rol</span>
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value as "admin" | "editor")}
            className="admin-input"
          >
            <option value="editor">Editor (carga sus notas)</option>
            <option value="admin">Admin (todo)</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={pendiente}
          className="brut-cta-red px-5 py-2.5 font-sports uppercase tracking-[0.15em] text-sm disabled:opacity-60"
        >
          {pendiente ? "Invitando…" : "Invitar"}
        </button>
      </div>
      {mensaje && (
        <p
          role="alert"
          className={`mt-3 font-body text-sm ${
            mensaje.tipo === "error"
              ? "text-[var(--color-river-red-deep)]"
              : "text-black/70"
          }`}
        >
          {mensaje.texto}
        </p>
      )}
    </form>
  );
}
