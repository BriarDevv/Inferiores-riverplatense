import { notFound } from "next/navigation";
import EditorAutor from "@/components/admin/EditorAutor";
import PageHeader from "@/components/admin/PageHeader";
import { getAutorAdmin, getPerfilActual } from "@/lib/admin/notas-admin";

export const metadata = { title: "Editar firma — Panel" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarFirma({ params }: PageProps) {
  const { id } = await params;
  const [autor, perfil] = await Promise.all([getAutorAdmin(id), getPerfilActual()]);
  if (!autor) notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader overline="Autores" titulo={autor.nombre} />
      <EditorAutor autor={autor} esAdmin={perfil?.rol === "admin"} />
    </div>
  );
}
