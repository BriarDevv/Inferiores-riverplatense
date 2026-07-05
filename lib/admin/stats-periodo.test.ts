import { describe, expect, test } from "vitest";
import {
  agruparPorSemana,
  claveDia,
  horaLocal,
  mejorDia,
  normalizarFuente,
  partirPorCorte,
  porDispositivo,
  porFuente,
  porHora,
  porNota,
  serieDiaria,
  type VisitaCruda,
} from "./stats-periodo";

function visita(parcial: Partial<VisitaCruda>): VisitaCruda {
  return {
    nota_id: "n-1",
    visto_en: "2026-07-01T15:00:00Z",
    referer: null,
    dispositivo: null,
    ...parcial,
  };
}

describe("claveDia / horaLocal (huso Buenos Aires, UTC-3)", () => {
  test("un instante 01:00 UTC cae el día anterior en Buenos Aires", () => {
    expect(claveDia("2026-07-02T01:00:00Z")).toBe("2026-07-01");
  });

  test("horaLocal convierte 15:00 UTC en 12", () => {
    expect(horaLocal("2026-07-01T15:00:00Z")).toBe(12);
  });

  test("medianoche UTC es 21 h del día anterior", () => {
    expect(horaLocal("2026-07-02T00:00:00Z")).toBe(21);
  });
});

describe("partirPorCorte", () => {
  test("separa actuales y anteriores según el corte", () => {
    const corte = new Date("2026-07-01T00:00:00Z");
    const lote = [
      visita({ visto_en: "2026-06-30T23:59:00Z" }),
      visita({ visto_en: "2026-07-01T00:00:00Z" }),
      visita({ visto_en: "2026-07-02T10:00:00Z" }),
    ];
    const { actuales, anteriores } = partirPorCorte(lote, corte);
    expect(anteriores).toHaveLength(1);
    expect(actuales).toHaveLength(2);
  });
});

describe("serieDiaria", () => {
  test("rellena con 0 los días sin visitas", () => {
    const desde = new Date("2026-07-01T12:00:00Z");
    const hasta = new Date("2026-07-04T12:00:00Z");
    const serie = serieDiaria([visita({ visto_en: "2026-07-02T15:00:00Z" })], desde, hasta);
    expect(serie.map((p) => p.visitas)).toEqual([0, 1, 0, 0]);
    expect(serie[0].dia).toBe("2026-07-01");
    expect(serie[3].dia).toBe("2026-07-04");
  });

  test("suma varias visitas del mismo día", () => {
    const desde = new Date("2026-07-02T12:00:00Z");
    const serie = serieDiaria(
      [visita({ visto_en: "2026-07-02T15:00:00Z" }), visita({ visto_en: "2026-07-02T18:00:00Z" })],
      desde,
      desde,
    );
    expect(serie).toHaveLength(1);
    expect(serie[0].visitas).toBe(2);
  });
});

describe("agruparPorSemana", () => {
  test("agrupa de a 7 desde el final", () => {
    const serie = Array.from({ length: 10 }, (_, i) => ({
      dia: `2026-06-${String(i + 1).padStart(2, "0")}`,
      label: `${i + 1} jun`,
      visitas: 1,
    }));
    const semanas = agruparPorSemana(serie);
    expect(semanas).toHaveLength(2);
    expect(semanas[0].visitas).toBe(3); // resto inicial de 3 días
    expect(semanas[1].visitas).toBe(7);
  });
});

describe("mejorDia", () => {
  test("devuelve el pico y null si todo es 0", () => {
    const serie = [
      { dia: "2026-07-01", label: "1 jul", visitas: 0 },
      { dia: "2026-07-02", label: "2 jul", visitas: 5 },
    ];
    expect(mejorDia(serie)?.dia).toBe("2026-07-02");
    expect(mejorDia([{ dia: "2026-07-01", label: "1 jul", visitas: 0 }])).toBeNull();
  });
});

describe("porHora / porDispositivo / porNota", () => {
  test("porHora acumula en la hora local", () => {
    const horas = porHora([visita({ visto_en: "2026-07-01T15:00:00Z" })]);
    expect(horas[12]).toBe(1);
    expect(horas.reduce((a, b) => a + b, 0)).toBe(1);
  });

  test("porDispositivo cuenta mobile/desktop/sin dato", () => {
    const r = porDispositivo([
      visita({ dispositivo: "mobile" }),
      visita({ dispositivo: "desktop" }),
      visita({ dispositivo: null }),
    ]);
    expect(r).toEqual({ mobile: 1, desktop: 1, sinDato: 1 });
  });

  test("porNota agrupa por nota_id", () => {
    const mapa = porNota([visita({ nota_id: "a" }), visita({ nota_id: "a" }), visita({ nota_id: "b" })]);
    expect(mapa.get("a")).toBe(2);
    expect(mapa.get("b")).toBe(1);
  });
});

describe("fuentes", () => {
  test("normaliza hosts conocidos y URLs inválidas", () => {
    expect(normalizarFuente(null)).toBe("Directo");
    expect(normalizarFuente("https://www.google.com/search")).toBe("Google");
    expect(normalizarFuente("https://l.instagram.com/algo")).toBe("Instagram");
    expect(normalizarFuente("https://x.com/post")).toBe("X");
    expect(normalizarFuente("https://blog.example.com/")).toBe("Otros");
    expect(normalizarFuente("http://localhost:3000/nota/x")).toBe("Sin dato");
    expect(normalizarFuente("no-es-una-url")).toBe("Sin dato");
  });

  test("porFuente ordena por visitas", () => {
    const filas = porFuente([
      visita({ referer: "https://google.com/" }),
      visita({ referer: "https://google.com/" }),
      visita({ referer: null }),
    ]);
    expect(filas[0]).toEqual({ fuente: "Google", visitas: 2 });
    expect(filas[1]).toEqual({ fuente: "Directo", visitas: 1 });
  });
});
