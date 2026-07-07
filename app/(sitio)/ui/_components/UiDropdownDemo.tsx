"use client";

import { useState } from "react";
import Dropdown from "@/components/ui/Dropdown";
import { DIVISIONES, TIPOS_NOTA } from "@/lib/constants";

const OPC_FORMATO = [
  { value: null, label: "Todos los formatos" },
  { value: "short", label: "Shorts (verticales)" },
  { value: "youtube", label: "Videos largos" },
  { value: "articulo", label: "Notas escritas" },
];

export default function UiDropdownDemo() {
  const [tipo, setTipo] = useState<string | null>(null);
  const [division, setDivision] = useState<string | null>("reserva");
  const [formato, setFormato] = useState<string | null>(null);

  const opcTipo = [
    { value: null, label: "Todos los tipos" },
    ...TIPOS_NOTA.map((t) => ({ value: t.value, label: t.label })),
  ];
  const opcDivision = [
    { value: null, label: "Todas las divisiones" },
    ...DIVISIONES.map((d) => ({ value: d.value, label: d.label })),
  ];

  return (
    <div className="space-y-6">
      <p
        className="text-sm max-w-2xl"
        style={{ color: "var(--color-neutral-700)" }}
      >
        Dropdowns compactos con label + valor. Rellenos (fondo ink) cuando hay
        selección, outline cuando están en estado default. Cerrar con click afuera
        o Escape.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Dropdown label="Tipo" options={opcTipo} value={tipo} onChange={setTipo} />
        <Dropdown
          label="División"
          options={opcDivision}
          value={division}
          onChange={setDivision}
        />
        <Dropdown
          label="Formato"
          options={OPC_FORMATO}
          value={formato}
          onChange={setFormato}
        />
      </div>

      <div
        className="p-4 font-mono text-[0.75rem]"
        style={{
          background: "var(--color-paper-pure)",
          border: "1px solid var(--color-neutral-200)",
          color: "var(--color-neutral-700)",
        }}
      >
        <span style={{ color: "var(--color-neutral-500)" }}>Estado · </span>
        tipo=<span style={{ color: "var(--color-river-red)" }}>{String(tipo)}</span>
        {" · "}
        division=<span style={{ color: "var(--color-river-red)" }}>{String(division)}</span>
        {" · "}
        formato=<span style={{ color: "var(--color-river-red)" }}>{String(formato)}</span>
      </div>
    </div>
  );
}
