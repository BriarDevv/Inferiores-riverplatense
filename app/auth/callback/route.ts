import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

/** Canjea el código del magic link por una sesión y valida que el usuario tenga profile. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user!.id)
        .single();
      if (profile) return NextResponse.redirect(`${origin}/admin`);
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/admin/login?error=sin-acceso`);
    }
  }
  return NextResponse.redirect(`${origin}/admin/login?error=link-invalido`);
}
