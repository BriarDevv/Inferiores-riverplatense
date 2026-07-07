/**
 * Render server-side del cuerpo Tiptap (JSON → HTML) para la nota pública.
 * Usa las MISMAS extensiones que el editor del panel: si el editor lo puede
 * escribir, esto lo puede renderizar.
 */
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import type { JSONContent } from "@tiptap/core";

const EXTENSIONES = [
  StarterKit.configure({ heading: { levels: [2, 3] } }),
  Image,
  Youtube.configure({ width: 640, height: 360, nocookie: true }),
];

function esJsonTiptap(cuerpo: unknown): cuerpo is JSONContent {
  return (
    typeof cuerpo === "object" &&
    cuerpo !== null &&
    (cuerpo as JSONContent).type === "doc"
  );
}

/** Texto plano del cuerpo Tiptap (p. ej. para estimar tiempo de lectura). */
export function textoDelCuerpo(cuerpo: unknown): string {
  if (!esJsonTiptap(cuerpo)) return "";
  const partes: string[] = [];
  const visitar = (nodo: JSONContent): void => {
    if (typeof nodo.text === "string") partes.push(nodo.text);
    nodo.content?.forEach(visitar);
  };
  visitar(cuerpo);
  return partes.join(" ");
}

/** null si el cuerpo está vacío o no es un documento Tiptap válido. */
export function renderCuerpo(cuerpo: unknown): string | null {
  if (!esJsonTiptap(cuerpo)) return null;
  if (!cuerpo.content || cuerpo.content.length === 0) return null;
  try {
    const html = generateHTML(cuerpo, EXTENSIONES);
    return html === "<p></p>" ? null : html;
  } catch {
    // Documento con nodos desconocidos (editor más nuevo que el sitio): mejor
    // caer al contenido legacy que romper la página.
    return null;
  }
}
