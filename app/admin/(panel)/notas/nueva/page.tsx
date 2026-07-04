import EditorNota from "@/components/admin/EditorNota";
import PageHeader from "@/components/admin/PageHeader";
import { listAutoresAdmin, listSujetosAdmin } from "@/lib/admin/notas-admin";

export const metadata = { title: "Nueva nota — Panel" };

export default async function NuevaNota() {
  const [autores, sujetos] = await Promise.all([listAutoresAdmin(), listSujetosAdmin()]);

  return (
    <div className="max-w-6xl">
      <PageHeader overline="Notas" titulo="Nueva nota" />
      <EditorNota nota={null} autores={autores} sujetos={sujetos} />
    </div>
  );
}
