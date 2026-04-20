import type { Autor, Nota, Sujeto } from "./types";

/* =========================================
   AUTORES DEMO
   ========================================= */
const AUTOR_PRINCIPAL: Autor = {
  id: "autor-1",
  nombre: "Periodista River",
  rol: "admin",
  avatar_url:
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop",
};

const AUTOR_COLAB: Autor = {
  id: "autor-2",
  nombre: "Colaborador",
  rol: "editor",
};

/* =========================================
   SUJETOS DEMO
   ========================================= */
const S_JUGADOR_1: Sujeto = {
  tipo: "jugador",
  id: "jug-1",
  nombre: "Franco Mastantuono",
  division: "primera",
};
const S_JUGADOR_2: Sujeto = {
  tipo: "jugador",
  id: "jug-2",
  nombre: "Agustín Ruberto",
  division: "reserva",
};
const S_JUGADOR_3: Sujeto = {
  tipo: "jugador",
  id: "jug-3",
  nombre: "Ian Subiabre",
  division: "reserva",
};
const S_JUGADOR_4: Sujeto = {
  tipo: "jugador",
  id: "jug-4",
  nombre: "Bautista Dadín",
  division: "cuarta",
};
const S_JUGADOR_5: Sujeto = {
  tipo: "jugador",
  id: "jug-5",
  nombre: "Candela Díaz",
  division: "femenino",
};
const S_TECNICO_1: Sujeto = {
  tipo: "tecnico",
  id: "tec-1",
  nombre: "DT de Reserva",
  division: "reserva",
};
const S_EQUIPO_6TA: Sujeto = {
  tipo: "equipo",
  id: "eq-1",
  nombre: "Sexta División",
  division: "sexta",
};

/* =========================================
   NOTAS DEMO (8 con variedad de formatos y divisiones)
   ========================================= */
export const MOCK_NOTAS: Nota[] = [
  {
    id: "n-1",
    slug: "mastantuono-entrevista-exclusiva",
    formato: "short",
    tipo: "entrevista",
    division: "primera",
    titulo: "Mastantuono: «Siempre supe que iba a estar acá»",
    bajada:
      "A los 17, el juvenil que marcó su debut con gol habla del proceso desde la Octava hasta el primer equipo.",
    fuente: "propio",
    video_url: "",
    poster_url:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=1200&fit=crop",
    duracion_seg: 87,
    quote_overlay: "Cuando te ponés esta camiseta, nada es por casualidad.",
    autor: AUTOR_PRINCIPAL,
    sujetos: [S_JUGADOR_1],
    tags: ["debut", "exclusiva", "cantera"],
    publicada_en: "2026-04-17T19:00:00.000Z",
    destacada: true,
  },
  {
    id: "n-2",
    slug: "proyecto-inferiores-2026",
    formato: "youtube",
    tipo: "analisis",
    division: "primera",
    titulo: "El plan de River para sus inferiores: todo lo que cambió",
    bajada:
      "Métodos de entrenamiento, departamento de scouting, vínculo con el primer equipo. Una mirada profunda al proceso.",
    fuente: "youtube",
    youtube_id: "dQw4w9WgXcQ",
    poster_url:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1280&h=720&fit=crop",
    duracion_seg: 847,
    autor: AUTOR_PRINCIPAL,
    sujetos: [],
    tags: ["análisis", "cantera", "proceso"],
    publicada_en: "2026-04-15T14:30:00.000Z",
    capitulos: [
      { tiempo: 0, titulo: "Introducción" },
      { tiempo: 120, titulo: "El scouting territorial" },
      { tiempo: 305, titulo: "Metodología por categoría" },
      { tiempo: 612, titulo: "Puentes con Primera" },
    ],
  },
  {
    id: "n-3",
    slug: "ruberto-debut-reserva",
    formato: "short",
    tipo: "entrevista",
    division: "reserva",
    titulo: "Ruberto, tras su primer doblete en Reserva",
    bajada:
      "«Lo venía soñando desde los 12.» El delantero habla minutos después del partido.",
    fuente: "propio",
    video_url: "",
    poster_url:
      "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=800&h=1200&fit=crop",
    duracion_seg: 62,
    autor: AUTOR_PRINCIPAL,
    sujetos: [S_JUGADOR_2],
    tags: ["reserva", "gol", "entrevista"],
    publicada_en: "2026-04-14T22:15:00.000Z",
  },
  {
    id: "n-4",
    slug: "subiabre-crecer-en-river",
    formato: "short",
    tipo: "perfil",
    division: "reserva",
    titulo: "Subiabre: «Crecí mirando al Pity y a Enzo»",
    bajada: "El extremo repasa su recorrido desde la Novena hasta la Reserva.",
    fuente: "propio",
    video_url: "",
    poster_url:
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&h=1200&fit=crop",
    duracion_seg: 104,
    quote_overlay: "Este club te enseña antes que nada a bancarte el silencio.",
    autor: AUTOR_PRINCIPAL,
    sujetos: [S_JUGADOR_3],
    tags: ["perfil", "reserva", "formación"],
    publicada_en: "2026-04-12T17:00:00.000Z",
  },
  {
    id: "n-5",
    slug: "cronica-final-sexta",
    formato: "youtube",
    tipo: "cronica",
    division: "sexta",
    titulo: "5-0 y al podio: el resumen de Sexta campeón",
    bajada:
      "Goles, reacciones y la arenga del DT en el vestuario después de levantar el trofeo.",
    fuente: "youtube",
    youtube_id: "dQw4w9WgXcQ",
    poster_url:
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1280&h=720&fit=crop",
    duracion_seg: 623,
    autor: AUTOR_COLAB,
    sujetos: [S_EQUIPO_6TA],
    tags: ["sexta", "campeón", "crónica"],
    publicada_en: "2026-04-10T20:30:00.000Z",
  },
  {
    id: "n-6",
    slug: "dt-reserva-despues-de-la-victoria",
    formato: "short",
    tipo: "entrevista",
    division: "reserva",
    titulo: "«Esta Reserva tiene algo distinto»",
    bajada: "El DT, a los pies del vestuario, después del 3-1.",
    fuente: "propio",
    video_url: "",
    poster_url:
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=1200&fit=crop",
    duracion_seg: 71,
    autor: AUTOR_PRINCIPAL,
    sujetos: [S_TECNICO_1],
    tags: ["dt", "reserva", "post-partido"],
    publicada_en: "2026-04-08T23:45:00.000Z",
  },
  {
    id: "n-7",
    slug: "perfil-dadin-el-pibe-de-los-penales",
    formato: "articulo",
    tipo: "perfil",
    division: "cuarta",
    titulo: "El pibe que viene pateando penales desde los 11",
    bajada:
      "Bautista Dadín, volante de Cuarta, se transformó en el designado de las series. Cómo llegó a tener esa sangre fría.",
    contenido: `
Desde los once años, cada vez que River Infantiles llegaba a un desempate, el banco miraba al mismo pibe. Hoy Bautista Dadín tiene dieciséis, juega en Cuarta y carga sobre la espalda una estadística rara: doce penales pateados en torneos oficiales, doce goles.

"No es algo que yo haya pedido", cuenta. "Un día me lo dieron y no lo solté más."

La rutina la armó con el preparador de arqueros de Octava. Cada miércoles, al final del entrenamiento, se quedaba media hora extra. No a pegarle fuerte. A mirar. A entender cómo se movía el arquero antes de que la pelota saliera del pie.
    `,
    fuente: "propio",
    poster_url:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1600&h=2000&fit=crop",
    autor: AUTOR_PRINCIPAL,
    sujetos: [S_JUGADOR_4],
    tags: ["perfil", "cuarta", "penales"],
    publicada_en: "2026-04-05T12:00:00.000Z",
  },
  {
    id: "n-8",
    slug: "femenino-candela-diaz",
    formato: "short",
    tipo: "entrevista",
    division: "femenino",
    titulo: "Candela Díaz: «Queremos ser la primera camada que se quede»",
    bajada: "La juvenil del Femenino habla del salto de categoría.",
    fuente: "propio",
    video_url: "",
    poster_url:
      "https://images.unsplash.com/photo-1486218119243-13883505764c?w=800&h=1200&fit=crop",
    duracion_seg: 93,
    autor: AUTOR_PRINCIPAL,
    sujetos: [S_JUGADOR_5],
    tags: ["femenino", "entrevista", "cantera"],
    publicada_en: "2026-04-02T18:00:00.000Z",
  },
];
