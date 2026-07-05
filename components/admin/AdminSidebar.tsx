"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface AdminSidebarProps {
  email: string;
  rol: "admin" | "editor";
  firma?: string | null;
  onCerrarSesion: () => Promise<void>;
}

const SECCIONES = [
  { href: "/admin", label: "Resumen", exact: true, soloAdmin: false },
  { href: "/admin/notas", label: "Notas", exact: false, soloAdmin: false },
  { href: "/admin/autores", label: "Autores", exact: false, soloAdmin: false },
  { href: "/admin/estadisticas", label: "Estadísticas", exact: false, soloAdmin: false },
  { href: "/admin/equipo", label: "Equipo", exact: false, soloAdmin: true },
];

export default function AdminSidebar({ email, rol, firma, onCerrarSesion }: AdminSidebarProps) {
  const pathname = usePathname();
  const iniciales = email.slice(0, 2).toUpperCase();
  const enEditor = pathname.startsWith("/admin/notas/");

  const [menuAbierto, setMenuAbierto] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);

  // Navegar cierra el panel.
  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  // Escape cierra y devuelve el foco a la hamburguesa.
  useEffect(() => {
    if (!menuAbierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuAbierto(false);
        burgerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuAbierto]);

  const secciones = SECCIONES.filter((s) => !s.soloAdmin || rol === "admin");
  const esActiva = (s: (typeof SECCIONES)[number]) =>
    s.exact ? pathname === s.href : pathname.startsWith(s.href);

  return (
    <aside className="admin-sidebar bg-[var(--color-ink)] text-white flex items-center md:items-start md:flex-col shrink-0 gap-3 md:gap-0 px-4 md:px-0">
      {/* Hamburguesa — solo mobile (misma pieza que el nav del sitio) */}
      <button
        ref={burgerRef}
        type="button"
        className="nav-burger inline-flex md:hidden"
        data-open={menuAbierto}
        aria-expanded={menuAbierto}
        aria-controls="admin-mobile-panel"
        aria-label={menuAbierto ? "Cerrar menú del panel" : "Abrir menú del panel"}
        onClick={() => setMenuAbierto((v) => !v)}
      >
        {menuAbierto ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M5 5l14 14M19 5L5 19" strokeLinecap="square" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="square" />
          </svg>
        )}
      </button>

      {/* Marca */}
      <Link
        href="/admin"
        className="flex items-center gap-3 py-3 md:px-5 md:py-5 md:border-b border-white/10 shrink-0 min-w-0 md:w-full"
      >
        <Image src="/logo.webp" alt="" width={36} height={36} className="rounded-full" />
        {/* Mismo lockup que el masthead del sitio, apilado para el ancho del sidebar */}
        <span className="font-display font-bold leading-[0.95] min-w-0 text-[15px] md:text-base">
          <span className="block text-white">Inferiores</span>
          <span className="block italic text-[var(--color-river-red)]">Riverplatense</span>
        </span>
      </Link>

      <span className="flex-1 md:hidden" />

      {/* Acción principal siempre a mano */}
      {!enEditor && (
        <Link
          href="/admin/notas/nueva"
          className="brut-cta-red-dark shrink-0 font-sports uppercase tracking-[0.15em] text-sm inline-flex items-center justify-center w-10 h-[38px] sm:w-auto sm:h-auto sm:px-4 sm:py-2 md:mx-4 md:mt-4 md:self-stretch md:py-2.5"
        >
          <span className="sm:hidden text-xl leading-none" aria-hidden>
            +
          </span>
          <span className="sr-only sm:hidden">Nueva nota</span>
          <span className="hidden sm:inline">+ Nueva nota</span>
        </Link>
      )}

      {/* Navegación — desktop */}
      <nav aria-label="Panel" className="hidden md:flex md:flex-col flex-1 min-w-0 md:w-full md:py-4">
        {secciones.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            aria-current={esActiva(s) ? "page" : undefined}
            className={`admin-nav-item font-sports uppercase tracking-[0.15em] text-sm px-5 py-3 whitespace-nowrap ${
              esActiva(s) ? "admin-nav-activa" : "text-white/60 hover:text-white"
            }`}
          >
            {s.label}
          </Link>
        ))}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="admin-nav-item font-sports uppercase tracking-[0.15em] text-sm px-5 py-3 text-white/60 hover:text-white whitespace-nowrap md:mt-auto"
        >
          Ver el sitio ↗
        </a>
      </nav>

      {/* Usuario (desktop) */}
      <div className="hidden md:flex items-center gap-3 px-5 py-4 border-t border-white/10 w-full">
        <span
          aria-hidden
          className="w-9 h-9 shrink-0 rounded-full bg-[var(--color-river-red)] font-sports text-sm flex items-center justify-center"
        >
          {iniciales}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs truncate" title={email}>
            {firma ?? email}
          </span>
          <span className="block font-mono text-[10px] uppercase tracking-widest text-white/50">
            {rol}
          </span>
        </span>
        <form action={onCerrarSesion}>
          <button
            type="submit"
            title="Cerrar sesión"
            className="font-mono text-[10px] uppercase tracking-widest text-white/50 hover:text-[var(--color-river-red)] transition-colors"
          >
            Salir
          </button>
        </form>
      </div>

      {/* Panel desplegable — mobile */}
      {menuAbierto && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="dropdown-backdrop md:hidden"
            onClick={() => setMenuAbierto(false)}
          />
          <div className="nav-mobile-panel flex flex-col md:hidden" id="admin-mobile-panel">
            <nav aria-label="Secciones del panel" className="flex flex-col">
              {secciones.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  aria-current={esActiva(s) ? "page" : undefined}
                  className={`font-sports uppercase tracking-[0.15em] text-base py-2.5 border-l-4 pl-3 transition-colors ${
                    esActiva(s)
                      ? "text-white border-[var(--color-river-red)]"
                      : "text-white/60 border-transparent hover:text-white"
                  }`}
                >
                  {s.label}
                </Link>
              ))}
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="font-sports uppercase tracking-[0.15em] text-base py-2.5 border-l-4 border-transparent pl-3 text-white/60 hover:text-white"
              >
                Ver el sitio ↗
              </a>
            </nav>

            <div className="flex items-center gap-3 pt-3 border-t border-white/10">
              <span
                aria-hidden
                className="w-9 h-9 shrink-0 rounded-full bg-[var(--color-river-red)] font-sports text-sm flex items-center justify-center"
              >
                {iniciales}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs truncate" title={email}>
                  {firma ?? email}
                </span>
                <span className="block font-mono text-[10px] uppercase tracking-widest text-white/50">
                  {rol}
                </span>
              </span>
              <form action={onCerrarSesion}>
                <button
                  type="submit"
                  className="font-mono text-[10px] uppercase tracking-widest text-white/50 hover:text-[var(--color-river-red)] transition-colors"
                >
                  Salir
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
