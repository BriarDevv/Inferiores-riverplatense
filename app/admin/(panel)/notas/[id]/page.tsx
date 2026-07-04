import { notFound } from "next/navigation";
import EditorNota from "@/components/admin/EditorNota";
import PageHeader from "@/components/admin/PageHeader";
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

  return (
    <div className="max-w-6xl">
      <PageHeader overline="Notas" titulo="Editar nota">
        <span className={`chip-estado chip-estado-${nota.estado}`}>{nota.estado}</span>
      </PageHeader>
      <EditorNota nota={nota} autores={autores} sujetos={sujetos} />
    </div>
  );
}
