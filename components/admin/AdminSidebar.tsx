"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  email: string;
  rol: "admin" | "editor";
  onCerrarSesion: () => Promise<void>;
}

const SECCIONES = [
  { href: "/admin", label: "Resumen", exact: true, soloAdmin: false },
  { href: "/admin/notas", label: "Notas", exact: false, soloAdmin: false },
  { href: "/admin/autores", label: "Autores", exact: false, soloAdmin: false },
  { href: "/admin/estadisticas", label: "Estadísticas", exact: false, soloAdmin: false },
  { href: "/admin/equipo", label: "Equipo", exact: false, soloAdmin: true },
];

export default function AdminSidebar({ email, rol, onCerrarSesion }: AdminSidebarProps) {
  const pathname = usePathname();
  const iniciales = email.slice(0, 2).toUpperCase();
  const enEditor = pathname.startsWith("/admin/notas/");

  return (
    <aside className="admin-sidebar bg-[var(--color-ink)] text-white flex items-stretch md:items-start md:flex-col shrink-0">
      {/* Marca */}
      <Link
        href="/admin"
        className="flex items-center gap-3 px-4 md:px-5 py-3.5 md:py-5 md:border-b border-white/10 shrink-0 md:w-full"
      >
        <Image src="/logo.webp" alt="" width={36} height={36} className="rounded-full" />
        <span className="hidden md:block">
          <span className="block font-sports uppercase tracking-[0.2em] text-[10px] text-white/60">
            Mesa de redacción
          </span>
          <span className="block font-display font-bold leading-tight">
            Inferiores <em className="text-[var(--color-river-red)]">Rpl.</em>
          </span>
        </span>
      </Link>

      {/* Acción principal siempre a mano */}
      {!enEditor && (
        <Link
          href="/admin/notas/nueva"
          className="md:mx-4 md:mt-4 md:w-auto self-center md:self-stretch shrink-0 bg-[var(--color-river-red)] text-white font-sports uppercase tracking-[0.15em] text-sm text-center px-3 py-1.5 md:py-2.5 hover:bg-[var(--color-river-red-deep)] transition-colors"
        >
          <span className="md:hidden">
            +<span className="sr-only"> Nueva nota</span>
          </span>
          <span className="hidden md:inline">+ Nueva nota</span>
        </Link>
      )}

      {/* Navegación */}
      <nav
        aria-label="Panel"
        className="chips-scroller flex md:flex-col flex-1 min-w-0 md:w-full md:py-4 overflow-x-auto"
      >
        {SECCIONES.filter((s) => !s.soloAdmin || rol === "admin").map((s) => {
          const activa = s.exact ? pathname === s.href : pathname.startsWith(s.href);
          return (
            <Link
              key={s.href}
              href={s.href}
              aria-current={activa ? "page" : undefined}
              className={`admin-nav-item font-sports uppercase tracking-[0.15em] text-sm px-4 md:px-5 py-3 whitespace-nowrap ${
                activa ? "admin-nav-activa" : "text-white/60 hover:text-white"
              }`}
            >
              {s.label}
            </Link>
          );
        })}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="admin-nav-item font-sports uppercase tracking-[0.15em] text-sm px-4 md:px-5 py-3 text-white/60 hover:text-white whitespace-nowrap md:mt-auto"
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
            {email}
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

      {/* Salir (mobile) */}
      <form action={onCerrarSesion} className="md:hidden self-center px-3 shrink-0">
        <button
          type="submit"
          title={`Cerrar sesión (${email})`}
          className="font-mono text-[10px] uppercase tracking-widest text-white/50 hover:text-[var(--color-river-red)] transition-colors py-2"
        >
          Salir
        </button>
      </form>
    </aside>
  );
}
