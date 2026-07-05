import { redirect } from "next/navigation";
import EditorAutor from "@/components/admin/EditorAutor";
import PageHeader from "@/components/admin/PageHeader";
import { getPerfilActual } from "@/lib/admin/notas-admin";

export const metadata = { title: "Nueva firma — Panel" };

export default async function NuevaFirma() {
  const perfil = await getPerfilActual();
  if (perfil?.rol !== "admin") redirect("/admin/autores");

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        titulo="Nueva firma"
        descripcion="La identidad pública: así va a aparecer en las notas y en su perfil del sitio."
      />
      <div className="brut-frame-shadow bg-[var(--color-paper-pure)] p-5 sm:p-6 max-w-3xl">
        <EditorAutor autor={null} esAdmin />
      </div>
    </div>
  );
}
