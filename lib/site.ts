/**
 * URL canónica del sitio, en un solo lugar.
 * - NEXT_PUBLIC_SITE_URL la pisa siempre (útil para previews de Vercel).
 * - En producción cae al dominio real aunque falte la env var.
 * - En desarrollo cae a localhost.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://inferioresriverplatense.com"
    : "http://localhost:3000");
