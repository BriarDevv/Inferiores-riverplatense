import EditorNota from "@/components/admin/EditorNota";
import { listAutoresAdmin, listSujetosAdmin } from "@/lib/admin/notas-admin";

export const metadata = { title: "Nueva nota — Panel" };

export default async function NuevaNota() {
  const [autores, sujetos] = await Promise.all([listAutoresAdmin(), listSujetosAdmin()]);

  return <EditorNota nota={null} autores={autores} sujetos={sujetos} />;
}
