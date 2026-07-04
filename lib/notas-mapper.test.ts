import { describe, expect, test } from "vitest";
import { mapRowToNota, type NotaRow } from "./notas-mapper";

const row: NotaRow = {
  id: "n-1",
  slug: "prueba",
  formato: "articulo",
  tipo: "cronica",
  division: "reserva",
  titulo: "T",
  bajada: "B",
  contenido: null,
  fuente: "propio",
  video_url: null,
  youtube_id: null,
  poster_url: "https://x/p.jpg",
  duracion_seg: null,
  quote_overlay: null,
  tags: ["river"],
  publicada_en: "2026-01-01T12:00:00+00:00",
  actualizada_en: null,
  destacada: true,
  primicia: false,
  capitulos: null,
  autor: { id: "a-1", nombre: "Pablo Molina", rol: "admin", foto_url: null },
  nota_sujetos: [
    {
      sujeto: {
        id: "s-1",
        tipo: "jugador",
        nombre: "Juan",
        slug: "juan",
        division: "reserva",
        bio: null,
      },
    },
  ],
};

describe("mapRowToNota", () => {
  test("mapea fila con joins al tipo Nota", () => {
    const n = mapRowToNota(row);
    expect(n.id).toBe("n-1");
    expect(n.autor).toEqual({
      id: "a-1",
      nombre: "Pablo Molina",
      rol: "admin",
      avatar_url: undefined,
    });
    expect(n.sujetos).toEqual([
      { id: "s-1", tipo: "jugador", nombre: "Juan", slug: "juan", division: "reserva", bio: undefined },
    ]);
    expect(n.destacada).toBe(true);
    expect(n.youtube_id).toBeUndefined();
    expect(n.contenido).toBeUndefined();
  });

  test("conserva avatar y campos opcionales cuando vienen con valor", () => {
    const conDatos = mapRowToNota({
      ...row,
      youtube_id: "abc123",
      autor: { ...row.autor, foto_url: "https://x/a.jpg" },
      capitulos: [{ tiempo: 10, titulo: "Arranque" }],
    });
    expect(conDatos.youtube_id).toBe("abc123");
    expect(conDatos.autor.avatar_url).toBe("https://x/a.jpg");
    expect(conDatos.capitulos).toEqual([{ tiempo: 10, titulo: "Arranque" }]);
  });
});
