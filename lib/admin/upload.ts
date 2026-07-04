"use client";

import { createSupabaseBrowser } from "@/lib/supabase/client";

const MAX_MB = 5;

/**
 * Sube una imagen al bucket `imagenes` (RLS: solo staff) y devuelve la URL pública.
 * @param carpeta "posters" | "autores"
 */
export async function subirImagen(file: File, carpeta: "posters" | "autores"): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo tiene que ser una imagen (JPG, PNG o WebP).");
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    throw new Error(`La imagen no puede pesar más de ${MAX_MB} MB.`);
  }

  const supabase = createSupabaseBrowser();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const base = file.name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40);
  const path = `${carpeta}/${base}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from("imagenes").upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
  });
  if (error) throw new Error(`No se pudo subir la imagen: ${error.message}`);

  const { data } = supabase.storage.from("imagenes").getPublicUrl(path);
  return data.publicUrl;
}
