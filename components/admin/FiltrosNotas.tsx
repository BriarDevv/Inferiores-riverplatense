"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { DIVISIONES, TIPOS_NOTA } from "@/lib/constants";

interface FiltrosNotasProps {
  autores: Array<{ id: string; nombre: string }>;
  valores: {
    estado?: string;
    tipo?: string;
    division?: string;
    autor?: string;
    q?: string;
    orden?: string;
    dir?: string;
  };
}

const ESTADOS = [
  { value: "publicada", label: "Publicadas" },
  { value: "programada", label: "Programadas" },
  { value: "borrador", label: "Borradores" },
];

const DEBOUNCE_BUSQUEDA_MS = 350;

/**
 * Barra de filtros de Notas: cada cambio aplica solo (navegación client-side),
 * la búsqueda con debounce. Al filtrar se vuelve a la página 1 y se conserva
 * el orden elegido. Sin JS, el form GET nativo sigue funcionando.
 */
export default function FiltrosNotas({ autores, valores }: FiltrosNotasProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  function aplicar() {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    const params = new URLSearchParams();
    for (const [clave, valor] of data.entries()) {
      if (typeof valor === "string" && valor.trim() !== "") params.set(clave, valor);
    }
    const qs = params.toString();
    router.push(qs ? `/admin/notas?${qs}` : "/admin/notas");
  }

  function aplicarConDebounce() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(aplicar, DEBOUNCE_BUSQUEDA_MS);
  }

  const select = "admin-input w-full";

  return (
    <form
      ref={formRef}
      method="get"
      action="/admin/notas"
      onSubmit={(e) => {
        e.preventDefault();
        aplicar();
      }}
      className="brut-frame bg-[var(--color-paper-pure)] px-4 py-4 grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-wrap lg:items-end gap-3 mb-4"
    >
      {valores.orden && <input type="hidden" name="orden" value={valores.orden} />}
      {valores.dir && <input type="hidden" name="dir" value={valores.dir} />}

      <label className="flex flex-col gap-1">
        <span className="brut-label">Estado</span>
        <select name="estado" defaultValue={valores.estado ?? ""} onChange={aplicar} className={select}>
          <option value="">Todos</option>
          {ESTADOS.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="brut-label">Tipo</span>
        <select name="tipo" defaultValue={valores.tipo ?? ""} onChange={aplicar} className={select}>
          <option value="">Todos</option>
          {TIPOS_NOTA.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="brut-label">División</span>
        <select name="division" defaultValue={valores.division ?? ""} onChange={aplicar} className={select}>
          <option value="">Todas</option>
          {DIVISIONES.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="brut-label">Firma</span>
        <select name="autor" defaultValue={valores.autor ?? ""} onChange={aplicar} className={select}>
          <option value="">Todas</option>
          {autores.map((a) => (
            <option key={a.id} value={a.id}>{a.nombre}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 col-span-2 sm:col-span-4 lg:flex-1 lg:min-w-44">
        <span className="brut-label">Buscar</span>
        <input
          type="search"
          name="q"
          defaultValue={valores.q ?? ""}
          onChange={aplicarConDebounce}
          placeholder="Título, bajada o slug…"
          className="admin-input w-full"
        />
      </label>
    </form>
  );
}
