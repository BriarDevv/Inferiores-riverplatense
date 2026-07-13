import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Registra una visita a una nota. El cliente NO puede escribir en nota_visitas
 * (sin políticas): acá usamos service role, con deduplicación por visitante.
 */

const VENTANA_DEDUPE_MIN = 30;

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

/**
 * El origen real de la visita viene del body (document.referrer del cliente):
 * el header Referer del ping es siempre la propia nota, no sirve.
 */
function refererValido(ref: unknown, hostPropio: string): string | null {
  if (typeof ref !== "string" || ref.length === 0) return null;
  try {
    const url = new URL(ref);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.host === hostPropio) return null; // navegación interna = no es fuente
    return ref.slice(0, 300);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let slug: unknown;
  let ref: unknown;
  try {
    ({ slug, ref } = await request.json());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof slug !== "string" || !/^[a-z0-9-]{1,120}$/.test(slug)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = admin();
  const { data: nota } = await supabase
    .from("notas")
    .select("id, estado, publicada_en")
    .eq("slug", slug)
    .maybeSingle();
  // Misma regla que la RLS pública: publicada Y con fecha ya vencida.
  // Sin el chequeo de fecha, este endpoint era un oráculo de notas
  // programadas (slug adivinable → 200 antes de salir).
  if (
    !nota ||
    nota.estado !== "publicada" ||
    !nota.publicada_en ||
    Date.parse(nota.publicada_en) > Date.now()
  ) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  // Hash del visitante: IP + user-agent + día. No guardamos la IP en claro.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const ua = request.headers.get("user-agent") ?? "";
  const dia = new Date().toISOString().slice(0, 10);
  const hash = createHash("sha256").update(`${ip}|${ua}|${dia}`).digest("hex").slice(0, 32);

  // Dedupe: si este visitante ya contó esta nota hace poco, no sumamos de nuevo.
  const desde = new Date(Date.now() - VENTANA_DEDUPE_MIN * 60_000).toISOString();
  const { data: reciente } = await supabase
    .from("nota_visitas")
    .select("id")
    .eq("nota_id", nota.id)
    .eq("hash_visitante", hash)
    .gte("visto_en", desde)
    .limit(1);
  if (reciente && reciente.length > 0) {
    return NextResponse.json({ ok: true, dedupe: true });
  }

  const hostPropio = request.headers.get("host") ?? "";
  const dispositivo = /Mobi|Android/i.test(ua) ? "mobile" : "desktop";
  await supabase.from("nota_visitas").insert({
    nota_id: nota.id,
    hash_visitante: hash,
    referer: refererValido(ref, hostPropio),
    dispositivo,
  });

  return NextResponse.json({ ok: true });
}
