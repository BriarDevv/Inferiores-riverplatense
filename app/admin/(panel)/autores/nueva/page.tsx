import { redirect } from "next/navigation";
import EditorAutor from "@/components/admin/EditorAutor";
import { getPerfilActual } from "@/lib/admin/notas-admin";

export const metadata = { title: "Nueva firma — Panel" };

export default async function NuevaFirma() {
  const perfil = await getPerfilActual();
  if (perfil?.rol !== "admin") redirect("/admin/autores");

  return (
    <div className="max-w-4xl">
      <header className="mb-8">
        <p className="overline mb-1">Autores</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold">Nueva firma</h1>
      </header>
      <EditorAutor autor={null} esAdmin />
    </div>
  );
}
