"use client";

import { useState } from "react";

interface Props {
  url: string;
  title: string;
}

/** Compartir mínimo y brutalist: WhatsApp, X y copiar link. */
export default function ShareBar({ url, title }: Props) {
  const [copied, setCopied] = useState(false);

  const wa = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
  const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title,
  )}&url=${encodeURIComponent(url)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* navegador sin clipboard API: no hacemos nada */
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className="font-mono text-[0.62rem] uppercase tracking-[0.16em]"
        style={{ color: "var(--color-neutral-500)" }}
      >
        Compartir
      </span>
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en WhatsApp"
        className="share-btn"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
        </svg>
      </a>
      <a
        href={x}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en X"
        className="share-btn"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2H21.5l-7.5 8.586L22.75 22h-6.97l-5.46-6.857L4.04 22H.78l8-9.144L.75 2h7.146l4.94 6.293L18.245 2Zm-2.444 18h1.96L7.66 4H5.55l10.25 16Z" />
        </svg>
      </a>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Link copiado al portapapeles" : ""}
      </span>
      <button type="button" onClick={copy} aria-label="Copiar link" className="share-btn">
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M20 6 9 17l-5-5" strokeLinecap="square" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="square" />
            <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="square" />
          </svg>
        )}
      </button>
    </div>
  );
}
