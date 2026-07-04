"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { JSONContent } from "@tiptap/react";
import TiptapEditor from "./TiptapEditor";
import { guardarNota, type ModoPublicacion } from "@/lib/admin/actions";
import { subirImagen } from "@/lib/admin/upload";
import { DIVISIONES, TIPOS_NOTA } from "@/lib/constants";
import type { AutorAdmin, NotaAdmin } from "@/lib/admin/notas-admin";
import type { Sujeto } from "@/lib/types";

interface EditorNotaProps {
  nota: NotaAdmin | null; // null = nueva
  autores: AutorAdmin[];
  sujetos: Sujeto[];
}

const FORMATOS = [
  { value: "articulo", label: "Artículo" },
  { value: "youtube", label: "Video de YouTube" },
  { value: "short", label: "Video corto (vertical)" },
];

const FUENTES = [
  { value: "propio", label: "Propio" },
  { value: "youtube", label: "YouTube" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
];

function slugificar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

/** ISO → valor para <input type="datetime-local"> en hora local. */
function isoALocal(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditorNota({ nota, autores, sujetos }: EditorNotaProps) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [subiendoPoster, setSubiendoPoster] = useState(false);

  const [titulo, setTitulo] = useState(nota?.titulo ?? "");
  const [bajada, setBajada] = useState(nota?.bajada ?? "");
  const [slug, setSlug] = useState(nota?.slug ?? "");
  const slugEditado = useRef(Boolean(nota));
  const [tipo, setTipo] = useState<string>(nota?.tipo ?? "noticia");
  const [division, setDivision] = useState<string>(nota?.division ?? "primera");
  const [formato, setFormato] = useState<string>(nota?.formato ?? "articulo");
  const [fuente, setFuente] = useState<string>(nota?.fuente ?? "propio");
  const [autorId, setAutorId] = useState(nota?.autor.id ?? autores[0]?.id ?? "");
  const [posterUrl, setPosterUrl] = useState(nota?.poster_url ?? "");
  const [youtubeId, setYoutubeId] = useState(nota?.youtube_id ?? "");
  const [videoUrl, setVideoUrl] = useState(nota?.video_url ?? "");
  const [tags, setTags] = useState(nota?.tags.join(", ") ?? "");
  const [sujetosSel, setSujetosSel] = useState<Set<string>>(
    new Set(nota?.sujetos.map((s) => s.id) ?? []),
  );
  const [primicia, setPrimicia] = useState(nota?.primicia ?? false);
  const [destacada, setDestacada] = useState(nota?.destacada ?? false);
  const [modo, setModo] = useState<ModoPublicacion>(
    nota?.estado === "publicada" ? "ahora" : nota?.estado === "programada" ? "programada" : "borrador",
  );
  const [programadaPara, setProgramadaPara] = useState(
    nota?.estado === "programada" ? isoALocal(nota.publicada_en) : "",
  );
  const cuerpoRef = useRef<JSONContent | null>((nota?.cuerpo as JSONContent | null) ?? null);

  const cuerpoInicial = useMemo(() => (nota?.cuerpo as JSONContent | null) ?? null, [nota]);

  function cambiarTitulo(v: string) {
    setTitulo(v);
    if (!slugEditado.current) setSlug(slugificar(v));
  }

  async function elegirPoster(file: File | undefined) {
    if (!file) return;
    setSubiendoPoster(true);
    setError(null);
    try {
      setPosterUrl(await subirImagen(file, "posters"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setSubiendoPoster(false);
    }
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const r = await guardarNota({
        id: nota?.id,
        titulo,
        bajada,
        slug,
        tipo,
        division,
        formato,
        fuente,
        poster_url: posterUrl,
        youtube_id: youtubeId || undefined,
        video_url: videoUrl || undefined,
        autor_id: autorId,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        sujetos: [...sujetosSel],
        cuerpo: cuerpoRef.current,
        primicia,
        destacada,
        modo,
        programada_para: programadaPara ? new Date(programadaPara).toISOString() : undefined,
      });
      if (!r.ok) {
        setError(r.error ?? "Algo falló al guardar.");
        window.scrollTo({ top: 0 });
      } else {
        router.push("/admin/notas");
        router.refresh();
      }
    });
  }

  const labelCls = "brut-label block mb-1.5";
  const grupo = "mb-5";

  return (
    <form onSubmit={enviar} className="grid gap-8 lg:grid-cols-[1fr_320px] items-start">
      {/* Columna principal */}
      <div className="min-w-0">
        {error && (
          <p role="alert" className="mb-4 px-3 py-2 font-body text-sm text-[var(--color-river-red-deep)] bg-[var(--color-river-red-soft)] border-l-[3px] border-[var(--color-river-red)]">
            {error}
          </p>
        )}

        <div className={grupo}>
          <label htmlFor="titulo" className={labelCls}>Título</label>
          <input
            id="titulo"
            required
            value={titulo}
            onChange={(e) => cambiarTitulo(e.target.value)}
            placeholder="El título que va a ver el lector"
            className="admin-input w-full font-display text-2xl font-bold"
          />
        </div>

        <div className={grupo}>
          <label htmlFor="bajada" className={labelCls}>Bajada</label>
          <textarea
            id="bajada"
            required
            rows={2}
            value={bajada}
            onChange={(e) => setBajada(e.target.value)}
            placeholder="Una o dos líneas que resumen la nota (aparece bajo el título y en Google)"
            className="admin-input w-full font-body resize-y"
          />
        </div>

        <div className={grupo}>
          <label htmlFor="slug" className={labelCls}>Slug (URL)</label>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-black/40 shrink-0">/nota/</span>
            <input
              id="slug"
              required
              value={slug}
              onChange={(e) => {
                slugEditado.current = true;
                setSlug(slugificar(e.target.value));
              }}
              className="admin-input flex-1 font-mono text-sm"
            />
          </div>
        </div>

        <div className={grupo}>
          <span className={labelCls}>Cuerpo de la nota</span>
          <TiptapEditor
            contenidoInicial={cuerpoInicial}
            onChange={(json) => (cuerpoRef.current = json)}
          />
        </div>
      </div>

      {/* Sidebar de metadata */}
      <aside className="brut-frame-shadow bg-[var(--color-paper-pure)] p-5 lg:sticky lg:top-6">
        <h2 className="brut-label mb-4">Publicación</h2>

        <div className="flex flex-col gap-2 mb-5">
          {([
            { v: "borrador", label: "Guardar como borrador" },
            { v: "ahora", label: nota?.estado === "publicada" ? "Mantener publicada" : "Publicar ahora" },
            { v: "programada", label: "Programar fecha" },
          ] as Array<{ v: ModoPublicacion; label: string }>).map((o) => (
            <label key={o.v} className="flex items-center gap-2 font-body text-sm cursor-pointer">
              <input
                type="radio"
                name="modo"
                checked={modo === o.v}
                onChange={() => setModo(o.v)}
                className="accent-[var(--color-river-red)]"
              />
              {o.label}
            </label>
          ))}
          {modo === "programada" && (
            <input
              type="datetime-local"
              required
              value={programadaPara}
              onChange={(e) => setProgramadaPara(e.target.value)}
              className="admin-input w-full font-mono text-sm mt-1"
            />
          )}
        </div>

        <hr className="hairline my-4" />

        <div className={grupo}>
          <label htmlFor="autor" className={labelCls}>Firma</label>
          <select id="autor" value={autorId} onChange={(e) => setAutorId(e.target.value)} className="admin-input w-full">
            {autores.map((a) => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={grupo}>
            <label htmlFor="tipo" className={labelCls}>Tipo</label>
            <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} className="admin-input w-full">
              {TIPOS_NOTA.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className={grupo}>
            <label htmlFor="division" className={labelCls}>División</label>
            <select id="division" value={division} onChange={(e) => setDivision(e.target.value)} className="admin-input w-full">
              {DIVISIONES.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={grupo}>
            <label htmlFor="formato" className={labelCls}>Formato</label>
            <select id="formato" value={formato} onChange={(e) => setFormato(e.target.value)} className="admin-input w-full">
              {FORMATOS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div className={grupo}>
            <label htmlFor="fuente" className={labelCls}>Fuente</label>
            <select id="fuente" value={fuente} onChange={(e) => setFuente(e.target.value)} className="admin-input w-full">
              {FUENTES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        {formato === "youtube" && (
          <div className={grupo}>
            <label htmlFor="ytid" className={labelCls}>ID de YouTube</label>
            <input id="ytid" value={youtubeId} onChange={(e) => setYoutubeId(e.target.value)} placeholder="ej: dQw4w9WgXcQ" className="admin-input w-full font-mono text-sm" />
          </div>
        )}
        {formato === "short" && (
          <div className={grupo}>
            <label htmlFor="videourl" className={labelCls}>URL del video</label>
            <input id="videourl" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Link al video vertical" className="admin-input w-full font-mono text-sm" />
          </div>
        )}

        <div className={grupo}>
          <span className={labelCls}>Imagen principal</span>
          {posterUrl ? (
            <div className="relative mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={posterUrl} alt="Vista previa de la imagen principal" className="w-full aspect-video object-cover brut-frame" />
              <button
                type="button"
                onClick={() => setPosterUrl("")}
                className="absolute top-2 right-2 bg-[var(--color-ink)] text-white font-mono text-[10px] uppercase tracking-widest px-2 py-1 hover:bg-[var(--color-river-red)] transition-colors"
              >
                Cambiar
              </button>
            </div>
          ) : (
            <label className="brut-frame flex flex-col items-center justify-center gap-1 aspect-video cursor-pointer bg-[var(--color-paper)] hover:bg-[var(--color-river-red-soft)] transition-colors">
              <span className="font-sports uppercase tracking-widest text-sm">
                {subiendoPoster ? "Subiendo…" : "Subir imagen"}
              </span>
              <span className="font-mono text-[10px] text-black/40">JPG, PNG o WebP · máx 5 MB</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => elegirPoster(e.target.files?.[0])}
              />
            </label>
          )}
        </div>

        <div className={grupo}>
          <label htmlFor="tags" className={labelCls}>Tags (separados por coma)</label>
          <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="traspasos, seleccion, lesiones" className="admin-input w-full font-mono text-sm" />
        </div>

        <div className={grupo}>
          <span className={labelCls}>Protagonistas</span>
          <div className="max-h-40 overflow-y-auto brut-frame p-2 flex flex-col gap-1">
            {sujetos.map((s) => (
              <label key={s.id} className="flex items-center gap-2 font-body text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={sujetosSel.has(s.id)}
                  onChange={(e) => {
                    const next = new Set(sujetosSel);
                    if (e.target.checked) next.add(s.id);
                    else next.delete(s.id);
                    setSujetosSel(next);
                  }}
                  className="accent-[var(--color-river-red)]"
                />
                {s.nombre}
                <span className="font-mono text-[10px] text-black/40 uppercase">{s.tipo}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <label className="flex items-center gap-2 font-body text-sm cursor-pointer">
            <input type="checkbox" checked={primicia} onChange={(e) => setPrimicia(e.target.checked)} className="accent-[var(--color-river-red)]" />
            Primicia (&ldquo;Lo contamos primero&rdquo;)
          </label>
          <label className="flex items-center gap-2 font-body text-sm cursor-pointer">
            <input type="checkbox" checked={destacada} onChange={(e) => setDestacada(e.target.checked)} className="accent-[var(--color-river-red)]" />
            Destacada (hero de la portada)
          </label>
        </div>

        <button
          type="submit"
          disabled={pendiente || subiendoPoster}
          className="brut-cta-red w-full py-3 font-sports uppercase tracking-[0.15em] disabled:opacity-60"
        >
          {pendiente
            ? "Guardando…"
            : modo === "borrador"
              ? "Guardar borrador"
              : modo === "programada"
                ? "Programar nota"
                : nota?.estado === "publicada"
                  ? "Guardar cambios"
                  : "Publicar nota"}
        </button>
        <Link
          href="/admin/notas"
          className="block text-center mt-3 font-mono text-xs uppercase tracking-widest text-black/50 hover:text-[var(--color-river-red-deep)]"
        >
          Cancelar
        </Link>
      </aside>
    </form>
  );
}
