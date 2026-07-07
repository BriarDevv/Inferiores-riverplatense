import type { Division, TipoNota } from "./types";

/**
 * Landings SEO: cada división y cada tipo de nota tiene una página estática
 * indexable (/division/[division] y /seccion/[slug]) con copy editorial
 * propio. Este módulo es la fuente de verdad de esas landings: slugs,
 * títulos, meta descriptions e intros visibles.
 */
export interface InfoLanding {
  /** Título del H1 y del <title> (el template agrega "· Inferiores Riverplatense"). */
  titulo: string;
  /** Meta description (lo que se ve en Google). */
  descripcion: string;
  /** Copete editorial visible bajo el título. */
  intro: string;
}

/** Landings por tipo de nota; la clave es el slug público (plural). */
export const SECCIONES_LANDING: Record<string, InfoLanding & { tipo: TipoNota }> = {
  entrevistas: {
    tipo: "entrevista",
    titulo: "Entrevistas de la cantera de River",
    descripcion:
      "Mano a mano con los protagonistas de las inferiores de River Plate: jugadores, técnicos y las voces del semillero de Núñez.",
    intro:
      "Mano a mano con los protagonistas del semillero: jugadores, técnicos y la gente que hace las inferiores de River todos los días.",
  },
  perfiles: {
    tipo: "perfil",
    titulo: "Perfiles de juveniles de River",
    descripcion:
      "Quién es quién en las inferiores de River Plate: historias, recorridos y proyección de los juveniles del semillero.",
    intro:
      "Quién es quién en el semillero: la historia y el recorrido de cada juvenil, de dónde viene y por qué hay que seguirlo.",
  },
  cronicas: {
    tipo: "cronica",
    titulo: "Crónicas de las inferiores de River",
    descripcion:
      "Crónicas de los partidos de las divisiones formativas de River Plate: lo que pasó en la cancha, contado desde adentro.",
    intro:
      "Lo que pasó en la cancha, contado desde adentro: crónicas de los partidos de todas las divisiones del semillero.",
  },
  analisis: {
    tipo: "analisis",
    titulo: "Análisis de la cantera de River",
    descripcion:
      "Análisis táctico y de proyección sobre los equipos y juveniles de las inferiores de River Plate.",
    intro:
      "La mirada más fina sobre el semillero: análisis de equipos, rendimientos y proyección de los juveniles de River.",
  },
  columnas: {
    tipo: "columna",
    titulo: "Columnas de opinión",
    descripcion:
      "Columnas de opinión sobre las inferiores de River Plate: la mirada propia sobre el semillero de Núñez.",
    intro:
      "Opinión con firma: la mirada propia sobre lo que pasa en el semillero, sin el corset de la agenda diaria.",
  },
  noticias: {
    tipo: "noticia",
    titulo: "Noticias de las inferiores de River",
    descripcion:
      "Últimas noticias de las inferiores de River Plate: citaciones, renovaciones, traspasos y novedades del semillero.",
    intro:
      "Citaciones, renovaciones, mercado y todo lo que pasa alrededor del semillero de River, al día.",
  },
};

const SLUG_POR_TIPO = new Map(
  Object.entries(SECCIONES_LANDING).map(([slug, s]) => [s.tipo, slug]),
);

/** URL de la landing de un tipo (ej: perfil → /seccion/perfiles). */
export function hrefTipo(tipo: TipoNota): string {
  const slug = SLUG_POR_TIPO.get(tipo);
  return slug ? `/seccion/${slug}` : `/?tipo=${tipo}`;
}

/** URL de la landing de una división. */
export function hrefDivision(division: Division): string {
  return `/division/${division}`;
}

/** Landings por división. */
export const DIVISIONES_LANDING: Record<Division, InfoLanding> = {
  primera: {
    titulo: "Juveniles de River en Primera",
    descripcion:
      "Debuts, minutos y rendimiento de los juveniles de River en Primera División: el final del recorrido que arranca en la Novena.",
    intro:
      "El punto de llegada de todo el semillero: los pibes que ya entrenan y suman minutos con el plantel profesional. Debuts, actuaciones y cómo se ganaron el lugar.",
  },
  reserva: {
    titulo: "Reserva de River",
    descripcion:
      "Cobertura de la Reserva de River Plate: partidos, torneos, rendimientos y los juveniles que empujan para llegar a Primera.",
    intro:
      "La antesala de Primera. Partidos, torneos y rendimientos del equipo de Reserva, con seguimiento de los nombres que están a un paso del salto.",
  },
  cuarta: {
    titulo: "Cuarta División de River",
    descripcion:
      "Notas, crónicas y seguimiento de la Cuarta División de River Plate, el escalón más alto del fútbol juvenil del club.",
    intro:
      "El escalón más alto del fútbol juvenil: la categoría donde se define quién pega el salto a Reserva. Seguimiento de la Cuarta del semillero.",
  },
  quinta: {
    titulo: "Quinta División de River",
    descripcion:
      "Notas, crónicas y seguimiento de la Quinta División de River Plate: los juveniles del semillero de Núñez.",
    intro:
      "Cobertura de la Quinta División: partidos, nombres propios e historias de una de las categorías centrales del fútbol juvenil de River.",
  },
  sexta: {
    titulo: "Sexta División de River",
    descripcion:
      "Notas, crónicas y seguimiento de la Sexta División de River Plate: los juveniles del semillero de Núñez.",
    intro:
      "Cobertura de la Sexta División: partidos, rendimientos y los proyectos que empiezan a asomar en el semillero de River.",
  },
  septima: {
    titulo: "Séptima División de River",
    descripcion:
      "Notas, crónicas y seguimiento de la Séptima División de River Plate: los juveniles del semillero de Núñez.",
    intro:
      "Cobertura de la Séptima División: la categoría donde muchos pibes juegan sus primeros torneos grandes con la banda roja.",
  },
  octava: {
    titulo: "Octava División de River",
    descripcion:
      "Notas, crónicas y seguimiento de la Octava División de River Plate: los más chicos del fútbol juvenil del club.",
    intro:
      "Cobertura de la Octava División: los primeros años del fútbol juvenil, donde se forma la base de las camadas que vienen.",
  },
  novena: {
    titulo: "Novena División de River",
    descripcion:
      "La puerta de entrada al semillero: notas y seguimiento de la Novena División de River Plate.",
    intro:
      "Donde empieza todo: la primera categoría del recorrido. Los primeros pasos de los chicos que sueñan con llegar al Monumental.",
  },
  femenino: {
    titulo: "Inferiores del femenino de River",
    descripcion:
      "Cobertura de las divisiones formativas del fútbol femenino de River Plate: torneos, jugadoras y proyección.",
    intro:
      "Las divisiones formativas del fútbol femenino de River: torneos, jugadoras en proyección y el crecimiento de la rama en Núñez.",
  },
};
