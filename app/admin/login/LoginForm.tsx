"use client";

import { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

const ERRORES: Record<string, string> = {
  "sin-acceso": "Tu email no tiene acceso al panel. Pedile al administrador que te invite.",
  "link-invalido": "El link expiró o no es válido. Pedí uno nuevo.",
};

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "enviado" | "error">("idle");
  const errorParam = useSearchParams().get("error");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // Solo usuarios ya invitados: nunca crear cuentas desde el login.
        shouldCreateUser: false,
      },
    });
    setEstado(error ? "error" : "enviado");
  }

  return (
    <div className="w-full max-w-md brut-frame-shadow bg-[var(--color-paper-pure)]">
      {/* Cabecera tipo masthead: la credencial de la redacción */}
      <header className="bg-[var(--color-ink)] text-white px-6 py-5 border-b-4 border-[var(--color-river-red)]">
        <div className="flex items-center gap-4">
          <Image
            src="/logo.webp"
            alt=""
            width={44}
            height={44}
            className="rounded-full shrink-0"
          />
          <p className="font-display text-xl font-bold leading-tight">
            Inferiores <em className="text-[var(--color-river-red)]">Riverplatense</em>
          </p>
        </div>
      </header>

      <form onSubmit={enviar} className="px-6 py-7">
        {errorParam && (
          <p
            role="alert"
            className="mb-4 px-3 py-2 text-sm font-body text-[var(--color-river-red-deep)] bg-[var(--color-river-red-soft)] border-l-[3px] border-[var(--color-river-red)]"
          >
            {ERRORES[errorParam] ?? "Error al ingresar."}
          </p>
        )}

        {estado === "enviado" ? (
          <p aria-live="polite" className="font-body py-2">
            <strong>Listo.</strong> Revisá tu correo: te mandamos el link para entrar.
            Podés cerrar esta pestaña.
          </p>
        ) : (
          <>
            <label htmlFor="email" className="brut-label block mb-2">
              Tu email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="brut-frame w-full px-3 py-2.5 mb-5 font-body bg-transparent outline-none focus-visible:border-[var(--color-river-red)]"
              placeholder="vos@ejemplo.com"
            />
            <button
              type="submit"
              disabled={estado === "enviando"}
              className="brut-cta-red w-full py-3 font-sports uppercase tracking-[0.15em] disabled:opacity-60"
            >
              {estado === "enviando" ? "Enviando…" : "Mandame el link"}
            </button>
            {estado === "error" && (
              <p
                role="alert"
                className="mt-3 text-sm font-body text-[var(--color-river-red-deep)]"
              >
                No pudimos enviar el link. Probá de nuevo en unos segundos.
              </p>
            )}
          </>
        )}
      </form>
    </div>
  );
}
