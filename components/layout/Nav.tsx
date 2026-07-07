"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { DIVISIONES } from "@/lib/constants";
import { hrefDivision, hrefTipo } from "@/lib/secciones";
import type { TipoNota } from "@/lib/types";

/** Items del dropdown "Notas" (tipos editoriales). */
const NOTAS_TIPOS: Array<{ label: string; value: TipoNota }> = [
  { label: "Perfiles", value: "perfil" },
  { label: "Crónicas", value: "cronica" },
  { label: "Análisis", value: "analisis" },
  { label: "Columnas", value: "columna" },
];

/** Redes de la barra roja (handles reales pendientes; ver CLAUDE.md). */
const REDES_BARRA = [
  { label: "Instagram", href: "https://instagram.com/" },
  { label: "X", href: "https://x.com/" },
  { label: "YouTube", href: "https://youtube.com/" },
];

/**
 * Fecha editorial, solo en cliente vía useSyncExternalStore: el servidor
 * muestra vacío y el primer render del cliente ya trae la fecha (sin el
 * parpadeo del patrón useEffect+setState).
 */
let fechaCache: string | null = null;
const getFecha = () =>
  (fechaCache ??= new Date().toLocaleDateString("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }));
const getFechaServidor = () => "";
const sinSuscripcion = () => () => {};

/**
 * Nav brutalist — masthead de diario, copiado de la estructura de Roca & Madre
 * con nuestros textos y paleta:
 *
 *  ┌ utilitaria ─ links · EL PERIÓDICO DE LAS INFERIORES · Oscuro/Newsletter/ES·EN ┐
 *  │                       Inferiores Riverplatense  (serif grande, centrado)       │
 *  │                — CRÓNICA Y ENTREVISTAS DE LAS INFERIORES —                      │
 *  ├ secciones (sticky) ─ Divisiones▾ · Notas▾ · Entrevistas · …   [⌕ buscar ⌘K] [NEWSLETTER]
 *  └────────────────────────────────────────────────────────────────────────────────┘
 */
export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tema = searchParams.get("tema");

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const divisionesBtnRef = useRef<HTMLButtonElement>(null);
  const notasBtnRef = useRef<HTMLButtonElement>(null);

  const fecha = useSyncExternalStore(sinSuscripcion, getFecha, getFechaServidor);

  // ⌘K / Ctrl+K enfoca el buscador. Escape cierra y DEVUELVE el foco al disparador.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        if (openDropdown === "divisiones") divisionesBtnRef.current?.focus();
        else if (openDropdown === "notas") notasBtnRef.current?.focus();
        else if (mobileOpen) burgerRef.current?.focus();
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openDropdown, mobileOpen]);

  // Reposiciona el dropdown abierto si se scrollea / redimensiona.
  // Va fixed para escapar del overflow-x del scroller de secciones (si no, lo recorta).
  useEffect(() => {
    if (!openDropdown) return;
    const btn =
      openDropdown === "divisiones"
        ? divisionesBtnRef.current
        : openDropdown === "notas"
          ? notasBtnRef.current
          : null;
    if (!btn) return;
    const update = () => {
      const r = btn.getBoundingClientRect();
      setCoords({ top: r.bottom + 8, left: r.left });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [openDropdown]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/?q=${encodeURIComponent(term)}` : "/");
    setOpenDropdown(null);
    setMobileOpen(false);
  };

  // Abre/cierra y ancla el dropdown (position: fixed) a su botón disparador.
  const openDropdownAt = (id: string, btn: HTMLButtonElement | null) => {
    if (openDropdown === id) {
      setOpenDropdown(null);
      return;
    }
    if (btn) {
      const r = btn.getBoundingClientRect();
      setCoords({ top: r.bottom + 8, left: r.left });
    }
    setOpenDropdown(id);
  };

  const divisionesActive = pathname.startsWith("/division/");
  const notasActive = NOTAS_TIPOS.some((t) => pathname === hrefTipo(t.value));

  return (
    <>
      <header style={{ background: "var(--color-river-black)" }}>
      {/* ============================================================
          NIVEL 1 — barrita superior (fecha + meta)
          Rojo PROFUNDO (#C21020) para que el texto blanco chico pase contraste AA.
          ============================================================ */}
      <div style={{ background: "var(--color-river-red-deep)" }}>
        <div
          className="mx-auto max-w-[1440px] px-4 lg:px-10 h-8 grid items-center gap-4"
          style={{ gridTemplateColumns: "1fr auto 1fr" }}
        >
          {/* izquierda: fecha + lugar */}
          <span
            className="justify-self-start font-mono whitespace-nowrap"
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.92)",
              minHeight: "0.8rem",
            }}
          >
            {fecha ? `${fecha} · ` : ""}Buenos Aires
          </span>

          {/* centro: kicker editorial */}
          <span
            className="hidden lg:inline-flex items-center gap-2.5 justify-self-center font-mono whitespace-nowrap"
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#ffffff",
            }}
          >
            <span aria-hidden style={{ width: "4px", height: "4px", borderRadius: "9999px", background: "#fff" }} />
            De la Novena a la Primera
            <span aria-hidden style={{ width: "4px", height: "4px", borderRadius: "9999px", background: "#fff" }} />
          </span>

          {/* derecha: navegación util + redes + edición */}
          <span className="hidden md:flex items-center gap-4 justify-self-end whitespace-nowrap">
            <Link href="/sobre" className="util-link">Sobre</Link>
            <Link href="/contacto" className="util-link">Contacto</Link>
            <span aria-hidden style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.32)" }} />
            {REDES_BARRA.map((r) => (
              <a key={r.label} href={r.href} target="_blank" rel="noreferrer" className="util-link">
                {r.label}
              </a>
            ))}
            <span className="util-link" style={{ cursor: "default", opacity: 0.95 }}>Nº 001</span>
          </span>
        </div>
      </div>

      {/* ============================================================
          NIVEL 2 — masthead (marca · escudo · descriptor)
          ============================================================ */}
      <div
        style={{
          background: "var(--color-ink)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="mx-auto max-w-[1440px] px-4 lg:px-10 py-3 sm:py-4 lg:py-6 flex justify-center">
          <Link
            href="/"
            aria-label="Inferiores Riverplatense · Portada"
            className="flex items-center justify-center gap-3 sm:gap-4 lg:gap-5 group min-w-0 max-w-full"
          >
            <Image
              src="/logo.webp"
              alt=""
              width={132}
              height={132}
              className="shrink-0 block h-auto w-12 sm:w-16 lg:w-28 transition-transform duration-200 group-hover:scale-[1.05]"
              style={{ background: "var(--color-paper-pure)", borderRadius: "9999px" }}
            />
            <span
              className="font-display text-center min-w-0"
              style={{
                fontSize: "clamp(1.3rem, 5.5vw, 4rem)",
                letterSpacing: "-0.03em",
                lineHeight: 0.95,
                position: "relative",
                top: "0.06em",
              }}
            >
              <span style={{ color: "var(--color-paper-pure)" }}>
                Inferiores{" "}
              </span>
              <span
                style={{
                  fontStyle: "italic",
                  color: "var(--color-river-red)",
                }}
              >
                Riverplatense
              </span>
            </span>
          </Link>
        </div>
      </div>
      </header>

      {/* ============================================================
          NIVEL 3 — barra de secciones (FIXED para toda la página)
          ============================================================ */}
      <div
        className="sticky top-0 z-50 w-full"
        style={{
          background: "var(--color-ink)",
          borderBottom: "4px solid var(--color-river-red)",
        }}
      >
        <div className="mx-auto max-w-[1440px] px-4 lg:px-10 h-14 flex items-center gap-3 lg:gap-4">
          {/* hamburguesa — solo mobile */}
          <button
            ref={burgerRef}
            type="button"
            className="nav-burger inline-flex md:hidden"
            data-open={mobileOpen}
            aria-expanded={mobileOpen}
            aria-controls="nav-mobile-panel"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M5 5l14 14M19 5L5 19" strokeLinecap="square" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="square" />
              </svg>
            )}
          </button>

          {/* secciones — desktop / tablet */}
          <nav
            className="hidden md:flex items-center gap-4 chips-scroller overflow-x-auto min-w-0"
            aria-label="Secciones"
          >
            {/* Divisiones ▾ */}
            <div className="relative">
              <button
                ref={divisionesBtnRef}
                type="button"
                className="section-link"
                data-active={divisionesActive}
                data-open={openDropdown === "divisiones"}
                onClick={() => openDropdownAt("divisiones", divisionesBtnRef.current)}
                aria-expanded={openDropdown === "divisiones"}
                aria-haspopup="true"
                aria-controls="dropdown-divisiones"
              >
                Divisiones <span className="caret" aria-hidden>▾</span>
              </button>
              {openDropdown === "divisiones" && coords && (
                <div
                  className="section-dropdown"
                  id="dropdown-divisiones"
                  style={{ position: "fixed", top: coords.top, left: coords.left }}
                >
                  {DIVISIONES.map((d) => (
                    <Link
                      key={d.value}
                      href={hrefDivision(d.value)}
                      onClick={() => setOpenDropdown(null)}
                    >
                      {d.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <span className="section-divider" aria-hidden />

            {/* Notas ▾ */}
            <div className="relative">
              <button
                ref={notasBtnRef}
                type="button"
                className="section-link"
                data-active={notasActive}
                data-open={openDropdown === "notas"}
                onClick={() => openDropdownAt("notas", notasBtnRef.current)}
                aria-expanded={openDropdown === "notas"}
                aria-haspopup="true"
                aria-controls="dropdown-notas"
              >
                Notas <span className="caret" aria-hidden>▾</span>
              </button>
              {openDropdown === "notas" && coords && (
                <div
                  className="section-dropdown"
                  id="dropdown-notas"
                  style={{ position: "fixed", top: coords.top, left: coords.left }}
                >
                  {NOTAS_TIPOS.map((t) => (
                    <Link
                      key={t.value}
                      href={hrefTipo(t.value)}
                      onClick={() => setOpenDropdown(null)}
                    >
                      {t.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <span className="section-divider" aria-hidden />
            <Link href={hrefTipo("entrevista")} className="section-link" data-active={pathname === hrefTipo("entrevista")}>
              Entrevistas
            </Link>
            <span className="section-divider" aria-hidden />
            <Link href={hrefTipo("noticia")} className="section-link" data-active={pathname === hrefTipo("noticia")}>
              Noticias
            </Link>
            <span className="section-divider" aria-hidden />
            <Link href="/?tema=traspasos" className="section-link" data-active={tema === "traspasos"}>
              Traspasos
            </Link>
            <span className="section-divider" aria-hidden />
            <Link href={hrefDivision("primera")} className="section-link" data-active={pathname === hrefDivision("primera")}>
              Primera
            </Link>
            <span className="section-divider" aria-hidden />
            <Link href={hrefDivision("reserva")} className="section-link" data-active={pathname === hrefDivision("reserva")}>
              Reserva
            </Link>
          </nav>

          {/* buscador — completa el ancho disponible */}
          <form onSubmit={submitSearch} role="search" className="inline-search hidden lg:flex flex-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.4" className="shrink-0">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="square" />
            </svg>
            <input
              ref={searchRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar nota, jugador, división…"
              aria-label="Buscar"
            />
          </form>

          {/* newsletter */}
          <a
            href="#newsletter"
            onClick={() => setMobileOpen(false)}
            className="newsletter-btn shrink-0 ml-auto lg:ml-0"
          >
            Newsletter
          </a>
        </div>

        {/* ── Panel mobile (hamburguesa) ── */}
        {mobileOpen && (
          <div className="nav-mobile-panel flex flex-col md:hidden" id="nav-mobile-panel">
            {/* buscador */}
            <form onSubmit={submitSearch} role="search" className="nav-mobile-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.4" className="shrink-0">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" strokeLinecap="square" />
              </svg>
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar nota, jugador, división…"
                aria-label="Buscar"
                // El panel recién abierto lleva el foco adentro (patrón de menú).
                autoFocus
              />
            </form>

            {/* secciones principales */}
            <div className="nav-mobile-group">
              <Link href={hrefTipo("entrevista")} className="nav-mobile-link" data-active={pathname === hrefTipo("entrevista")} onClick={() => setMobileOpen(false)}>
                Entrevistas
              </Link>
              <Link href={hrefTipo("noticia")} className="nav-mobile-link" data-active={pathname === hrefTipo("noticia")} onClick={() => setMobileOpen(false)}>
                Noticias
              </Link>
              <Link href="/?tema=traspasos" className="nav-mobile-link" data-active={tema === "traspasos"} onClick={() => setMobileOpen(false)}>
                Traspasos
              </Link>
              <Link href="/sobre" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
                Sobre
              </Link>
              <Link href="/contacto" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
                Contacto
              </Link>
            </div>

            {/* divisiones */}
            <div>
              <p className="nav-mobile-label">Divisiones</p>
              <div className="nav-mobile-chips">
                {DIVISIONES.map((d) => (
                  <Link
                    key={d.value}
                    href={hrefDivision(d.value)}
                    className="nav-mobile-chip"
                    data-active={pathname === hrefDivision(d.value)}
                    onClick={() => setMobileOpen(false)}
                  >
                    {d.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* tipos de nota */}
            <div>
              <p className="nav-mobile-label">Notas</p>
              <div className="nav-mobile-chips">
                {NOTAS_TIPOS.map((t) => (
                  <Link
                    key={t.value}
                    href={hrefTipo(t.value)}
                    className="nav-mobile-chip"
                    data-active={pathname === hrefTipo(t.value)}
                    onClick={() => setMobileOpen(false)}
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>

            <a href="#newsletter" className="newsletter-btn nav-mobile-newsletter" onClick={() => setMobileOpen(false)}>
              Newsletter
            </a>
          </div>
        )}
      </div>

      {/* click afuera para cerrar dropdowns / menú mobile */}
      {(openDropdown || mobileOpen) && (
        <div
          className="dropdown-backdrop"
          onClick={() => {
            if (mobileOpen) burgerRef.current?.focus();
            setOpenDropdown(null);
            setMobileOpen(false);
          }}
          aria-hidden
        />
      )}
    </>
  );
}
