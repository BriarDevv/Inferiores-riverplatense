import { redirect } from "next/navigation";
import EditorAutor from "@/components/admin/EditorAutor";
import PageHeader from "@/components/admin/PageHeader";
import { getPerfilActual } from "@/lib/admin/notas-admin";

export const metadata = { title: "Nueva firma — Panel" };

export default async function NuevaFirma() {
  const perfil = await getPerfilActual();
  if (perfil?.rol !== "admin") redirect("/admin/autores");

  return (
    <div className="max-w-4xl">
      <PageHeader overline="Autores" titulo="Nueva firma" />
      <EditorAutor autor={null} esAdmin />
    </div>
  );
}
