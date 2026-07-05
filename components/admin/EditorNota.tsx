"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import TiptapEditor from "./TiptapEditor";
import BarraEditor, { type EstadoGuardado } from "./BarraEditor";
import ChecklistPublicacion, { type ItemChecklist } from "./ChecklistPublicacion";
import PreviewCardNota from "./PreviewCardNota";
import PreviewNota from "./PreviewNota";
import ConfirmDialog from "./ConfirmDialog";
import { useToast } from "./Toasts";
import { guardarNota, type GuardarNotaInput, type ModoPublicacion } from "@/lib/admin/actions";
import { subirImagen } from "@/lib/admin/upload";
import { DIVISIONES, TIPOS_NOTA } from "@/lib/constants";
import type { AutorAdmin, NotaAdmin } from "@/lib/admin/notas-admin";
import type { EstadoNota, Sujeto } from "@/lib/types";

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

const AUTOSAVE_MS = 30_000;
const PALABRAS_POR_MINUTO = 200;
const MIN_PALABRAS_ARTICULO = 50;
const BAJADA_RECOMENDADA = 80;

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

function contarPalabras(nodo: JSONContent | null): number {
  if (!nodo) return 0;
  let total = 0;
  const visitar = (x: JSONContent) => {
    if (x.text) total += x.text.split(/\s+/).filter(Boolean).length;
    x.content?.forEach(visitar);
  };
  visitar(nodo);
  return total;
}

export default function EditorNota({ nota, autores, sujetos }: EditorNotaProps) {
  const router = useRouter();
  const toast = useToast();
  const [pendiente, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [subiendoPoster, setSubiendoPoster] = useState(false);

  const [notaId, setNotaId] = useState(nota?.id);
  const [estadoActual, setEstadoActual] = useState<EstadoNota>(nota?.estado ?? "borrador");
  const [guardado, setGuardado] = useState<EstadoGuardado>("inicial");
  const [ultimoGuardado, setUltimoGuardado] = useState<Date | null>(null);
  const [confirmaSalir, setConfirmaSalir] = useState(false);
  const [previewAbierto, setPreviewAbierto] = useState(false);
  const [tab, setTab] = useState<"ficha" | "preview">("ficha");

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
  const cuerpoHtmlRef = useRef<string>("");
  const [palabras, setPalabras] = useState(() => contarPalabras(cuerpoRef.current));

  const cuerpoInicial = useMemo(() => (nota?.cuerpo as JSONContent | null) ?? null, [nota]);
  // Notas viejas: el texto vive en `contenido` (legacy) y el sitio lo muestra igual.
  const palabrasLegacy = useMemo(
    () => (nota?.contenido ?? "").split(/\s+/).filter(Boolean).length,
    [nota],
  );

  const sucio = guardado === "sucio";

  function marcar() {
    setGuardado("sucio");
  }

  function cambiarTitulo(v: string) {
    setTitulo(v);
    if (!slugEditado.current) setSlug(slugificar(v));
    marcar();
  }

  async function elegirPoster(file: File | undefined) {
    if (!file) return;
    setSubiendoPoster(true);
    setError(null);
    try {
      setPosterUrl(await subirImagen(file, "posters"));
      marcar();
      toast({ texto: "Imagen subida." });
    } catch (err) {
      toast({
        tipo: "error",
        texto: err instanceof Error ? err.message : "No se pudo subir la imagen.",
      });
    } finally {
      setSubiendoPoster(false);
    }
  }

  function armarPayload(modoElegido: ModoPublicacion, silencioso = false): GuardarNotaInput {
    return {
      id: notaId,
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
      modo: modoElegido,
      programada_para: programadaPara ? new Date(programadaPara).toISOString() : undefined,
      silencioso,
    };
  }

  /* --- Autosave: cada 30s, solo borradores, sin tocar el sitio público. --- */
  const autoguardarRef = useRef<() => void>(() => {});
  autoguardarRef.current = () => {
    if (!sucio || pendiente || subiendoPoster) return;
    if (modo !== "borrador") return; // nunca auto-publica
    if (!titulo.trim() || !slug || !autorId) return; // mínimo para persistir
    setGuardado("guardando");
    void guardarNota(armarPayload("borrador", true)).then((r) => {
      if (r.ok) {
        if (r.id) setNotaId(r.id);
        setGuardado("guardado");
        setUltimoGuardado(new Date());
      } else {
        // Sin drama: el trabajo sigue en pantalla; se reintenta en el próximo ciclo.
        setGuardado("sucio");
      }
    });
  };

  useEffect(() => {
    const timer = setInterval(() => autoguardarRef.current(), AUTOSAVE_MS);
    return () => clearInterval(timer);
  }, []);

  /* --- Aviso al cerrar la pestaña con cambios sin guardar. --- */
  const sucioRef = useRef(false);
  sucioRef.current = sucio;
  useEffect(() => {
    function avisar(e: BeforeUnloadEvent) {
      if (sucioRef.current) e.preventDefault();
    }
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, []);

  function salir() {
    if (sucioRef.current) setConfirmaSalir(true);
    else router.push("/admin/notas");
  }

  /* --- Checklist de publicación --- */
  const checklist: ItemChecklist[] = [
    { label: "Título", ok: titulo.trim().length > 0, obligatorio: true },
    { label: "Bajada", ok: bajada.trim().length > 0, obligatorio: true },
    {
      label: `Bajada de ${BAJADA_RECOMENDADA}+ caracteres`,
      ok: bajada.trim().length >= BAJADA_RECOMENDADA,
      obligatorio: false,
    },
    { label: "Imagen principal", ok: posterUrl.trim().length > 0, obligatorio: true },
    ...(formato === "articulo"
      ? [{
          label: `Cuerpo (${MIN_PALABRAS_ARTICULO}+ palabras)`,
          ok:
            palabras >= MIN_PALABRAS_ARTICULO ||
            (palabras === 0 && palabrasLegacy >= MIN_PALABRAS_ARTICULO),
          obligatorio: true,
        }]
      : []),
    ...(formato === "youtube"
      ? [{ label: "ID de YouTube", ok: youtubeId.trim().length > 0, obligatorio: true }]
      : []),
    ...(formato === "short"
      ? [{ label: "URL del video", ok: videoUrl.trim().length > 0, obligatorio: true }]
      : []),
    { label: "Al menos un protagonista", ok: sujetosSel.size > 0, obligatorio: false },
    { label: "Tags", ok: tags.trim().length > 0, obligatorio: false },
  ];
  const faltantes = checklist.filter((i) => i.obligatorio && !i.ok);
  const faltaFecha = modo === "programada" && !programadaPara;
  const bloqueado = modo !== "borrador" && (faltantes.length > 0 || faltaFecha);
  const motivoBloqueo = bloqueado
    ? faltantes.length > 0
      ? `Para publicar falta: ${faltantes.map((f) => f.label.toLowerCase()).join(", ")}.`
      : "Elegí fecha y hora de publicación."
    : undefined;

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (bloqueado) return;
    setError(null);
    const eraNueva = !notaId;
    const estabaPublicada = estadoActual === "publicada";
    setGuardado("guardando");
    startTransition(async () => {
      const r = await guardarNota(armarPayload(modo));
      if (!r.ok) {
        setError(r.error ?? "Algo falló al guardar. Tus cambios siguen acá; probá de nuevo.");
        setGuardado("sucio");
        window.scrollTo({ top: 0 });
        return;
      }
      if (r.id) setNotaId(r.id);
      setGuardado("guardado");
      setUltimoGuardado(new Date());
      const nuevoEstado: EstadoNota =
        modo === "borrador" ? "borrador" : modo === "programada" ? "programada" : "publicada";
      setEstadoActual(nuevoEstado);

      if (modo === "borrador") {
        toast({ texto: "Borrador guardado." });
      } else if (modo === "programada") {
        const cuando = new Date(programadaPara).toLocaleString("es-AR", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });
        toast({ texto: `Programada para el ${cuando}.` });
      } else {
        toast({
          texto: estabaPublicada ? "Cambios guardados." : "Publicada.",
          href: `/nota/${slug}`,
          hrefLabel: "Ver en el sitio",
        });
      }

      if (eraNueva && r.id) router.replace(`/admin/notas/${r.id}`);
      else router.refresh();
    });
  }

  const labelCls = "brut-label block mb-1.5";
  const grupo = "mb-5";
  const autorSel = autores.find((a) => a.id === autorId);

  const submitLabel = pendiente
    ? "Guardando…"
    : modo === "borrador"
      ? "Guardar borrador"
      : modo === "programada"
        ? "Programar"
        : estadoActual === "publicada"
          ? "Guardar cambios"
          : "Publicar";

  return (
    <form onSubmit={enviar}>
      <BarraEditor
        estadoNota={estadoActual}
        guardado={guardado}
        ultimoGuardado={ultimoGuardado}
        esNueva={!notaId}
        submitLabel={submitLabel}
        submitDeshabilitado={pendiente || subiendoPoster || bloqueado}
        motivoBloqueo={motivoBloqueo}
        onSalir={salir}
        onVistaPrevia={() => setPreviewAbierto(true)}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] items-start max-w-6xl mx-auto">
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
              rows={2}
              value={bajada}
              onChange={(e) => { setBajada(e.target.value); marcar(); }}
              placeholder="Una o dos líneas que resumen la nota (aparece bajo el título y en Google)"
              className="admin-input w-full font-body resize-y"
            />
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-black/35 text-right">
              {bajada.trim().length} caracteres
            </p>
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
                  marcar();
                }}
                className="admin-input flex-1 font-mono text-sm"
              />
            </div>
          </div>

          <div className={grupo}>
            <span className={labelCls}>Cuerpo de la nota</span>
            <TiptapEditor
              contenidoInicial={cuerpoInicial}
              onListo={(html) => (cuerpoHtmlRef.current = html)}
              onChange={(json, html) => {
                cuerpoRef.current = json;
                cuerpoHtmlRef.current = html;
                setPalabras(contarPalabras(json));
                marcar();
              }}
            />
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-black/40 text-right">
              {palabras} palabra{palabras === 1 ? "" : "s"} · ~{Math.max(1, Math.round(palabras / PALABRAS_POR_MINUTO))} min de lectura
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="brut-frame-shadow bg-[var(--color-paper-pure)] lg:sticky lg:top-20">
          {/* Tabs Ficha / Preview */}
          <div className="grid grid-cols-2 border-b-2 border-[var(--color-ink)]" role="tablist" aria-label="Vista del panel de la nota">
            {([
              { v: "ficha", label: "La ficha" },
              { v: "preview", label: "Cómo se ve" },
            ] as const).map((t) => (
              <button
                key={t.v}
                type="button"
                role="tab"
                aria-selected={tab === t.v}
                onClick={() => setTab(t.v)}
                className={`font-sports uppercase tracking-[0.14em] text-xs py-2.5 transition-colors ${
                  tab === t.v
                    ? "bg-[var(--color-ink)] text-white"
                    : "text-black/50 hover:text-[var(--color-ink)] hover:bg-[var(--color-river-red-soft)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "preview" ? (
            <div className="p-5">
              <p className="font-body text-xs text-black/50 mb-4">
                Así se ve la card de esta nota en la portada, con los datos actuales.
              </p>
              <PreviewCardNota
                titulo={titulo}
                slug={slug}
                tipo={tipo}
                division={division}
                formato={formato}
                posterUrl={posterUrl}
                youtubeId={youtubeId || undefined}
                autor={autorSel ? { id: autorSel.id, nombre: autorSel.nombre, avatar_url: autorSel.avatar_url } : undefined}
              />
            </div>
          ) : (
            <div className="p-5">
              <h2 className="brut-label mb-3">Publicación</h2>
              <ChecklistPublicacion items={checklist} />

              <div className="flex flex-col gap-2 mb-5">
                {([
                  { v: "borrador", label: "Guardar como borrador" },
                  { v: "ahora", label: estadoActual === "publicada" ? "Mantener publicada" : "Publicar ahora" },
                  { v: "programada", label: "Programar fecha" },
                ] as Array<{ v: ModoPublicacion; label: string }>).map((o) => (
                  <label key={o.v} className="flex items-center gap-2 font-body text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="modo"
                      checked={modo === o.v}
                      onChange={() => { setModo(o.v); marcar(); }}
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
                    onChange={(e) => { setProgramadaPara(e.target.value); marcar(); }}
                    className="admin-input w-full font-mono text-sm mt-1"
                  />
                )}
              </div>

              <details className="admin-seccion" open>
                <summary>
                  <span className="brut-label">Clasificación</span>
                </summary>
                <div className="pb-4">
                  <div className={grupo}>
                    <label htmlFor="autor" className={labelCls}>Firma</label>
                    <select id="autor" value={autorId} onChange={(e) => { setAutorId(e.target.value); marcar(); }} className="admin-input w-full">
                      {autores.map((a) => (
                        <option key={a.id} value={a.id}>{a.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={grupo}>
                      <label htmlFor="tipo" className={labelCls}>Tipo</label>
                      <select id="tipo" value={tipo} onChange={(e) => { setTipo(e.target.value); marcar(); }} className="admin-input w-full">
                        {TIPOS_NOTA.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className={grupo}>
                      <label htmlFor="division" className={labelCls}>División</label>
                      <select id="division" value={division} onChange={(e) => { setDivision(e.target.value); marcar(); }} className="admin-input w-full">
                        {DIVISIONES.map((d) => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="mb-0">
                      <label htmlFor="formato" className={labelCls}>Formato</label>
                      <select id="formato" value={formato} onChange={(e) => { setFormato(e.target.value); marcar(); }} className="admin-input w-full">
                        {FORMATOS.map((f) => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-0">
                      <label htmlFor="fuente" className={labelCls}>Fuente</label>
                      <select id="fuente" value={fuente} onChange={(e) => { setFuente(e.target.value); marcar(); }} className="admin-input w-full">
                        {FUENTES.map((f) => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {formato === "youtube" && (
                    <div className="mt-5">
                      <label htmlFor="ytid" className={labelCls}>ID de YouTube</label>
                      <input id="ytid" value={youtubeId} onChange={(e) => { setYoutubeId(e.target.value); marcar(); }} placeholder="ej: dQw4w9WgXcQ" className="admin-input w-full font-mono text-sm" />
                    </div>
                  )}
                  {formato === "short" && (
                    <div className="mt-5">
                      <label htmlFor="videourl" className={labelCls}>URL del video</label>
                      <input id="videourl" value={videoUrl} onChange={(e) => { setVideoUrl(e.target.value); marcar(); }} placeholder="Link al video vertical" className="admin-input w-full font-mono text-sm" />
                    </div>
                  )}
                </div>
              </details>

              <details className="admin-seccion" open>
                <summary>
                  <span className="brut-label">Imagen principal</span>
                </summary>
                <div className="pb-4">
                  {posterUrl ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={posterUrl} alt="Vista previa de la imagen principal" className="w-full aspect-video object-cover brut-frame" />
                      <button
                        type="button"
                        onClick={() => { setPosterUrl(""); marcar(); }}
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
              </details>

              <details className="admin-seccion">
                <summary>
                  <span className="brut-label">Extras</span>
                </summary>
                <div className="pb-2">
                  <div className={grupo}>
                    <label htmlFor="tags" className={labelCls}>Tags (separados por coma)</label>
                    <input id="tags" value={tags} onChange={(e) => { setTags(e.target.value); marcar(); }} placeholder="traspasos, seleccion, lesiones" className="admin-input w-full font-mono text-sm" />
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
                              marcar();
                            }}
                            className="accent-[var(--color-river-red)]"
                          />
                          {s.nombre}
                          <span className="font-mono text-[10px] text-black/40 uppercase">{s.tipo}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mb-3">
                    <label className="flex items-center gap-2 font-body text-sm cursor-pointer">
                      <input type="checkbox" checked={primicia} onChange={(e) => { setPrimicia(e.target.checked); marcar(); }} className="accent-[var(--color-river-red)]" />
                      Primicia (&ldquo;Lo contamos primero&rdquo;)
                    </label>
                    <label className="flex items-center gap-2 font-body text-sm cursor-pointer">
                      <input type="checkbox" checked={destacada} onChange={(e) => { setDestacada(e.target.checked); marcar(); }} className="accent-[var(--color-river-red)]" />
                      Destacada (hero de la portada)
                    </label>
                  </div>
                </div>
              </details>

              <button
                type="button"
                onClick={salir}
                className="block w-full text-center mt-4 font-mono text-xs uppercase tracking-widest text-black/50 hover:text-[var(--color-river-red-deep)]"
              >
                ‹ Volver a notas
              </button>
            </div>
          )}
        </aside>
      </div>

      <PreviewNota
        abierto={previewAbierto}
        onCerrar={() => setPreviewAbierto(false)}
        titulo={titulo}
        bajada={bajada}
        tipo={tipo}
        division={division}
        formato={formato}
        posterUrl={posterUrl}
        primicia={primicia}
        autor={autorSel ? { nombre: autorSel.nombre, avatar_url: autorSel.avatar_url } : undefined}
        palabras={palabras}
        cuerpoHtml={cuerpoHtmlRef.current}
        contenidoLegacy={nota?.contenido}
      />

      <ConfirmDialog
        abierto={confirmaSalir}
        titulo="Cambios sin guardar"
        descripcion="Si salís ahora, lo que escribiste desde el último guardado se pierde. Podés quedarte y guardar con el botón de arriba."
        confirmarLabel="Salir sin guardar"
        peligroso
        onConfirmar={() => {
          setGuardado("inicial");
          sucioRef.current = false;
          router.push("/admin/notas");
        }}
        onCerrar={() => setConfirmaSalir(false)}
      />
    </form>
  );
}
