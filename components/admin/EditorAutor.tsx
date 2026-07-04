"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { guardarAutor, borrarAutor } from "@/lib/admin/actions";
import { subirImagen } from "@/lib/admin/upload";
import type { AutorAdmin } from "@/lib/admin/notas-admin";
import ConfirmDialog from "./ConfirmDialog";
import { useToast } from "./Toasts";

interface EditorAutorProps {
  autor: AutorAdmin | null; // null = nueva firma
  esAdmin: boolean;
}

function slugificar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export default function EditorAutor({ autor, esAdmin }: EditorAutorProps) {
  const router = useRouter();
  const toast = useToast();
  const [pendiente, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [confirmaBorrar, setConfirmaBorrar] = useState(false);

  const [nombre, setNombre] = useState(autor?.nombre ?? "");
  const [slug, setSlug] = useState(autor?.slug ?? "");
  const [slugEditado, setSlugEditado] = useState(Boolean(autor));
  const [fotoUrl, setFotoUrl] = useState(autor?.avatar_url ?? "");
  const [bio, setBio] = useState(autor?.bio ?? "");
  const [rolPublico, setRolPublico] = useState(autor?.rol_publico ?? "");
  const [x, setX] = useState(autor?.redes.x ?? "");
  const [instagram, setInstagram] = useState(autor?.redes.instagram ?? "");
  const [youtube, setYoutube] = useState(autor?.redes.youtube ?? "");
  const [email, setEmail] = useState(autor?.email_contacto ?? "");

  const soloLectura = !esAdmin;

  async function elegirFoto(file: File | undefined) {
    if (!file) return;
    setSubiendo(true);
    setError(null);
    try {
      setFotoUrl(await subirImagen(file, "autores"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la foto.");
    } finally {
      setSubiendo(false);
    }
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const r = await guardarAutor({
        id: autor?.id,
        nombre,
        slug,
        foto_url: fotoUrl || undefined,
        bio: bio || undefined,
        rol_publico: rolPublico || undefined,
        redes: {
          x: x.trim() || undefined,
          instagram: instagram.trim() || undefined,
          youtube: youtube.trim() || undefined,
        },
        email_contacto: email || undefined,
      });
      if (!r.ok) setError(r.error ?? "Algo falló al guardar.");
      else {
        toast({
          texto: autor ? `Firma de ${nombre} actualizada.` : `Firma de ${nombre} creada.`,
        });
        router.push("/admin/autores");
        router.refresh();
      }
    });
  }

  function borrar() {
    if (!autor) return;
    startTransition(async () => {
      const r = await borrarAutor(autor.id);
      setConfirmaBorrar(false);
      if (!r.ok) setError(r.error ?? "No se pudo borrar.");
      else {
        toast({ texto: `Firma de ${autor.nombre} borrada.` });
        router.push("/admin/autores");
        router.refresh();
      }
    });
  }

  const labelCls = "brut-label block mb-1.5";

  return (
    <form onSubmit={enviar} className="max-w-2xl">
      {error && (
        <p role="alert" className="mb-4 px-3 py-2 font-body text-sm text-[var(--color-river-red-deep)] bg-[var(--color-river-red-soft)] border-l-[3px] border-[var(--color-river-red)]">
          {error}
        </p>
      )}
      {soloLectura && (
        <p className="mb-4 px-3 py-2 font-body text-sm text-black/60 bg-[var(--color-paper-pure)] border-l-[3px] border-[var(--color-ink)]">
          Las firmas las gestiona el administrador. Podés mirar, no tocar.
        </p>
      )}

      <fieldset disabled={soloLectura || pendiente} className="contents">
        <div className="flex items-start gap-6 mb-6">
          {/* Foto */}
          <div className="shrink-0">
            {fotoUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fotoUrl}
                  alt={`Foto de ${nombre || "la firma"}`}
                  className="w-28 h-28 rounded-full object-cover border-2 border-[var(--color-ink)]"
                />
                {!soloLectura && (
                  <button
                    type="button"
                    onClick={() => setFotoUrl("")}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[var(--color-ink)] text-white font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 hover:bg-[var(--color-river-red)] transition-colors"
                  >
                    Cambiar
                  </button>
                )}
              </div>
            ) : (
              <label className="w-28 h-28 rounded-full border-2 border-dashed border-[var(--color-ink)] flex items-center justify-center text-center cursor-pointer bg-[var(--color-paper-pure)] hover:bg-[var(--color-river-red-soft)] transition-colors">
                <span className="font-mono text-[10px] uppercase tracking-widest px-2">
                  {subiendo ? "Subiendo…" : "Subir foto"}
                </span>
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => elegirFoto(e.target.files?.[0])} />
              </label>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="mb-4">
              <label htmlFor="nombre" className={labelCls}>Nombre</label>
              <input
                id="nombre"
                required
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (!slugEditado) setSlug(slugificar(e.target.value));
                }}
                placeholder="Nombre y apellido"
                className="admin-input w-full font-display text-xl font-bold"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="slug" className={labelCls}>Slug (URL del perfil)</label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-black/40 shrink-0">/autor/</span>
                <input
                  id="slug"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlugEditado(true);
                    setSlug(slugificar(e.target.value));
                  }}
                  className="admin-input flex-1 font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="rolp" className={labelCls}>Cargo visible</label>
              <input id="rolp" value={rolPublico} onChange={(e) => setRolPublico(e.target.value)} placeholder='ej: "Editor" o "Colaborador"' className="admin-input w-full" />
            </div>
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="bio" className={labelCls}>Bio</label>
          <textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Dos o tres líneas sobre quién es y qué cubre" className="admin-input w-full resize-y" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label htmlFor="rx" className={labelCls}>X (usuario)</label>
            <input id="rx" value={x} onChange={(e) => setX(e.target.value)} placeholder="@usuario" className="admin-input w-full font-mono text-sm" />
          </div>
          <div>
            <label htmlFor="rig" className={labelCls}>Instagram (usuario)</label>
            <input id="rig" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@usuario" className="admin-input w-full font-mono text-sm" />
          </div>
          <div>
            <label htmlFor="ryt" className={labelCls}>YouTube (canal)</label>
            <input id="ryt" value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="@canal" className="admin-input w-full font-mono text-sm" />
          </div>
          <div>
            <label htmlFor="remail" className={labelCls}>Email de contacto</label>
            <input id="remail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="opcional" className="admin-input w-full font-mono text-sm" />
          </div>
        </div>

        {!soloLectura && (
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={pendiente || subiendo}
              className="brut-cta-red px-6 py-3 font-sports uppercase tracking-[0.15em] disabled:opacity-60"
            >
              {pendiente ? "Guardando…" : autor ? "Guardar cambios" : "Crear firma"}
            </button>
            <Link href="/admin/autores" className="font-mono text-xs uppercase tracking-widest text-black/50 hover:text-[var(--color-river-red-deep)]">
              Cancelar
            </Link>
            {autor && (
              <button
                type="button"
                onClick={() => setConfirmaBorrar(true)}
                className="ml-auto font-mono text-xs uppercase tracking-widest text-black/40 hover:text-[var(--color-river-red-deep)]"
              >
                Borrar firma
              </button>
            )}
          </div>
        )}
      </fieldset>

      {autor && (
        <ConfirmDialog
          abierto={confirmaBorrar}
          titulo="Borrar firma"
          descripcion={`La firma de ${autor.nombre} deja de existir en el sitio (su perfil público incluido). Si tiene notas, primero hay que reasignarlas.`}
          confirmarLabel="Borrar firma"
          peligroso
          pendiente={pendiente}
          onConfirmar={borrar}
          onCerrar={() => setConfirmaBorrar(false)}
        />
      )}
    </form>
  );
}

