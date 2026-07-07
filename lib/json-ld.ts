/**
 * Serializa un objeto JSON-LD para inyectarlo en un <script>.
 * JSON.stringify no escapa HTML: un "</script>" dentro de un título
 * rompería el tag y se volvería XSS. Escapamos <, > y & a \uXXXX
 * (JSON válido, HTML inofensivo).
 */
export function jsonLdSeguro(datos: unknown): string {
  return JSON.stringify(datos)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
