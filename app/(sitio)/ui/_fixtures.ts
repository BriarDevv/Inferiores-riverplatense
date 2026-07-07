import type { Autor, Nota } from "@/lib/types";

/**
 * Piezas de muestra SOLO para el playground /ui (guía visual del cliente).
 * No se publican en el sitio: el contenido real vive en Supabase.
 * Cubren los tres formatos de card (vertical, video horizontal, artículo).
 */
const FIRMA_DEMO: Autor = {
  id: "autor-1",
  nombre: "Pablo Molina",
  rol: "admin",
  avatar_url:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
};

const FIRMA_DEMO_2: Autor = {
  id: "autor-2",
  nombre: "Sofía Domínguez",
  rol: "editor",
  avatar_url:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces",
};

const base = {
  fuente: "propio" as const,
  autor: FIRMA_DEMO,
  sujetos: [],
};

export const NOTAS_DEMO: Nota[] = [
  {
    ...base,
    id: "ui-1",
    slug: "demo-short",
    formato: "short",
    tipo: "entrevista",
    division: "reserva",
    titulo: "Meloni: el debut soñado en el Superclásico",
    bajada: "El delantero categoría 2007 contó cómo vivió el penal decisivo.",
    poster_url:
      "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=800&h=1200&fit=crop",
    duracion_seg: 74,
    quote_overlay: "Debut, penal y Superclásico: todo el mismo día.",
    tags: ["cantera", "reserva"],
    publicada_en: "2026-07-05T19:30:00.000Z",
  },
  {
    ...base,
    id: "ui-2",
    slug: "demo-youtube",
    formato: "youtube",
    tipo: "analisis",
    division: "cuarta",
    titulo: "El plan de la camada 2007-2008: de la Quinta a la Reserva",
    bajada: "Cómo funciona el trasvase de jugadores en el River Camp.",
    fuente: "youtube",
    youtube_id: "",
    poster_url:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1280&h=720&fit=crop",
    duracion_seg: 812,
    tags: ["análisis", "cantera"],
    publicada_en: "2026-07-04T14:00:00.000Z",
  },
  {
    ...base,
    id: "ui-3",
    slug: "demo-perfil",
    formato: "articulo",
    tipo: "perfil",
    division: "reserva",
    titulo: "Quedó libre, volvió y metió el penal que eliminó a Boca",
    bajada:
      "La historia de Santiago Meloni: de quedar libre en Octava a definir un Superclásico de Reserva.",
    poster_url:
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&h=1200&fit=crop",
    tags: ["perfil", "cantera"],
    publicada_en: "2026-07-06T01:00:00.000Z",
    destacada: true,
    primicia: true,
  },
  {
    ...base,
    id: "ui-4",
    slug: "demo-entrevista",
    formato: "articulo",
    tipo: "entrevista",
    division: "quinta",
    titulo: "Cómo se forma un zaguero: charla con la Quinta",
    bajada:
      "El puesto menos glamoroso de la cantera, contado desde adentro del River Camp.",
    poster_url:
      "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=1600&h=1200&fit=crop",
    tags: ["entrevista", "quinta"],
    publicada_en: "2026-07-01T20:00:00.000Z",
  },
  {
    ...base,
    id: "ui-5",
    slug: "demo-cronica",
    formato: "articulo",
    tipo: "cronica",
    division: "reserva",
    titulo: "La Reserva ganó el Superclásico por penales y es finalista",
    bajada: "Cero a cero, 3-1 en la tanda y final ante Racing en Banfield.",
    poster_url:
      "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1600&h=1200&fit=crop",
    tags: ["superclásico", "reserva"],
    publicada_en: "2026-07-05T19:30:00.000Z",
  },
  {
    ...base,
    id: "ui-6",
    slug: "demo-noticia-1",
    formato: "articulo",
    tipo: "noticia",
    division: "reserva",
    titulo: "Día, hora y sede: la final del Proyección será ante Racing",
    bajada: "Viernes 10 de julio a las 12:00 en el Florencio Sola.",
    poster_url:
      "https://images.unsplash.com/photo-1510051640316-cee39563ddab?w=800&h=600&fit=crop",
    tags: ["agenda"],
    publicada_en: "2026-07-06T12:00:00.000Z",
  },
  {
    ...base,
    id: "ui-7",
    slug: "demo-noticia-2",
    formato: "articulo",
    tipo: "noticia",
    division: "sexta",
    titulo: "Ocho juveniles de Quinta y Sexta, citados a la pretemporada de Reserva",
    bajada: "Tienen entre 17 y 18 años y se destacaron todo el año.",
    poster_url:
      "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=800&h=600&fit=crop",
    tags: ["cantera"],
    publicada_en: "2026-07-03T14:00:00.000Z",
    autor: FIRMA_DEMO_2,
  },
  {
    ...base,
    id: "ui-8",
    slug: "demo-noticia-3",
    formato: "articulo",
    tipo: "noticia",
    division: "primera",
    titulo: "Aldosivi en Salta y el arranque del Clausura: la agenda de julio",
    bajada: "River vuelve a la competencia oficial el viernes 17.",
    poster_url:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop",
    tags: ["agenda"],
    publicada_en: "2026-07-04T09:00:00.000Z",
    autor: FIRMA_DEMO_2,
  },
  {
    ...base,
    id: "ui-9",
    slug: "demo-noticia-4",
    formato: "articulo",
    tipo: "noticia",
    division: "primera",
    titulo: "Borré y Beltrán, de vuelta a casa: River cerró las repatriaciones",
    bajada: "Dos delanteros que conocen Núñez, para un ataque en deuda.",
    poster_url:
      "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=800&h=600&fit=crop",
    tags: ["fichaje"],
    publicada_en: "2026-06-27T22:00:00.000Z",
  },
  {
    ...base,
    id: "ui-10",
    slug: "demo-noticia-5",
    formato: "articulo",
    tipo: "noticia",
    division: "novena",
    titulo: "La categoría 2014 jugó la MagiCup ante Milan y Olympiacos",
    bajada: "Los más chicos del semillero, de gira por Florida.",
    poster_url:
      "https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=800&h=600&fit=crop",
    tags: ["infantiles"],
    publicada_en: "2026-05-30T11:00:00.000Z",
    autor: FIRMA_DEMO_2,
  },
  {
    ...base,
    id: "ui-11",
    slug: "demo-noticia-6",
    formato: "articulo",
    tipo: "noticia",
    division: "femenino",
    titulo: "El Femenino renueva a sus históricas hasta diciembre",
    bajada: "Pereyra, López y Birizamberri siguen en el club.",
    poster_url:
      "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=800&h=600&fit=crop",
    tags: ["femenino"],
    publicada_en: "2026-06-24T16:00:00.000Z",
  },
];
