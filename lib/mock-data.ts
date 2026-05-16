import type { Autor, Nota, Sujeto } from "./types";

/* =========================================
   AUTORES DEMO
   ========================================= */
const AUTOR_PRINCIPAL: Autor = {
  id: "autor-1",
  nombre: "Pablo Molina",
  rol: "admin",
  avatar_url:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
};

const AUTOR_COLAB: Autor = {
  id: "autor-2",
  nombre: "Sofía Domínguez",
  rol: "editor",
  avatar_url:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces",
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
    youtube_id: "",
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
    youtube_id: "",
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
  {
    id: "n-9",
    slug: "octava-campeon-cuyo",
    formato: "articulo",
    tipo: "cronica",
    division: "octava",
    titulo: "Octava: la final que se ganó con un córner ensayado",
    bajada:
      "Cómo se diseñó la jugada de pelota parada que destrabó el partido. El método del entrenador, el rol del scouting de juveniles.",
    contenido: `
La pizarra del vestuario llevaba tres semanas con la misma jugada dibujada. Un córner corto, dos cortinas, el remate en el segundo palo. Lo habían ensayado catorce veces. Catorce.

"Es la primera vez que sale tal cual lo planeamos", dijo el técnico después del partido.

Lo que casi nadie vio: el video que el cuerpo técnico hizo del último entrenamiento se lo mandaron al de Reserva, que llamó al de Primera. Tres días antes de la final, el club entero sabía que ese córner iba a aparecer.
    `,
    fuente: "propio",
    poster_url:
      "https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=1600&h=2000&fit=crop",
    autor: AUTOR_PRINCIPAL,
    sujetos: [],
    tags: ["octava", "campeón", "pelota parada"],
    publicada_en: "2026-03-30T21:00:00.000Z",
  },
  {
    id: "n-10",
    slug: "reserva-doble-jornada",
    formato: "short",
    tipo: "cronica",
    division: "reserva",
    titulo: "El día que la Reserva jugó dos partidos en 24 horas",
    bajada:
      "Decisiones de rotación, el banco como protagonista y la frase del DT que se hizo viral.",
    fuente: "propio",
    video_url: "",
    poster_url:
      "https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=800&h=1200&fit=crop",
    duracion_seg: 78,
    quote_overlay: "El que entra de suplente acá tiene que cambiar el partido.",
    autor: AUTOR_PRINCIPAL,
    sujetos: [S_TECNICO_1],
    tags: ["reserva", "rotación", "doble jornada"],
    publicada_en: "2026-03-27T15:30:00.000Z",
  },
  {
    id: "n-11",
    slug: "quinta-volante-zurdo",
    formato: "short",
    tipo: "perfil",
    division: "quinta",
    titulo: "El volante zurdo que dejó de ser apellido conocido",
    bajada:
      "Llegó al club por su hermano. Hoy es titular indiscutido en Quinta y lo miran desde Europa.",
    fuente: "propio",
    video_url: "",
    poster_url:
      "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=800&h=1200&fit=crop",
    duracion_seg: 112,
    autor: AUTOR_PRINCIPAL,
    sujetos: [],
    tags: ["quinta", "volante", "perfil"],
    publicada_en: "2026-03-24T19:45:00.000Z",
  },
  {
    id: "n-12",
    slug: "scouting-territorial-mendoza",
    formato: "youtube",
    tipo: "analisis",
    division: "primera",
    titulo: "Cómo es la red de scouting de River en el interior",
    bajada:
      "Tres operadores en Cuyo, dos en NEA. Cómo se decide a quién traer y a quién dejar pasar.",
    fuente: "youtube",
    youtube_id: "",
    poster_url:
      "https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?w=1280&h=720&fit=crop",
    duracion_seg: 1124,
    autor: AUTOR_COLAB,
    sujetos: [],
    tags: ["scouting", "interior", "análisis"],
    publicada_en: "2026-03-20T16:00:00.000Z",
    capitulos: [
      { tiempo: 0, titulo: "El mapa territorial" },
      { tiempo: 215, titulo: "El operador de Cuyo" },
      { tiempo: 540, titulo: "Tests de filtro" },
      { tiempo: 870, titulo: "El que no traen" },
    ],
  },
  {
    id: "n-13",
    slug: "septima-defensor-central",
    formato: "articulo",
    tipo: "entrevista",
    division: "septima",
    titulo: "«En River te enseñan a mirar antes de recibir»",
    bajada:
      "El central de Séptima, sobre el método del entrenador de defensa y el salto a Sexta que se viene.",
    contenido: `
"Antes de jugar acá yo recibía la pelota y recién después miraba", dice. "Acá no funciona. Acá tenés que tener la cabeza arriba ya. Si la bajás cinco centésimas, te llegan."

Lo aprendió de un ejercicio que parece simple. Dos compañeros le gritan colores cuando la pelota está en camino. Tiene que decir cuál vio antes de tocarla. Si erra, paga con cinco abdominales. Lo erra mucho.

"Pero ahora ya casi no fallo. Y eso te cambia la cabeza para todo."
    `,
    fuente: "propio",
    poster_url:
      "https://images.unsplash.com/photo-1502810365585-7d2f0c5d6e7d?w=1600&h=2000&fit=crop",
    autor: AUTOR_PRINCIPAL,
    sujetos: [],
    tags: ["séptima", "entrevista", "defensa"],
    publicada_en: "2026-03-17T12:30:00.000Z",
  },
  {
    id: "n-14",
    slug: "femenino-final-anticipo",
    formato: "short",
    tipo: "analisis",
    division: "femenino",
    titulo: "Femenino: lo que se viene en la final",
    bajada:
      "Las claves tácticas del partido. Cómo llega cada equipo, qué jugadora puede romper la paridad.",
    fuente: "propio",
    video_url: "",
    poster_url:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=1200&fit=crop",
    duracion_seg: 96,
    autor: AUTOR_COLAB,
    sujetos: [],
    tags: ["femenino", "final", "análisis"],
    publicada_en: "2026-03-13T20:00:00.000Z",
  },

  /* === NOTICIAS (actualidad breve) === */
  {
    id: "n-15",
    slug: "mastantuono-subiabre-convocados-sub20",
    formato: "articulo",
    tipo: "noticia",
    division: "primera",
    titulo: "Mastantuono y Subiabre, convocados al Sub-20",
    bajada:
      "El cuerpo técnico de la Selección sumó dos jugadores de River a la próxima fecha FIFA.",
    fuente: "propio",
    poster_url:
      "https://images.unsplash.com/photo-1551295022-de5522c94e08?w=1200&h=800&fit=crop",
    autor: AUTOR_PRINCIPAL,
    sujetos: [S_JUGADOR_1, S_JUGADOR_3],
    tags: ["selección", "convocatoria"],
    publicada_en: "2026-05-12T11:00:00.000Z",
  },
  {
    id: "n-16",
    slug: "reserva-gano-clasico-3-1",
    formato: "articulo",
    tipo: "noticia",
    division: "reserva",
    titulo: "Reserva ganó el clásico 3 a 1 en el Monumental",
    bajada:
      "Doblete del 9 y gol del lateral. Resumen, formaciones y la palabra del DT.",
    fuente: "propio",
    poster_url:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&h=800&fit=crop",
    autor: AUTOR_PRINCIPAL,
    sujetos: [],
    tags: ["reserva", "clásico"],
    publicada_en: "2026-05-10T22:30:00.000Z",
  },
  {
    id: "n-17",
    slug: "cuarta-fichaje-cordoba",
    formato: "articulo",
    tipo: "noticia",
    division: "cuarta",
    titulo: "Llegó el delantero cordobés que venían siguiendo desde 2024",
    bajada:
      "Firmó contrato hasta 2028. Lo trae el scouting territorial de Cuyo a pedido del DT de Cuarta.",
    fuente: "propio",
    poster_url:
      "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=1200&h=800&fit=crop",
    autor: AUTOR_COLAB,
    sujetos: [],
    tags: ["cuarta", "fichaje", "scouting"],
    publicada_en: "2026-05-08T16:00:00.000Z",
  },
  {
    id: "n-18",
    slug: "femenino-liga-debut-fecha",
    formato: "articulo",
    tipo: "noticia",
    division: "femenino",
    titulo: "Femenino debuta en la Liga el sábado a las 17",
    bajada:
      "Confirmado el horario y la sede. Una entrenada extra el viernes para terminar de cerrar la lista.",
    fuente: "propio",
    poster_url:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=800&fit=crop",
    autor: AUTOR_COLAB,
    sujetos: [],
    tags: ["femenino", "liga"],
    publicada_en: "2026-05-06T13:30:00.000Z",
  },
  {
    id: "n-19",
    slug: "novena-cambia-dt",
    formato: "articulo",
    tipo: "noticia",
    division: "novena",
    titulo: "Novena: hay nuevo DT después del cierre del torneo",
    bajada:
      "Sale el técnico del último ciclo y asume un ex jugador del club con paso por Reserva en 2018.",
    fuente: "propio",
    poster_url:
      "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=1200&h=800&fit=crop",
    autor: AUTOR_PRINCIPAL,
    sujetos: [],
    tags: ["novena", "DT", "movimientos"],
    publicada_en: "2026-05-04T10:00:00.000Z",
  },
  {
    id: "n-20",
    slug: "sexta-amistoso-internacional",
    formato: "articulo",
    tipo: "noticia",
    division: "sexta",
    titulo: "Sexta jugará un amistoso contra el Atlético de Madrid juvenil",
    bajada:
      "Será en el predio de Ezeiza, a puertas cerradas. La gira de los españoles cierra con este partido.",
    fuente: "propio",
    poster_url:
      "https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=1200&h=800&fit=crop",
    autor: AUTOR_PRINCIPAL,
    sujetos: [S_EQUIPO_6TA],
    tags: ["sexta", "amistoso", "internacional"],
    publicada_en: "2026-05-02T18:20:00.000Z",
  },
  {
    id: "n-21",
    slug: "primera-prestamo-segunda-division",
    formato: "articulo",
    tipo: "noticia",
    division: "primera",
    titulo: "Confirmado: el central va a préstamo a Segunda División de España",
    bajada:
      "Se va por un año, con opción de compra. Lo siguió un veedor durante toda la última fase del torneo local.",
    fuente: "propio",
    poster_url:
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&h=800&fit=crop",
    autor: AUTOR_COLAB,
    sujetos: [],
    tags: ["primera", "préstamo", "europa"],
    publicada_en: "2026-04-29T09:45:00.000Z",
  },
];
