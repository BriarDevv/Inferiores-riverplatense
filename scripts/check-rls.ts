import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

async function main() {
const { count } = await supabase.from("notas").select("*", { count: "exact", head: true });
console.log(`anon ve ${count} notas`);

const upd = await supabase.from("notas").update({ titulo: "hack" }).eq("id", "n-1").select();
console.log(`update anon: ${upd.error || upd.data?.length === 0 ? "BLOQUEADO OK" : "FALLO DE SEGURIDAD"}`);

const ins = await supabase.from("autores").insert({ id: "hack", nombre: "hack", slug: "hack" });
console.log(`insert autor anon: ${ins.error ? "BLOQUEADO OK" : "FALLO DE SEGURIDAD"}`);

const vis = await supabase.from("nota_visitas").select("*").limit(1);
console.log(`leer visitas anon: ${vis.error || vis.data?.length === 0 ? "BLOQUEADO OK" : "FALLO DE SEGURIDAD"}`);
}
main();
