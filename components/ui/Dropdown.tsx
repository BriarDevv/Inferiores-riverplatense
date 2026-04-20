"use client";

import { useEffect, useRef, useState } from "react";

export interface DropdownOption {
  value: string | null;
  label: string;
}

interface Props {
  label: string;
  options: DropdownOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

export default function Dropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "Todas",
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activa = options.find((o) => o.value === value);
  const display = activa?.label ?? placeholder;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const isActive = value !== null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors"
        style={{
          border: "2px solid var(--color-ink)",
          background: isActive ? "var(--color-ink)" : "var(--color-paper-pure)",
          color: isActive ? "var(--color-paper-pure)" : "var(--color-neutral-900)",
          minWidth: "11rem",
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className="font-mono text-[0.6rem] uppercase tracking-[0.14em] shrink-0"
          style={{
            color: isActive
              ? "rgba(250, 250, 247, 0.6)"
              : "var(--color-neutral-500)",
          }}
        >
          {label}
        </span>
        <span className="flex-1 text-left truncate">{display}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="shrink-0 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-full max-h-[320px] overflow-y-auto"
          style={{
            background: "var(--color-paper-pure)",
            border: "2px solid var(--color-ink)",
            boxShadow: "5px 5px 0 var(--color-ink)",
          }}
        >
          {options.map((opt) => {
            const selected = opt.value === value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                style={{
                  background: selected ? "var(--color-neutral-100)" : "transparent",
                  color: "var(--color-neutral-900)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--color-neutral-100)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = selected
                    ? "var(--color-neutral-100)"
                    : "transparent")
                }
              >
                <span
                  className="block w-1 h-4 shrink-0"
                  style={{
                    background: selected ? "var(--color-river-red)" : "transparent",
                  }}
                  aria-hidden
                />
                <span className="flex-1">{opt.label}</span>
                {selected && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{ color: "var(--color-river-red)" }}
                    aria-hidden
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
