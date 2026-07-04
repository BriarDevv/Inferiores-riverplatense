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

  return (
    <div className="max-w-6xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="overline mb-1">Notas</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Editar nota</h1>
        </div>
        <span className={`chip-estado chip-estado-${nota.estado}`}>{nota.estado}</span>
      </header>
      <EditorNota nota={nota} autores={autores} sujetos={sujetos} />
    </div>
  );
}
