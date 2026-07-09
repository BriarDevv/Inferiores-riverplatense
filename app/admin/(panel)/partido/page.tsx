import PageHeader from "@/components/admin/PageHeader";
import FormPartido from "@/components/admin/FormPartido";
import {
  fechaLocalBuenosAires,
  formatearFechaPartido,
  getProximoPartido,
  partidoVigente,
} from "@/lib/partido";

export const metadata = { title: "Próximo partido — Panel" };

export default async function AdminPartido() {
  const partido = await getProximoPartido();

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        titulo="Próximo partido"
        descripcion="Lo que anuncia la barra roja del sitio, arriba de todo. Cargalo cuando haya fecha confirmada: se muestra hasta unas horas después del partido y ahí desaparece solo (la barra vuelve a mostrar la última nota). No hace falta borrarlo."
      />
      {/* key = los datos del registro: si el partido cambia (otro lo editó,
          router.refresh tras guardar), el form se remonta con lo nuevo en vez
          de quedarse con la copia inicial en su estado. */}
      <FormPartido
        key={
          partido
            ? `${partido.rival}|${partido.division}|${partido.fecha}|${partido.torneo ?? ""}`
            : "vacio"
        }
        partido={partido}
        vigente={partido ? partidoVigente(partido.fecha) : false}
        fechaLocal={partido ? fechaLocalBuenosAires(partido.fecha) : ""}
        fechaLabel={partido ? formatearFechaPartido(partido.fecha) : ""}
      />
    </div>
  );
}
