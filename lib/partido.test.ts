import { describe, expect, test } from "vitest";
import {
  expiraPartido,
  fechaLocalBuenosAires,
  formatearFechaPartido,
  GRACIA_POST_PARTIDO_MS,
  partidoVigente,
} from "./partido";

// 2026-07-10 12:00 Buenos Aires (-03:00) = 15:00 UTC. Es viernes.
const FECHA = "2026-07-10T15:00:00.000Z";

describe("partidoVigente", () => {
  test("es vigente antes del partido", () => {
    expect(partidoVigente(FECHA, Date.parse("2026-07-08T10:00:00Z"))).toBe(true);
  });

  test("sigue vigente durante la gracia post partido", () => {
    const durante = Date.parse(FECHA) + GRACIA_POST_PARTIDO_MS - 60_000;
    expect(partidoVigente(FECHA, durante)).toBe(true);
  });

  test("expira pasada la gracia", () => {
    const despues = Date.parse(FECHA) + GRACIA_POST_PARTIDO_MS + 60_000;
    expect(partidoVigente(FECHA, despues)).toBe(false);
  });
});

describe("expiraPartido", () => {
  test("devuelve fecha del partido + gracia en epoch ms", () => {
    expect(expiraPartido(FECHA)).toBe(Date.parse(FECHA) + GRACIA_POST_PARTIDO_MS);
  });
});

describe("formatearFechaPartido", () => {
  test("formatea en hora de Buenos Aires", () => {
    expect(formatearFechaPartido(FECHA)).toBe("vie 10/07 · 12:00");
  });
});

describe("fechaLocalBuenosAires", () => {
  test("convierte ISO a valor de datetime-local en hora argentina", () => {
    expect(fechaLocalBuenosAires(FECHA)).toBe("2026-07-10T12:00");
  });
});
