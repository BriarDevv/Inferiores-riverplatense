import { notFound } from "next/navigation";
import EditorNota from "@/components/admin/EditorNota";
import { getNotaAdmin, listAutoresAdmin, listSujetosAdmin } from "@/lib/admin/notas-admin";

export const metadata = { title: "Editar nota — Panel" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarNota({ params }: PageProps) {
  const { id } = await params;
  const [nota, autores, sujetos] = await Promise.all([
    getNotaAdmin(id),
    listAutoresAdmin(),
    listSujetosAdmin(),
  ]);
  if (!nota) notFound();

  return <EditorNota nota={nota} autores={autores} sujetos={sujetos} />;
}
