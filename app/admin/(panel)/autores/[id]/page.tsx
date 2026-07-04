import { notFound } from "next/navigation";
import EditorAutor from "@/components/admin/EditorAutor";
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
    <div className="max-w-4xl">
      <header className="mb-8">
        <p className="overline mb-1">Autores</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold">{autor.nombre}</h1>
      </header>
      <EditorAutor autor={autor} esAdmin={perfil?.rol === "admin"} />
    </div>
  );
}
