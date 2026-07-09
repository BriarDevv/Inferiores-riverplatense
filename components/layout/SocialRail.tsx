import Link from "next/link";

interface Red {
  label: string;
  href: string;
  icon: React.ReactNode;
}

/**
 * Redes sociales del periodista. Rail fijo izquierda en desktop.
 * Cambiá los href por las URLs reales cuando estén.
 * Exportado para reusarlo adentro de la nota (RedesNota).
 */
export const REDES: Red[] = [
  {
    label: "X (Twitter)",
    href: "https://twitter.com/",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M18.244 2H21.5l-7.5 8.586L22.75 22h-6.97l-5.46-6.857L4.04 22H.78l8-9.144L.75 2h7.146l4.94 6.293L18.245 2Zm-2.444 18h1.96L7.66 4H5.55l10.25 16Z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com/",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.69a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.12z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com/",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.546 15.568V8.432L15.818 12l-6.272 3.568z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com/",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.988h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    ),
  },
];

const btnStyle: React.CSSProperties = {
  width: "44px",
  height: "44px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "2px solid var(--color-ink)",
  background: "var(--color-paper-pure)",
  color: "var(--color-ink)",
  transition: "all 140ms ease-out",
};

export default function SocialRail() {

  return (
    // Solo en monitores MUY anchos: el contenido usa contenedores de hasta
    // 1440px, y con menos de ~1700px de viewport el rail fijo lo taparía.
    // En pantallas más chicas las redes viven adentro de la nota (RedesNota).
    <div
      className="hidden min-[1700px]:block fixed left-6 top-1/2 z-40"
      style={{ transform: "translateY(-50%)" }}
    >
      <div
        className="flex flex-col gap-2"
        style={{
          padding: "0.5rem",
          background: "var(--color-paper)",
          border: "2px solid var(--color-ink)",
          boxShadow: "4px 4px 0 var(--color-ink)",
        }}
      >
        {REDES.map((r) => (
          <Link
            key={r.label}
            href={r.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Seguir en ${r.label}`}
            style={btnStyle}
            className="hover:bg-[var(--color-ink)] hover:text-[var(--color-paper-pure)]"
          >
            {r.icon}
          </Link>
        ))}
      </div>
    </div>
  );
}
