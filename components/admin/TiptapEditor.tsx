"use client";

import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import { subirImagen } from "@/lib/admin/upload";

interface TiptapEditorProps {
  contenidoInicial: JSONContent | null;
  onChange: (json: JSONContent, html: string) => void;
  /** HTML inicial ya renderizado, apenas monta el editor (para la vista previa). */
  onListo?: (html: string) => void;
}

export default function TiptapEditor({ contenidoInicial, onChange, onListo }: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false },
      }),
      Image,
      Youtube.configure({ width: 640, height: 360, nocookie: true }),
      Placeholder.configure({
        placeholder: "Escribí la nota acá. Seleccioná texto para dar formato…",
      }),
    ],
    content: contenidoInicial ?? "",
    onCreate: ({ editor: e }) => onListo?.(e.getHTML()),
    onUpdate: ({ editor: e }) => onChange(e.getJSON(), e.getHTML()),
  });

  if (!editor) {
    return <div className="brut-frame bg-[var(--color-paper-pure)] min-h-96 p-6 font-body text-black/40">Cargando editor…</div>;
  }

  function pedirLink() {
    const previo = editor!.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL del link:", previo ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor!.chain().focus().unsetLink().run();
      return;
    }
    editor!.chain().focus().setLink({ href: url }).run();
  }

  function pedirYoutube() {
    const url = window.prompt("URL del video de YouTube:");
    if (!url) return;
    editor!.chain().focus().setYoutubeVideo({ src: url }).run();
  }

  async function pedirImagen() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const url = await subirImagen(file, "posters");
        editor!.chain().focus().setImage({ src: url }).run();
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "No se pudo subir la imagen.");
      }
    };
    input.click();
  }

  const b = (activo: boolean) =>
    `font-mono text-xs px-2.5 py-1.5 border-2 transition-colors ${
      activo
        ? "bg-[var(--color-ink)] text-white border-[var(--color-ink)]"
        : "border-transparent hover:border-[var(--color-ink)]"
    }`;

  return (
    <div className="brut-frame bg-[var(--color-paper-pure)]">
      {/* Toolbar */}
      <div
        role="toolbar"
        aria-label="Formato del texto"
        className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b-2 border-[var(--color-ink)] sticky top-0 bg-[var(--color-paper-pure)] z-10"
      >
        <button type="button" title="Negrita" onClick={() => editor.chain().focus().toggleBold().run()} className={b(editor.isActive("bold"))}><strong>B</strong></button>
        <button type="button" title="Itálica" onClick={() => editor.chain().focus().toggleItalic().run()} className={b(editor.isActive("italic"))}><em>I</em></button>
        <span aria-hidden className="w-px h-5 bg-black/15 mx-1.5" />
        <button type="button" title="Subtítulo" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={b(editor.isActive("heading", { level: 2 }))}>H2</button>
        <button type="button" title="Subtítulo menor" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={b(editor.isActive("heading", { level: 3 }))}>H3</button>
        <button type="button" title="Cita destacada" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={b(editor.isActive("blockquote"))}>&ldquo;&rdquo;</button>
        <span aria-hidden className="w-px h-5 bg-black/15 mx-1.5" />
        <button type="button" title="Lista" onClick={() => editor.chain().focus().toggleBulletList().run()} className={b(editor.isActive("bulletList"))}>• Lista</button>
        <button type="button" title="Lista numerada" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={b(editor.isActive("orderedList"))}>1. Lista</button>
        <span aria-hidden className="w-px h-5 bg-black/15 mx-1.5" />
        <button type="button" title="Link" onClick={pedirLink} className={b(editor.isActive("link"))}>Link</button>
        <button type="button" title="Insertar imagen" onClick={pedirImagen} className={b(false)}>Imagen</button>
        <button type="button" title="Embed de YouTube" onClick={pedirYoutube} className={b(false)}>YouTube</button>
        <span className="flex-1" />
        <button type="button" title="Deshacer" onClick={() => editor.chain().focus().undo().run()} className={b(false)}>↺</button>
        <button type="button" title="Rehacer" onClick={() => editor.chain().focus().redo().run()} className={b(false)}>↻</button>
      </div>

      {/* El cuerpo se edita con la MISMA tipografía con la que se publica */}
      <EditorContent editor={editor} className="editor-cuerpo article-prose px-6 py-5" />
    </div>
  );
}
