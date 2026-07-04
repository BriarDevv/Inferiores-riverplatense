import EditorNota from "@/components/admin/EditorNota";
import { listAutoresAdmin, listSujetosAdmin } from "@/lib/admin/notas-admin";

export const metadata = { title: "Nueva nota — Panel" };

export default async function NuevaNota() {
  const [autores, sujetos] = await Promise.all([listAutoresAdmin(), listSujetosAdmin()]);

  return (
    <div className="max-w-6xl">
      <header className="mb-8">
        <p className="overline mb-1">Notas</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold">Nueva nota</h1>
      </header>
      <EditorNota nota={null} autores={autores} sujetos={sujetos} />
    </div>
  );
}
