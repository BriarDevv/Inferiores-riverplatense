import { notFound } from "next/navigation";
import EditorAutor from "@/components/admin/EditorAutor";
import PageHeader from "@/components/admin/PageHeader";
import PerfilCompleto from "@/components/admin/PerfilCompleto";
import NotasDeFirma from "@/components/admin/NotasDeFirma";
import { getAutorAdmin, getPerfilActual, listNotasAdmin } from "@/lib/admin/notas-admin";
import { getVisitasPorNota } from "@/lib/admin/stats";

export const metadata = { title: "Legajo de la firma — Panel" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarFirma({ params }: PageProps) {
  const { id } = await params;
  const [autor, perfil, notas, visitas] = await Promise.all([
    getAutorAdmin(id),
    getPerfilActual(),
    listNotasAdmin({ autor_id: id }),
    getVisitasPorNota(),
  ]);
  if (!autor) notFound();

  const publicadas = notas.filter((n) => n.estado === "publicada").length;
  const borradores = notas.filter((n) => n.estado === "borrador").length;
  const visitasTotales = notas.reduce((acc, n) => acc + (visitas.get(n.id)?.total ?? 0), 0);

  const marcador = [
    { valor: publicadas, label: "Publicadas" },
    { valor: borradores, label: "Borradores" },
    { valor: visitasTotales, label: "Visitas" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader titulo={autor.nombre} descripcion={autor.rol_publico ?? "Colaborador"}>
        <a
          href={`/autor/${autor.slug}`}
          target="_blank"
          rel="noreferrer"
          className="brut-cta-ink px-4 py-2.5 font-sports uppercase tracking-[0.14em] text-sm inline-block"
        >
          Ver perfil público ↗
        </a>
      </PageHeader>

      {/* Tira del legajo: la firma en números */}
      <div className="brut-frame bg-[var(--color-paper-pure)] px-5 py-4 mb-6 flex flex-wrap items-center gap-x-8 gap-y-3">
        {autor.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={autor.avatar_url}
            alt=""
            className="w-14 h-14 shrink-0 rounded-full object-cover border-2 border-[var(--color-ink)]"
          />
        ) : (
          <span
            aria-hidden
            className="w-14 h-14 shrink-0 rounded-full bg-[var(--color-river-red)] text-white font-sports text-xl flex items-center justify-center"
          >
            {autor.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </span>
        )}
        <PerfilCompleto autor={autor} />
        <span className="flex-1" />
        <div className="flex items-center gap-6">
          {marcador.map((m) => (
            <div key={m.label} className="text-center">
              <p className="font-sports text-2xl leading-none text-[var(--color-river-red)] tabular-nums">
                {m.valor}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-black/45 mt-1">
                {m.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="brut-frame-shadow bg-[var(--color-paper-pure)] p-5 sm:p-6">
          <EditorAutor autor={autor} esAdmin={perfil?.rol === "admin"} />
        </div>
        <NotasDeFirma autorId={autor.id} notas={notas} visitas={visitas} />
      </div>
    </div>
  );
}
