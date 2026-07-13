import { ImageResponse } from "next/og";
import { getNotaPorSlug } from "@/lib/notas";
import { labelDivision, labelTipo } from "@/lib/constants";

/**
 * OG image por nota: el poster de fondo + banda ink brutalist con el
 * kicker rojo y el título. Marca la placa al compartir en redes/WhatsApp
 * sin depender de la foto sola.
 */
export const alt = "Inferiores Riverplatense";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const RED = "#EB192E";
const INK = "#0A0A0A";
const PAPER = "#FAFAF7";

export default async function OpengraphImageNota({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const nota = await getNotaPorSlug(slug);

  // Sin nota (borrada/borrador): placa de marca sola, nunca un error.
  if (!nota) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: INK,
            color: PAPER,
            fontSize: 64,
            fontWeight: 700,
          }}
        >
          Inferiores Riverplatense
        </div>
      ),
      size,
    );
  }

  const titulo =
    nota.titulo.length > 110 ? `${nota.titulo.slice(0, 107)}…` : nota.titulo;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: INK,
        }}
      >
        {/* Sin poster (o URL vacía) la placa queda ink sola: un src roto
            haría tirar a ImageResponse y la red caería a nada. */}
        {nota.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={nota.poster_url}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            background: INK,
            borderTop: `6px solid ${RED}`,
            padding: "30px 48px 34px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: RED,
              fontSize: 22,
              textTransform: "uppercase",
              letterSpacing: 4,
            }}
          >
            <div style={{ width: 14, height: 14, background: RED }} />
            {labelTipo(nota.tipo)} · {labelDivision(nota.division)} — Inferiores
            Riverplatense
          </div>
          <div
            style={{
              color: PAPER,
              fontSize: 46,
              fontWeight: 700,
              lineHeight: 1.12,
            }}
          >
            {titulo}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
