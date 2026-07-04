import type { Metadata } from "next";
import ContactForm from "@/components/contacto/ContactForm";
import BackToHome from "@/components/layout/BackToHome";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "¿Tenés un dato de las inferiores de River? Escribime. Contacto directo para fuentes, primicias y consultas.",
};

// Placeholders — reemplazar por los reales al salir de la demo.
const EMAIL = "hola@inferioresriverplatense.com.ar";
const WHATSAPP = "5491100000000";

const METODOS = [
  {
    label: "Email",
    valor: EMAIL,
    href: `mailto:${EMAIL}`,
  },
  {
    label: "WhatsApp",
    valor: "+54 9 11 0000-0000",
    href: `https://wa.me/${WHATSAPP}`,
  },
];

export default function ContactoPage() {
  return (
    <main style={{ background: "var(--color-paper)" }}>
      <div className="mx-auto max-w-[980px] px-6 lg:px-8 py-10 lg:py-14">
        <BackToHome />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16">
          {/* izquierda: intro + métodos */}
          <div>
            <p
              className="font-mono text-[0.7rem] uppercase tracking-[0.2em] mb-3 flex items-center gap-2"
              style={{ color: "var(--color-river-red-deep)" }}
            >
              <span
                aria-hidden
                className="inline-block"
                style={{
                  width: "0.6rem",
                  height: "0.6rem",
                  background: "var(--color-river-red)",
                }}
              />
              Contacto
            </p>
            <h1
              className="font-display leading-[0.95] mb-5"
              style={{
                fontSize: "clamp(2.2rem, 5.5vw, 3.6rem)",
                letterSpacing: "-0.03em",
                color: "var(--color-ink)",
              }}
            >
              ¿Tenés un dato de las inferiores?
            </h1>
            <p
              className="text-lg leading-relaxed mb-8 max-w-prose"
              style={{ color: "var(--color-neutral-700)" }}
            >
              Si sos jugador, familiar, entrenador o simplemente viste algo en una
              cancha de River, escribime. Las mejores notas arrancan con un dato.
              Reserva total de la fuente.
            </p>

            <div className="flex flex-col gap-3">
              {METODOS.map((m) => (
                <a
                  key={m.label}
                  href={m.href}
                  target={m.label === "WhatsApp" ? "_blank" : undefined}
                  rel={m.label === "WhatsApp" ? "noopener noreferrer" : undefined}
                  className="group flex items-center justify-between gap-4 px-5 py-4"
                  style={{
                    background: "var(--color-paper-pure)",
                    border: "2px solid var(--color-ink)",
                    boxShadow: "4px 4px 0 var(--color-ink)",
                    textDecoration: "none",
                  }}
                >
                  <span className="min-w-0">
                    <span
                      className="block font-mono text-[0.6rem] uppercase tracking-[0.18em] mb-1"
                      style={{ color: "var(--color-river-red-deep)" }}
                    >
                      {m.label}
                    </span>
                    <span
                      className="font-body"
                      style={{ color: "var(--color-ink)", fontWeight: 600, overflowWrap: "anywhere" }}
                    >
                      {m.valor}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="font-sports transition-transform group-hover:translate-x-1"
                    style={{ color: "var(--color-river-red-deep)", fontSize: "1.2rem" }}
                  >
                    →
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* derecha: formulario */}
          <div>
            <p
              className="font-mono text-[0.65rem] uppercase tracking-[0.18em] mb-5"
              style={{ color: "var(--color-neutral-500)" }}
            >
              O dejame un mensaje
            </p>
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}
