import { ImageResponse } from "next/og";

/**
 * OG image default del sitio (brutalist, ink + rojo River).
 * Las notas la pisan con su poster vía generateMetadata; esta cubre
 * portada, /sobre, /contacto y cualquier página sin imagen propia.
 */
export const alt =
  "Inferiores Riverplatense — Periodismo de la cantera de River";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const RED = "#EB192E";
const INK = "#0A0A0A";
const PAPER = "#FAFAF7";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: INK,
          padding: 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 24, height: 24, background: RED }} />
          <div
            style={{
              color: PAPER,
              fontSize: 26,
              textTransform: "uppercase",
              letterSpacing: 8,
            }}
          >
            De la Novena a la Primera
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: PAPER,
              fontSize: 110,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: -3,
            }}
          >
            Inferiores
          </div>
          <div
            style={{
              color: RED,
              fontSize: 110,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: -3,
            }}
          >
            Riverplatense
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `6px solid ${RED}`,
            paddingTop: 28,
          }}
        >
          <div style={{ color: PAPER, fontSize: 30 }}>
            Periodismo de la cantera de River
          </div>
          <div style={{ color: PAPER, opacity: 0.55, fontSize: 26 }}>
            inferioresriverplatense.com
          </div>
        </div>
      </div>
    ),
    size,
  );
}
