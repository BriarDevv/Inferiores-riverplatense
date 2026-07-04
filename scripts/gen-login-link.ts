/**
 * Genera un link de acceso al panel SIN pasar por email (evita el rate limit del SMTP).
 * Uso: npx tsx scripts/gen-login-link.ts email@ejemplo.com [origen]
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !secret) {
  throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local");
}

const email = process.argv[2];
const origen = process.argv[3] ?? "http://localhost:3000";
if (!email) throw new Error("Uso: npx tsx scripts/gen-login-link.ts email@ejemplo.com [origen]");

const supabase = createClient(url, secret, { auth: { persistSession: false } });

async function main() {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (error) throw new Error(error.message);
  const tokenHash = data.properties?.hashed_token;
  if (!tokenHash) throw new Error("La API no devolvió hashed_token");
  console.log("Abrí este link para iniciar sesión (vence en ~1 hora, un solo uso):\n");
  console.log(`${origen}/auth/callback?token_hash=${tokenHash}`);
}

main().catch((err) => {
  console.error(`ERROR: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
