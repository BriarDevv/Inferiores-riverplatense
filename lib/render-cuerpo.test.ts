import { describe, expect, it } from "vitest";
import { renderCuerpo, textoDelCuerpo } from "./render-cuerpo";
import { jsonLdSeguro } from "./json-ld";

const docConLink = (href: string) => ({
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "tocá acá",
          marks: [{ type: "link", attrs: { href } }],
        },
      ],
    },
  ],
});

describe("renderCuerpo — sanitizado de links", () => {
  it("conserva los links http/https", () => {
    const html = renderCuerpo(docConLink("https://ejemplo.com/nota"));
    expect(html).toContain('href="https://ejemplo.com/nota"');
    expect(html).toContain("tocá acá");
  });

  it("elimina el mark de un link javascript: pero conserva el texto", () => {
    const html = renderCuerpo(docConLink("javascript:alert(1)"));
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("<a");
    expect(html).toContain("tocá acá");
  });

  it("elimina links data: y vbscript:", () => {
    for (const href of ["data:text/html,x", "vbscript:x", "JAVASCRIPT:alert(1)"]) {
      expect(renderCuerpo(docConLink(href))).not.toContain("<a");
    }
  });
});

describe("textoDelCuerpo", () => {
  it("junta el texto plano de todos los nodos", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Título" }] },
        { type: "paragraph", content: [{ type: "text", text: "cuerpo de la nota" }] },
      ],
    };
    expect(textoDelCuerpo(doc)).toBe("Título cuerpo de la nota");
  });

  it("devuelve vacío si no es un documento Tiptap", () => {
    expect(textoDelCuerpo(null)).toBe("");
    expect(textoDelCuerpo("hola")).toBe("");
  });
});

describe("jsonLdSeguro", () => {
  it("escapa </script> para que no rompa el tag contenedor", () => {
    const out = jsonLdSeguro({ headline: "cierre</script><img src=x onerror=alert(1)>" });
    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<img");
    expect(JSON.parse(out).headline).toBe(
      "cierre</script><img src=x onerror=alert(1)>",
    );
  });
});
