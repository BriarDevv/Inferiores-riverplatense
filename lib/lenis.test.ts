import { describe, expect, it } from "vitest";
import { registrarLenis, suscribirLenis, type LenisCompartido } from "./lenis";

function lenisFake(): LenisCompartido {
  return { on: () => {} };
}

describe("registro compartido de Lenis", () => {
  it("notifica al suscriptor cuando la instancia ya estaba registrada", () => {
    const instancia = lenisFake();
    registrarLenis(instancia);
    let recibida: LenisCompartido | null = null;
    suscribirLenis((l) => {
      recibida = l;
    });
    expect(recibida).toBe(instancia);
  });

  it("notifica al suscriptor que llegó antes que la instancia", () => {
    registrarLenis(null); // resetea lo del test anterior
    let recibida: LenisCompartido | null = null;
    suscribirLenis((l) => {
      recibida = l;
    });
    expect(recibida).toBeNull();
    const instancia = lenisFake();
    registrarLenis(instancia);
    expect(recibida).toBe(instancia);
  });

  it("desuscribir corta las notificaciones", () => {
    registrarLenis(null);
    let llamadas = 0;
    const desuscribir = suscribirLenis(() => {
      llamadas += 1;
    });
    desuscribir();
    registrarLenis(lenisFake());
    expect(llamadas).toBe(0);
  });
});
