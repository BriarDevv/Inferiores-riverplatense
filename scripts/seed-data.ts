/**
 * Contenido real del sitio (julio 2026). Redacción propia basada en hechos
 * publicados por la prensa (ESPN, Infobae, La Página Millonaria, Soy del Millo,
 * medios partidarios). Las imágenes son de Unsplash (verificadas, con licencia
 * libre) — NO se usan fotos de agencias.
 *
 * Convención del cuerpo (`parrafos`): cada string es un párrafo;
 * "## " al inicio = subtítulo (h2); "> " al inicio = cita destacada.
 * scripts/seed.ts lo convierte a JSON de Tiptap (columna `cuerpo`).
 */
import type { Division, FormatoNota, Sujeto, TipoNota } from "../lib/types";

export interface AutorSeed {
  id: string;
  nombre: string;
  rol: "admin" | "editor";
  foto_url: string;
}

export interface NotaSeed {
  id: string;
  slug: string;
  formato: FormatoNota;
  tipo: TipoNota;
  division: Division;
  titulo: string;
  bajada: string;
  parrafos: string[];
  poster_url: string;
  autor_id: string;
  sujeto_ids: string[];
  tags: string[];
  publicada_en: string;
  destacada?: boolean;
  primicia?: boolean;
}

const img = (id: string) =>
  `https://images.unsplash.com/${id}?w=1600&h=1200&fit=crop&q=80`;

/* =========================================
   AUTORES (firmas reales del proyecto)
   ========================================= */
export const AUTORES_SEED: AutorSeed[] = [
  {
    id: "autor-1",
    nombre: "Pablo Molina",
    rol: "admin",
    foto_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
  },
  {
    id: "autor-2",
    nombre: "Sofía Domínguez",
    rol: "editor",
    foto_url:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces",
  },
];

/* =========================================
   SUJETOS (protagonistas reales)
   ========================================= */
export const SUJETOS_SEED: Sujeto[] = [
  {
    tipo: "jugador",
    id: "suj-meloni",
    slug: "santiago-meloni",
    nombre: "Santiago Meloni",
    division: "reserva",
    bio: "Delantero categoría 2007, cordobés. Quedó libre en Octava, el club lo recuperó y debutó en Reserva metiendo el penal que eliminó a Boca.",
  },
  {
    tipo: "jugador",
    id: "suj-pellegrini",
    slug: "thiago-pellegrini",
    nombre: "Thiago Pellegrini",
    division: "quinta",
    bio: "Zaguero derecho categoría 2008. Su año en Quinta le valió la primera citación a la Reserva de Escudero.",
  },
  {
    tipo: "jugador",
    id: "suj-sayago",
    slug: "juan-sayago",
    nombre: "Juan Sayago",
    division: "sexta",
    bio: "Enganche categoría 2007. Uno de los ocho juveniles citados a la pretemporada de Reserva.",
  },
  {
    tipo: "jugador",
    id: "suj-subiabre",
    slug: "ian-subiabre",
    nombre: "Ian Subiabre",
    division: "primera",
    bio: "Extremo surgido de las formativas. Renovó contrato con cláusula de 30 millones de dólares y pelea por rodaje en Primera.",
  },
  {
    tipo: "jugador",
    id: "suj-ruberto",
    slug: "agustin-ruberto",
    nombre: "Agustín Ruberto",
    division: "primera",
    bio: "Centrodelantero goleador de la cantera. Se recupera de la rotura del ligamento cruzado de su rodilla izquierda.",
  },
  {
    tipo: "jugador",
    id: "suj-spiff",
    nombre: "Jonathan Spiff",
    division: "reserva",
    bio: "Delantero de la Reserva, convocado por Coudet a la pretemporada de Primera en Alicante.",
  },
  {
    tipo: "jugador",
    id: "suj-lucas-silva",
    nombre: "Lucas Silva",
    division: "primera",
    bio: "Juvenil del plantel profesional. Marcó su gol en la goleada a Blooming por Copa Sudamericana.",
  },
  {
    tipo: "jugador",
    id: "suj-kendry-paez",
    nombre: "Kendry Páez",
    division: "primera",
    bio: "Mediapunta ecuatoriano cedido por Chelsea. River rescindió su préstamo a mitad de 2026.",
  },
  {
    tipo: "tecnico",
    id: "suj-escudero",
    nombre: "Marcelo Escudero",
    division: "reserva",
    bio: "Técnico de la Reserva de River.",
  },
  {
    tipo: "tecnico",
    id: "suj-coudet",
    nombre: "Eduardo Coudet",
    division: "primera",
    bio: "Director técnico del primer equipo.",
  },
];

/* =========================================
   NOTAS (20, hechos reales de mayo-julio 2026)
   ========================================= */
export const NOTAS_SEED: NotaSeed[] = [
  {
    id: "nr-01",
    slug: "reserva-superclasico-penales-final-proyeccion",
    formato: "articulo",
    tipo: "cronica",
    division: "reserva",
    titulo: "La Reserva ganó el Superclásico por penales y jugará la final del Proyección",
    bajada:
      "Cero a cero en los noventa y en el alargue, 3-1 en la tanda y un debutante para la historia: Santiago Meloni selló el pase a la final, que será ante Racing.",
    parrafos: [
      "El Superclásico de Reserva se definió como se definen los partidos que nadie quiere perder: sin goles en los noventa minutos, sin goles en el alargue y con los penales como último juez. Ahí, donde la presión pesa más que la técnica, River fue más entero: 3-1 en la tanda y boleto a la final del Torneo Proyección Apertura 2026.",
      "El contexto hacía todavía más difícil la tarea. Marcelo Escudero llegó a la semifinal con ocho bajas —entre convocados a la pretemporada del primer equipo y lesionados— y tuvo que rearmar el plantel con juveniles de Quinta y Sexta. Dos de ellos, Santiago Meloni y Thiago Pellegrini, se estrenaron en la citación. El equipo, lejos de resentirse, sostuvo el cero con orden y compitió de igual a igual cada pelota.",
      "## El penal del césped y el penal del pibe",
      "La tanda tuvo su escena insólita: Tomás Márquez, el encargado del último remate de Boca, la tiró afuera condicionado por el césped levantado en el punto del penal. La superficie irregular en ese sector del área terminó siendo protagonista de la definición.",
      "Después llegó el turno de Meloni. El delantero categoría 2007, que había ingresado en el alargue para jugar sus primeros minutos oficiales en Reserva, agarró la pelota y no tembló: adentro, 3-1 y clasificación. Debut, penal decisivo y Superclásico ganado, todo en la misma tarde.",
      "> Un equipo diezmado, un césped levantado y un debutante con personalidad: la semifinal tuvo todos los condimentos de las tardes que se cuentan durante años.",
      "La final ya tiene rival, día y sede: será ante Racing el viernes 10 de julio a las 12:00 en el estadio Florencio Sola de Banfield. La Reserva de Escudero, remendada con pibes, está a un partido de coronar el semestre.",
    ],
    poster_url: img("photo-1489944440615-453fc2b6a9a9"),
    autor_id: "autor-1",
    sujeto_ids: ["suj-meloni", "suj-pellegrini", "suj-escudero"],
    tags: ["superclásico", "reserva", "torneo proyección", "penales"],
    publicada_en: "2026-07-05T19:30:00.000Z",
    destacada: true,
  },
  {
    id: "nr-02",
    slug: "santiago-meloni-historia-penal-superclasico",
    formato: "articulo",
    tipo: "perfil",
    division: "reserva",
    titulo: "Quedó libre, volvió y metió el penal que eliminó a Boca: la historia de Santiago Meloni",
    bajada:
      "Cordobés, categoría 2007, llegó a River a los 11 años, se fue libre en Octava y el club lo recuperó. Debutó en Reserva en un Superclásico y pateó el último penal. Todavía no firmó contrato profesional.",
    parrafos: [
      "Hay debuts y debuts. El de Santiago Meloni fue de los que no se olvidan: primera citación a la Reserva, ingreso en el alargue de un Superclásico de semifinales con la camiseta 22 y la responsabilidad del último penal de la tanda. La metió, River eliminó a Boca y el pibe que hace no tanto estaba afuera del club terminó abrazado por todos.",
      "La historia viene de lejos. Meloni nació en Córdoba y llegó a River en 2018, con 11 años, para sumarse a Infantiles. Hizo el recorrido habitual de la pirámide hasta que en 2022, jugando en Octava, quedó libre. Para la mayoría, ahí se termina el sueño. Para él fue un paréntesis: el club volvió a buscarlo en 2024 y lo reincorporó a la Sexta División.",
      "## De la dupla con Spiff al estreno soñado",
      "En juveniles compartió dupla de ataque con Jonathan Spiff, hoy convocado a la pretemporada del primer equipo en Alicante. Justamente esas ausencias —las de Spiff y otros siete futbolistas— le abrieron la puerta de la citación ante Boca. Escudero lo hizo entrar a los ocho minutos del alargue por Felipe Esquivel y Meloni casi la mete de cabeza antes de la tanda: conectó un centro desde la derecha que pasó cerca.",
      "Después llegó el penal. El último, el que definía la serie. Lo pateó con una personalidad impropia de un debutante y selló el 3-1 que puso a River en la final del Torneo Proyección.",
      "> Quedar libre a los 15 y definir un Superclásico a los 18: la carrera de Meloni es un recordatorio de que en la cantera los caminos casi nunca son en línea recta.",
      "El detalle que enciende las alarmas en Núñez: Meloni todavía no tiene contrato profesional firmado. Después de una tarde así, es difícil que la dirigencia se tome mucho tiempo para resolverlo.",
    ],
    poster_url: img("photo-1517466787929-bc90951d0974"),
    autor_id: "autor-1",
    sujeto_ids: ["suj-meloni", "suj-escudero"],
    tags: ["cantera", "perfil", "superclásico", "contrato"],
    publicada_en: "2026-07-06T01:00:00.000Z",
    primicia: true,
  },
  {
    id: "nr-03",
    slug: "final-torneo-proyeccion-river-racing-dia-hora-sede",
    formato: "articulo",
    tipo: "noticia",
    division: "reserva",
    titulo: "Día, hora y sede: la Reserva define el Torneo Proyección ante Racing",
    bajada:
      "Tras eliminar a Boca por penales, el equipo de Escudero jugará la final del Apertura 2026 el viernes 10 de julio a las 12:00 en el Florencio Sola de Banfield.",
    parrafos: [
      "Ya está confirmado el escenario de la definición. La final del Torneo Proyección Apertura 2026 entre River y Racing se jugará el viernes 10 de julio a las 12:00 en el estadio Florencio Sola, la cancha de Banfield.",
      "La Reserva de Marcelo Escudero llega a la final después de una semifinal cargada de épica: 0-0 ante Boca en los noventa minutos y en el alargue, y triunfo 3-1 en la tanda de penales, con el debutante Santiago Meloni convirtiendo el remate decisivo.",
      "El desafío extra pasa por el armado del equipo: el plantel viene diezmado por las convocatorias a la pretemporada de Primera y por las lesiones, y Escudero volvió a apoyarse en juveniles de Quinta y Sexta para completar la lista.",
      "Para el semillero, el partido vale doble: un título de Reserva corona el semestre y consolida a una camada 2007-2008 que ya empezó a asomar la cabeza en el profesionalismo.",
    ],
    poster_url: img("photo-1522778119026-d647f0596c20"),
    autor_id: "autor-2",
    sujeto_ids: ["suj-escudero"],
    tags: ["reserva", "torneo proyección", "agenda", "final"],
    publicada_en: "2026-07-06T12:00:00.000Z",
  },
  {
    id: "nr-04",
    slug: "ocho-bajas-reserva-superclasico-semifinal",
    formato: "articulo",
    tipo: "noticia",
    division: "reserva",
    titulo: "Ocho bajas para el Superclásico: la Reserva llegó diezmada a la semifinal",
    bajada:
      "Entre convocatorias a la pretemporada del primer equipo y lesiones, Escudero perdió ocho futbolistas para el cruce con Boca y completó la lista con juveniles.",
    parrafos: [
      "La semifinal del Torneo Proyección encontró a la Reserva de River en su versión más remendada. Ocho futbolistas quedaron afuera de la lista para el Superclásico ante Boca: una parte se sumó a la pretemporada del primer equipo en España —los casos de Jonathan Spiff, Yutiel Susano, Valentín Lucero y Goytia— y el resto quedó al margen por lesión.",
      "Para completar la convocatoria, Marcelo Escudero recurrió a los juveniles. Entre las novedades aparecieron dos estrenos absolutos: el delantero Santiago Meloni, categoría 2007, y el zaguero derecho Thiago Pellegrini, categoría 2008, que venía destacándose en Quinta. También viajó Maximiliano Soria, otro habitué de las citaciones.",
      "La paradoja del calendario: el premio por el buen semestre de varios titulares de la Reserva —el llamado de Coudet— terminó siendo el problema de Escudero para el partido más importante del torneo.",
      "El desenlace, con la clasificación por penales, convirtió la emergencia en oportunidad: los pibes respondieron y la Reserva jugará la final ante Racing con la camada más joven en primer plano.",
    ],
    poster_url: img("photo-1518604666860-9ed391f76460"),
    autor_id: "autor-1",
    sujeto_ids: ["suj-escudero", "suj-spiff"],
    tags: ["reserva", "superclásico", "convocatoria"],
    publicada_en: "2026-07-04T13:00:00.000Z",
  },
  {
    id: "nr-05",
    slug: "ocho-juveniles-citados-escudero-pretemporada-reserva",
    formato: "articulo",
    tipo: "noticia",
    division: "sexta",
    titulo: "Escudero citó a ocho juveniles de Quinta y Sexta para la pretemporada de Reserva",
    bajada:
      "Buratti, Barcia, Susano, Cirilo Pereyra, Salvatierra, Espíndola, Sayago y Gonzalo Pereyra harán su primera pretemporada con la Reserva. Tienen entre 17 y 18 años.",
    parrafos: [
      "El recambio no espera. Marcelo Escudero definió los ocho juveniles de Inferiores que se sumarán a la pretemporada de la Reserva, en busca de rearmar el plantel tras las múltiples bajas del semestre.",
      "La lista completa: los arqueros Ramiro Buratti y Matías Barcia (ambos categoría 2008), el defensor diestro Yutiel Susano (2007), el zurdo Cirilo Pereyra (2008), el también diestro Thiago Salvatierra (2008), el volante central Santiago Espíndola (2008), el enganche Juan Sayago (2007) y el extremo Gonzalo Pereyra (2008).",
      "Todos llegan desde Quinta y Sexta División y se destacaron a lo largo del año en sus respectivas categorías. Tienen entre 17 y 18 años y afrontarán por primera vez una pretemporada completa con el equipo que dirige Escudero.",
      "## Por qué importa",
      "La pretemporada de Reserva es la última estación antes del profesionalismo: ahí se define quiénes pelean por un lugar en el Torneo Proyección del segundo semestre y quiénes quedan a la vista del cuerpo técnico de Primera. Para esta camada 2007-2008, el llamado es la señal de que el club los ve listos para el salto.",
    ],
    poster_url: img("photo-1606925797300-0b35e9d1794e"),
    autor_id: "autor-1",
    sujeto_ids: ["suj-escudero", "suj-sayago"],
    tags: ["cantera", "reserva", "pretemporada", "juveniles"],
    publicada_en: "2026-07-03T14:00:00.000Z",
  },
  {
    id: "nr-06",
    slug: "spiff-susano-lucero-goytia-pretemporada-alicante",
    formato: "articulo",
    tipo: "analisis",
    division: "primera",
    titulo: "Spiff, Susano, Lucero y Goytia: qué significa la pretemporada en Alicante",
    bajada:
      "Coudet se llevó a cuatro juveniles de la Reserva a la gira por España. La lectura de fondo: la vidriera, el roce con los grandes y el mensaje para toda la camada.",
    parrafos: [
      "Cuando un técnico de Primera arma la lista de una gira internacional, cada nombre juvenil que aparece es una declaración de intenciones. Eduardo Coudet incluyó a cuatro futbolistas de la Reserva en la pretemporada de River en Alicante: Jonathan Spiff, Yutiel Susano, Valentín Lucero y Goytia.",
      "El grupo es una radiografía del semestre de la Reserva. Spiff, delantero, viene de ser una de las referencias ofensivas del equipo de Escudero. Susano, defensor diestro categoría 2007, venía de destacarse en juveniles y de ganarse el ascenso a Reserva. Lucero y Goytia completan un lote de perfiles distintos que comparten una misma condición: rendimiento sostenido en el tiempo, no una racha de tres partidos.",
      "## Por qué solo cuatro",
      "La pregunta inevitable es por qué no viajaron más. La respuesta tiene menos misterio del que parece: la Reserva define la final del Torneo Proyección ante Racing y desarmarla por completo hubiese sido castigar al equipo que mejor representó al club en el semestre. El equilibrio entre premiar individualmente y sostener el proyecto colectivo es, quizás, la decisión más delicada de estas fechas.",
      "Para los cuatro que viajaron, la gira es una vidriera doble: entrenar a la par de los profesionales y mostrarse en amistosos internacionales como el que River ya jugó ante Flamengo en Portugal.",
      "> El mensaje hacia abajo es nítido: el camino Reserva–Primera está abierto, y se recorre con rendimiento, no con promesas.",
    ],
    poster_url: img("photo-1551958219-acbc608c6377"),
    autor_id: "autor-1",
    sujeto_ids: ["suj-coudet", "suj-spiff"],
    tags: ["pretemporada", "cantera", "análisis", "primera"],
    publicada_en: "2026-07-02T17:00:00.000Z",
  },
  {
    id: "nr-07",
    slug: "river-flamengo-2-2-amistoso-portugal-driussi",
    formato: "articulo",
    tipo: "cronica",
    division: "primera",
    titulo: "Con dos de Driussi, River empató 2-2 con Flamengo en el arranque de la pretemporada",
    bajada:
      "En el estadio Algarve de Faro, Portugal, el equipo de Coudet igualó su primer amistoso internacional. Driussi marcó a los 7 y a los 37; Lino y Bruno Henrique anotaron para el Mengão.",
    parrafos: [
      "La pretemporada europea de River arrancó con un examen de los buenos: Flamengo, en el estadio Algarve de Faro, al sur de Portugal. Fue 2-2, con un doblete de Sebastián Driussi y pasajes de buen funcionamiento en el primer tiempo.",
      "El arranque fue ideal. A los 7 minutos, Driussi aprovechó un error de Jorginho en la salida y abrió el marcador. Flamengo lo dio vuelta en tres minutos: a los 29, Samuel Lino igualó con un remate desde afuera del área tras una mala salida de River, y a los 32 Bruno Henrique puso el 2-1 con una definición sin opciones para el arquero.",
      "La respuesta llegó rápido. A los 37, Facundo Colidio asistió a Driussi para el 2-2 definitivo, el segundo del punta en la tarde.",
      "## Lo que deja el ensayo",
      "Más allá del resultado, el amistoso —jugado en plena ventana del Mundial— sirvió para que Coudet empiece a probar la estructura del equipo que afrontará la Copa Argentina y el Clausura. También sumaron minutos los juveniles que viajaron a la gira, parte del premio por el semestre de la Reserva.",
      "El calendario que viene no da respiro: Aldosivi por Copa Argentina el 17 de julio en Salta y el debut en el Torneo Clausura ante Barracas Central el 25, en el Monumental.",
    ],
    poster_url: img("photo-1560272564-c83b66b1ad12"),
    autor_id: "autor-1",
    sujeto_ids: ["suj-coudet"],
    tags: ["amistoso", "pretemporada", "primera"],
    publicada_en: "2026-07-03T23:30:00.000Z",
  },
  {
    id: "nr-08",
    slug: "agenda-julio-copa-argentina-aldosivi-clausura",
    formato: "articulo",
    tipo: "noticia",
    division: "primera",
    titulo: "Aldosivi en Salta y el arranque del Clausura: la agenda de julio",
    bajada:
      "River vuelve a la competencia oficial el viernes 17 por Copa Argentina y una semana después debuta en el Torneo Clausura ante Barracas Central en el Monumental.",
    parrafos: [
      "Con la pretemporada en marcha, ya está definido el calendario del regreso. El primer compromiso oficial del semestre será por los 16avos de la Copa Argentina: River enfrentará a Aldosivi el viernes 17 de julio a las 21:45 en el estadio Padre Ernesto Martearena de Salta.",
      "Ocho días más tarde arranca el Torneo Clausura 2026 de la Liga Profesional. El debut será como local, ante Barracas Central, el sábado 25 de julio a las 19:15 en el Más Monumental. En la segunda fecha, River visitará a Gimnasia el miércoles 29 a las 19:15 en el estadio Juan Carmelo Zerillo de La Plata.",
      "En paralelo, el club inició el proceso para que los socios puedan mantener sus ubicaciones en el estadio de cara al nuevo torneo, un trámite que se repite en cada semestre de alta demanda.",
      "El objetivo es claro: después de perder la final del Apertura ante Belgrano, el Clausura y las copas son la vía para que el semestre termine con un título en Núñez.",
    ],
    poster_url: img("photo-1510051640316-cee39563ddab"),
    autor_id: "autor-2",
    sujeto_ids: [],
    tags: ["agenda", "copa argentina", "clausura", "primera"],
    publicada_en: "2026-07-04T09:00:00.000Z",
  },
  {
    id: "nr-09",
    slug: "mercado-river-otamendi-arambarri-correa-analisis",
    formato: "articulo",
    tipo: "analisis",
    division: "primera",
    titulo: "Otamendi, Arambarri y la ofensiva por Correa: cómo se está armando el River de Coudet",
    bajada:
      "Jerarquía libre de costo, siete millones por un volante uruguayo y una negociación abierta con Tigres. El mapa completo del mercado de pases millonario.",
    parrafos: [
      "El mercado de pases de River tiene una lógica reconocible: jerarquía inmediata para competir ya, sin resignar la apuesta por la cantera. Las tres operaciones que ordenan el semestre lo muestran con claridad.",
      "La primera es Nicolás Otamendi, que llegó libre desde Benfica. A su edad, el central no viene a correr carreras de cien metros: viene a ordenar la última línea, a subir el estándar de los entrenamientos y a aportar la experiencia de una década de élite europea y una selección campeona del mundo.",
      "La segunda es Mauro Arambarri. Por el volante uruguayo, River pagó cerca de siete millones de dólares al Getafe de España. Es el refuerzo estructural del mediocampo: recuperación, conducción y oficio en una zona donde el equipo sufrió durante el Apertura.",
      "## El gol, la cuenta pendiente",
      "El tercer frente es el ofensivo. Giovanni Simeone ya tiene acuerdo de palabra para sumarse, y la dirigencia mantiene abierta la negociación por Ángel Correa: Tigres de México pide 15 millones de dólares por su transferencia. A eso se suman las vueltas ya encaminadas de Rafael Santos Borré y Lucas Beltrán, dos delanteros que conocen la casa.",
      "> La final perdida ante Belgrano dejó una lección: al equipo le faltó gol en los momentos calientes. Todo el mercado apunta a corregir exactamente eso.",
      "La contracara del ingreso de nombres pesados es el desafío de siempre: que la llegada de jerarquía no tape la salida natural de los pibes. Con cuatro juveniles en la gira de Alicante, por ahora la balanza se mantiene.",
    ],
    poster_url: img("photo-1587329310686-91414b8e3cb7"),
    autor_id: "autor-1",
    sujeto_ids: ["suj-coudet"],
    tags: ["fichaje", "traspaso", "mercado", "análisis"],
    publicada_en: "2026-06-28T14:00:00.000Z",
  },
  {
    id: "nr-10",
    slug: "borre-beltran-regresos-cerrados-river",
    formato: "articulo",
    tipo: "noticia",
    division: "primera",
    titulo: "Borré y Beltrán, de vuelta a casa: River cerró las dos repatriaciones",
    bajada:
      "El club selló los regresos de Rafael Santos Borré y Lucas Beltrán, dos delanteros formados o consagrados en Núñez, para reforzar un ataque que quedó en deuda.",
    parrafos: [
      "River sacudió el mercado con dos operaciones de fuerte carga simbólica: cerró las vueltas de Rafael Santos Borré y Lucas Beltrán. Los dos delanteros regresan al club después de sus pasos por el fútbol europeo y sudamericano.",
      "Borré vuelve a ponerse la banda tras su etapa más gloriosa en el club, donde fue pieza clave del ciclo ganador anterior. Beltrán, formado en la cantera de Núñez, regresa después de su experiencia en Italia, adonde había partido tras consolidarse en Primera.",
      "Las repatriaciones se suman a un mercado ambicioso que ya incluyó a Nicolás Otamendi y Mauro Arambarri, y que mantiene negociaciones abiertas por Giovanni Simeone y Ángel Correa.",
      "La búsqueda es evidente: goles. La final del Apertura perdida ante Belgrano expuso la falta de peso ofensivo en los partidos decisivos, y la dirigencia respondió con nombres que no necesitan adaptación al mundo River.",
    ],
    poster_url: img("photo-1517927033932-b3d18e61fb3a"),
    autor_id: "autor-2",
    sujeto_ids: [],
    tags: ["fichaje", "traspaso", "mercado"],
    publicada_en: "2026-06-27T22:00:00.000Z",
  },
  {
    id: "nr-11",
    slug: "belgrano-river-3-2-final-apertura-kempes",
    formato: "articulo",
    tipo: "cronica",
    division: "primera",
    titulo: "Del sueño de la 39 al golpe del Kempes: Belgrano dio vuelta la final y River perdió 3-2",
    bajada:
      "River ganaba 2-1 con goles de Colidio y Galván hasta los 83 minutos. Un doblete de Nicolás Fernández en el cierre le dio a Belgrano el primer título de su historia.",
    parrafos: [
      "Hay derrotas que duelen por el resultado y otras que duelen por la forma. La final del Torneo Apertura 2026 en el Kempes fue de las segundas: River la ganaba 2-1 a los 83 minutos y la perdió 3-2, con dos goles de Nicolás Fernández en el tramo final. Belgrano gritó campeón por primera vez en su historia en la máxima categoría.",
      "El partido había arrancado según el plan. A los 18 minutos, Facundo Colidio abrió el marcador y encaminó la ilusión de la 39ª estrella. Belgrano empató a los 26 por medio de Morales, pero River retomó la ventaja a los 60 con el gol de Galván y controló el trámite durante buena parte del segundo tiempo.",
      "## Cinco minutos fatales",
      "Todo se derrumbó en el cierre. A los 83, Fernández igualó de penal. A los 88, el mismo Fernández conectó una volea para el 3-2 definitivo y desató la locura cordobesa. River, que había hecho el desgaste de toda la final, se quedó sin respuestas en los minutos donde se definen los títulos.",
      "> Una final apasionante, cargada de polémica y con un final cruel: River tuvo el título en la mano durante 83 minutos y lo perdió en cinco.",
      "El golpe del Kempes marcó el resto del semestre: explica la agresividad del mercado de pases, la búsqueda de gol y la necesidad de que el Clausura devuelva rápido lo que el Apertura negó en el último suspiro.",
    ],
    poster_url: img("photo-1431324155629-1a6deb1dec8d"),
    autor_id: "autor-1",
    sujeto_ids: ["suj-coudet"],
    tags: ["final", "apertura", "primera"],
    publicada_en: "2026-05-25T00:30:00.000Z",
  },
  {
    id: "nr-12",
    slug: "columna-semestre-final-perdida-camada-que-empuja",
    formato: "articulo",
    tipo: "columna",
    division: "primera",
    titulo: "Lo que dejó el semestre: una final que dolió y una camada que empuja desde abajo",
    bajada:
      "La foto es la derrota del Kempes. La película es otra: una Reserva finalista, ocho juveniles citados, cuatro pibes en Alicante y un debutante que definió un Superclásico.",
    parrafos: [
      "Si uno mira solo la foto, el semestre de River fue la final perdida ante Belgrano: 2-1 arriba a los 83, 3-2 abajo a los 88, y un título que se escurrió en cinco minutos. Es una foto real y hay que hacerse cargo. Pero los semestres, como las canteras, se miden en película.",
      "Y la película cuenta otra cosa. La Reserva de Escudero llegó a la final del Torneo Proyección eliminando a Boca por penales, con un plantel al que le faltaban ocho futbolistas. Coudet se llevó a cuatro juveniles a la pretemporada de Alicante. Escudero citó a otros ocho de Quinta y Sexta para rearmar su equipo. Y un pibe que había quedado libre en Octava, Santiago Meloni, debutó en un Superclásico y metió el penal de la clasificación.",
      "## El club de los dos relojes",
      "River vive con dos relojes: el de la Primera, que exige títulos cada seis meses, y el del semillero, que trabaja con plazos de años. El mercado de pases —Otamendi, Arambarri, las vueltas de Borré y Beltrán— responde al primer reloj. La camada 2007-2008 responde al segundo.",
      "El riesgo de siempre es que un reloj tape al otro: que la urgencia por la 39 congele el recambio, o que la fe ciega en los pibes deje al equipo corto en las finales. El semestre que termina sugiere que, por ahora, los dos relojes conviven.",
      "> La final se perdió en el Kempes. El futuro, mientras tanto, se sigue ganando en el River Camp.",
    ],
    poster_url: img("photo-1577223625816-7546f13df25d"),
    autor_id: "autor-1",
    sujeto_ids: ["suj-escudero", "suj-coudet"],
    tags: ["columna", "balance", "cantera"],
    publicada_en: "2026-07-06T12:30:00.000Z",
  },
  {
    id: "nr-13",
    slug: "ruberto-operacion-exitosa-recuperacion",
    formato: "articulo",
    tipo: "noticia",
    division: "primera",
    titulo: "Operación exitosa: Ruberto inicia una recuperación de siete a ocho meses",
    bajada:
      "El delantero fue intervenido por la rotura del ligamento cruzado anterior de su rodilla izquierda. Su contrato con River corre hasta diciembre de 2027.",
    parrafos: [
      "Agustín Ruberto fue operado con éxito de la rotura del ligamento cruzado anterior de la rodilla izquierda. La intervención se realizó este lunes y en el club ya piensan en la etapa que viene: una rehabilitación intensiva que demandará entre siete y ocho meses.",
      "El calendario, con ese plazo, es cruel pero claro: el centrodelantero se perderá lo que resta de 2026 y recién estaría en condiciones de volver a competir a comienzos del año próximo.",
      "La lesión encontró a Ruberto en un momento de poca participación: venía quedando fuera de las listas de convocados del primer equipo, incluso en compromisos de Copa Sudamericana. La rotura del cruzado interrumpe la pelea por recuperar terreno.",
      "El club, en paralelo, mantiene la calma contractual: el vínculo de Ruberto corre hasta diciembre de 2027, un plazo que le da margen para completar la recuperación sin presiones y volver a mostrarse.",
      "> Para un goleador de cantera, el cruzado es la prueba más dura. La buena noticia es que el reloj corre a favor: tiempo y contrato para volver bien.",
    ],
    poster_url: img("photo-1579952363873-27f3bade9f55"),
    autor_id: "autor-1",
    sujeto_ids: ["suj-ruberto"],
    tags: ["lesión", "recuperación", "cantera"],
    publicada_en: "2026-05-26T18:00:00.000Z",
  },
  {
    id: "nr-14",
    slug: "columna-ano-bisagra-ian-subiabre",
    formato: "articulo",
    tipo: "columna",
    division: "primera",
    titulo: "El año bisagra de Ian Subiabre",
    bajada:
      "Renovó con una cláusula de 30 millones, cambió de representante y sin embargo mira varios partidos desde afuera. El extremo vive el semestre más extraño de su carrera.",
    parrafos: [
      "El caso de Ian Subiabre es el de un futbolista al que los papeles le dicen una cosa y las listas de convocados otra. Los papeles: contrato renovado, cláusula de salida de 30 millones de dólares, la valoración de un club que lo blindó como a una joya. Las listas: ausencias como la del partido ante Gimnasia, en la que ni él ni Kendry Páez fueron citados por Coudet.",
      "El extremo formado en el club atraviesa un semestre de poco rodaje. El técnico ha preferido otras variantes ofensivas y Subiabre quedó en un limbo conocido para los pibes de cantera: demasiado valioso para salir, demasiado relegado para crecer.",
      "## El movimiento fuera de la cancha",
      "En medio de ese panorama, Subiabre tomó una decisión llamativa: cambió de representación y pasó a trabajar con Claudio Caniggia. Un movimiento que se lee solo: busca que su carrera deje de flotar.",
      "La cláusula de 30 millones dice cuánto lo valora River. Los minutos dirán cuánto lo necesita. El segundo semestre de 2026, con Clausura, Copa Argentina y un mercado que trajo competencia ofensiva de jerarquía, va a responder la única pregunta importante: si Subiabre se abre paso o si el año que viene esta columna se escribe desde otro club.",
      "> El talento nunca estuvo en discusión. Lo que se discute ahora es el lugar, y esa discusión no admite empates.",
    ],
    poster_url: img("photo-1600679472829-3044539ce8ed"),
    autor_id: "autor-1",
    sujeto_ids: ["suj-subiabre", "suj-coudet"],
    tags: ["columna", "cantera", "primera"],
    publicada_en: "2026-06-20T13:00:00.000Z",
  },
  {
    id: "nr-15",
    slug: "subiabre-renovacion-clausula-30-millones",
    formato: "articulo",
    tipo: "noticia",
    division: "primera",
    titulo: "Subiabre firmó su renovación: cláusula de 30 millones de dólares",
    bajada:
      "El extremo surgido de las formativas extendió su contrato con el club hasta diciembre de 2028. La cláusula lo ubica entre los juveniles más protegidos del plantel.",
    parrafos: [
      "River aseguró a una de sus joyas: Ian Subiabre firmó la renovación de su contrato, que ahora se extiende hasta diciembre de 2028, con una cláusula de salida fijada en 30 millones de dólares.",
      "La cifra no es casual. En un mercado donde los juveniles argentinos salen cada vez más temprano y más caros, el club optó por blindar al extremo con una cláusula que desaliente ofertas oportunistas y obligue a cualquier interesado a sentarse a negociar en serio.",
      "Subiabre, nacido en Comodoro Rivadavia, hizo todo el recorrido de las formativas en Núñez y es considerado uno de los talentos más puros de su camada. La renovación llega en un semestre de poco rodaje en Primera, lo que convierte la firma en una doble apuesta: la del club por el jugador y la del jugador por ganarse el lugar.",
      "Con esta operación, River continúa la política de renovaciones anticipadas para su generación 2005-2008, la misma lógica que aplicó con otros juveniles del plantel profesional.",
    ],
    poster_url: img("photo-1459865264687-595d652de67e"),
    autor_id: "autor-2",
    sujeto_ids: ["suj-subiabre"],
    tags: ["renovación", "contrato", "cantera"],
    publicada_en: "2026-06-05T15:00:00.000Z",
  },
  {
    id: "nr-16",
    slug: "thiago-pellegrini-zaguero-quinta-primera-citacion",
    formato: "articulo",
    tipo: "perfil",
    division: "quinta",
    titulo: "Thiago Pellegrini, el zaguero de la Quinta que se ganó su primera citación en Reserva",
    bajada:
      "Categoría 2008, defensor derecho, una de las dos sorpresas de la lista de Escudero para el Superclásico de semifinales. Su rendimiento en Quinta lo subió de categoría.",
    parrafos: [
      "En la lista de convocados de la Reserva para el Superclásico ante Boca hubo dos nombres que obligaron a los que siguen las formativas a revisar sus apuntes. Uno fue Santiago Meloni. El otro, Thiago Pellegrini: zaguero derecho, categoría 2008, hasta hace nada jugador de Quinta División.",
      "La citación de Pellegrini no fue un capricho de la emergencia, aunque la emergencia —ocho bajas entre pretemporada de Primera y lesiones— le abrió la puerta. Fue la consecuencia de un año de rendimiento sostenido en Quinta, donde se consolidó como una de las referencias defensivas de su categoría.",
      "## Lo que se ve desde afuera",
      "A los zagueros de cantera se los suele evaluar por lo espectacular: el cruce salvador, la salida limpia bajo presión. El caso de Pellegrini va por otro lado: regularidad, concentración y esa condición que los entrenadores de juveniles valoran más que ninguna otra, la de no desentonar cuando lo suben de categoría.",
      "El Superclásico lo encontró en el banco, viviendo desde adentro una definición por penales que terminó en clasificación a la final. Para un 2008, ese roce vale tanto como los minutos: conocer el vestuario, el ritmo y la presión de la Reserva es el primer paso del salto.",
      "Habrá que seguirlo: si sostiene en Reserva lo que mostró en Quinta, el segundo semestre puede encontrarlo peleando un lugar entre los titulares de Escudero.",
    ],
    poster_url: img("photo-1553778263-73a83bab9b0c"),
    autor_id: "autor-1",
    sujeto_ids: ["suj-pellegrini", "suj-escudero"],
    tags: ["perfil", "cantera", "quinta"],
    publicada_en: "2026-07-01T20:00:00.000Z",
  },
  {
    id: "nr-17",
    slug: "magicup-florida-categoria-2014-milan-olympiacos",
    formato: "articulo",
    tipo: "noticia",
    division: "novena",
    titulo: "La categoría 2014 jugó la MagiCup en Florida ante Milan y Olympiacos",
    bajada:
      "Los más chicos del semillero compitieron en el torneo internacional Sub-12 y Sub-13 de Estados Unidos, en un grupo con el club italiano, el griego y Sportmente de Colombia.",
    parrafos: [
      "El semillero también viaja. La categoría 2014 de River —los más chicos de la estructura formativa— participó de la MagiCup, el torneo internacional Sub-12 y Sub-13 que se disputó en Florida, Estados Unidos, entre el 30 de mayo y el 7 de junio.",
      "El sorteo deparó un grupo de nombres mayores: Milan de Italia, Olympiacos de Grecia y Sportmente de Colombia. Rivales de escudo pesado para una camada que recién empieza a asomarse a la competencia internacional.",
      "Más allá de los resultados, la lectura del club es formativa: exponer a los infantiles a rivales de otras escuelas, otros ritmos y otros estilos es parte del método. La experiencia internacional temprana —viajar, convivir, competir— se considera en Núñez tan valiosa como cualquier título de la edad.",
      "La participación en la MagiCup se suma a la política de giras y torneos internacionales que el área de fútbol formativo viene sosteniendo para todas las categorías del River Camp.",
    ],
    poster_url: img("photo-1543351611-58f69d7c1781"),
    autor_id: "autor-2",
    sujeto_ids: [],
    tags: ["infantiles", "torneo internacional", "river camp"],
    publicada_en: "2026-05-30T11:00:00.000Z",
  },
  {
    id: "nr-18",
    slug: "femenino-renovaciones-pereyra-lopez-birizamberri",
    formato: "articulo",
    tipo: "noticia",
    division: "femenino",
    titulo: "El Femenino renueva a sus históricas: Pereyra, López y Birizamberri siguen",
    bajada:
      "Mercedes Pereyra, Andrea López y Carolina Birizamberri extendieron sus contratos hasta diciembre de 2026 y seguirán siendo las referentes del plantel.",
    parrafos: [
      "River aseguró la columna vertebral de su plantel femenino: Mercedes Pereyra, Andrea López y Carolina Birizamberri renovaron sus contratos con el club y seguirán vistiendo la banda hasta diciembre de 2026.",
      "Las tres son mucho más que futbolistas del plantel: son las referentes de un grupo en transición, el puente entre la generación que profesionalizó al fútbol femenino en Núñez y las juveniles que empujan desde las categorías formativas.",
      "El semestre del equipo en el Campeonato de Fútbol Femenino viene siendo irregular, con golpes duros como la caída 3-1 ante Racing. En ese contexto, la continuidad de las históricas aporta lo que las reconstrucciones necesitan: memoria, jerarquía y vestuario.",
      "La agenda inmediata marca el cierre del semestre ante Newell's, mientras el cuerpo técnico define qué juveniles de la estructura formativa femenina se sumarán a la pretemporada del plantel principal.",
    ],
    poster_url: img("photo-1624880357913-a8539238245b"),
    autor_id: "autor-2",
    sujeto_ids: [],
    tags: ["femenino", "renovación", "contrato"],
    publicada_en: "2026-06-24T16:00:00.000Z",
  },
  {
    id: "nr-19",
    slug: "estructura-semillero-river-camp-metodologia",
    formato: "articulo",
    tipo: "analisis",
    division: "cuarta",
    titulo: "Cómo funciona el semillero: la estructura que ordena de la Novena a la Reserva",
    bajada:
      "Gabriel Rodríguez dirige el fútbol formativo y Jonathan La Rosa encabeza el departamento de metodología. Radiografía del sistema detrás de la camada 2007-2008.",
    parrafos: [
      "Cuando un juvenil debuta en un Superclásico o viaja a una pretemporada en España, la tentación es contar la historia individual. Pero detrás de cada nombre hay un sistema, y el de River tiene una arquitectura definida.",
      "La cabeza del área es Gabriel Rodríguez, director del fútbol formativo y juvenil del club. De su estructura depende todo el recorrido: de la Novena a la Cuarta, el paso a la Reserva y la articulación con el primer equipo. En paralelo funciona el departamento de metodología, dirigido por Jonathan La Rosa, que unifica criterios de entrenamiento en todas las categorías: que un volante de Octava y uno de Cuarta entiendan el juego con el mismo lenguaje.",
      "## El calendario como herramienta",
      "La temporada 2026 de juveniles ordena la competencia en bloques dobles: cada fin de semana, Cuarta, Quinta y Sexta juegan en una sede y Séptima, Octava y Novena en la otra, alternando el River Camp con las canchas de los rivales. En junio, por ejemplo, la rueda incluyó cruces con Tigre, Atlético Tucumán e Independiente Rivadavia.",
      "El River Camp, en Ezeiza, es la columna vertebral física del proyecto: todas las categorías entrenan y juegan en el mismo predio, lo que facilita el trasvase de jugadores entre divisiones —el mecanismo que este semestre subió a Meloni, Pellegrini y compañía.",
      "> Los ocho juveniles citados a la pretemporada de Reserva no son un golpe de suerte: son el producto esperable de una pirámide que funciona.",
    ],
    poster_url: img("photo-1526232761682-d26e03ac148e"),
    autor_id: "autor-1",
    sujeto_ids: [],
    tags: ["análisis", "river camp", "metodología", "cantera"],
    publicada_en: "2026-06-02T13:00:00.000Z",
  },
  {
    id: "nr-20",
    slug: "juan-sayago-enganche-sexta-pide-pista",
    formato: "articulo",
    tipo: "perfil",
    division: "sexta",
    titulo: "Juan Sayago: el enganche que pide pista",
    bajada:
      "Categoría 2007, creador de juego en un puesto en extinción. Su año en juveniles lo metió entre los ocho citados a la pretemporada de la Reserva.",
    parrafos: [
      "En tiempos de dobles cincos y extremos a pierna cambiada, el enganche es casi una especie protegida. Por eso, cuando aparece uno que sostiene el puesto a fuerza de rendimiento, en la cantera se lo mira con un cariño especial. Juan Sayago, categoría 2007, es el caso.",
      "Sayago fue una de las figuras del año en las categorías juveniles y su nombre apareció donde tenía que aparecer: en la lista de ocho futbolistas de Quinta y Sexta que Marcelo Escudero citó para hacer su primera pretemporada con la Reserva.",
      "## El salto que viene",
      "El desafío del enganche moderno no es imaginar el pase —eso Sayago lo trae de fábrica— sino sobrevivir a la intensidad: recibir perfilado con menos tiempo, defender hacia adelante, elegir cuándo acelerar. La pretemporada con Reserva es exactamente el laboratorio para medir eso contra futbolistas más grandes y más fuertes.",
      "La camada 2007 ya tiene varios nombres instalados en la conversación. Si el salto de categoría no le pesa, el segundo semestre puede ser el de su consolidación en el Torneo Proyección: minutos, roce y la chance de demostrar que todavía hay lugar para los que juegan con la cabeza levantada.",
    ],
    poster_url: img("photo-1486286701208-1d58e9338013"),
    autor_id: "autor-1",
    sujeto_ids: ["suj-sayago", "suj-escudero"],
    tags: ["perfil", "cantera", "sexta"],
    publicada_en: "2026-07-02T21:00:00.000Z",
  },
  {
    id: "nr-21",
    slug: "river-blooming-3-0-sudamericana-octavos",
    formato: "articulo",
    tipo: "cronica",
    division: "primera",
    titulo: "Goleada a Blooming, punta del grupo y un juvenil en el marcador: River ya está en octavos",
    bajada:
      "3-0 en el Monumental por la última fecha de la Sudamericana, con goles de Maxi Salas, Fausto Vera y el pibe Lucas Silva. Primero con 14 puntos y pasaje directo a octavos de final.",
    parrafos: [
      "River cerró la fase de grupos de la Copa Sudamericana como la había planificado: goleada 3-0 a Blooming en el Monumental, punta del Grupo H con 14 unidades —por encima de Bragantino— y clasificación directa a los octavos de final, sin escala por el repechaje.",
      "La noche tuvo su cuota de suspenso temprano: a los 11 minutos, Maximiliano Salas estrelló un penal en el palo izquierdo y el partido se hizo cuesta arriba durante un rato. El propio Salas se sacó la espina a los 56, cuando abrió el marcador y ordenó la historia. Después llegó el segundo, de Fausto Vera, otra vez desde los doce pasos.",
      "## El detalle que nos importa",
      "El tercero lo firmó Lucas Silva, uno de los juveniles del plantel. En una noche de trámite controlado, el pibe aprovechó sus minutos y cerró la goleada: otro nombre de la cantera que deja su huella en un torneo internacional, la clase de dato que en este sitio no dejamos pasar.",
      "Con el primer puesto asegurado, River evita el playoff y espera en octavos al ganador del repechaje entre los segundos de la Sudamericana y los terceros que bajan de la Libertadores. El sorteo dirá el rival; la fase de grupos ya dijo lo importante: el equipo llegó a la instancia decisiva sin sobresaltos.",
    ],
    poster_url: img("photo-1543326727-cf6c39e8f84c"),
    autor_id: "autor-1",
    sujeto_ids: ["suj-lucas-silva", "suj-coudet"],
    tags: ["sudamericana", "copa", "cantera"],
    publicada_en: "2026-05-28T01:00:00.000Z",
  },
  {
    id: "nr-22",
    slug: "kendry-paez-rescision-prestamo-chelsea",
    formato: "articulo",
    tipo: "noticia",
    division: "primera",
    titulo: "River rescindió el préstamo de Kendry Páez: vuelve al Chelsea después del Mundial",
    bajada:
      "El mediapunta ecuatoriano había llegado en enero, cedido por 18 meses sin cargo y sin opción de compra. La falta de continuidad apuró el final anticipado del vínculo.",
    parrafos: [
      "La aventura de Kendry Páez en Núñez terminó antes de lo previsto. River decidió rescindir de manera anticipada el préstamo del mediapunta ecuatoriano, que una vez concluida la participación de Ecuador en el Mundial deberá volver al Chelsea, dueño de su ficha.",
      "Páez había llegado a fines de enero, en una cesión de 18 meses sin cargo y sin opción de compra, con un plan especial de adaptación acordado a su arribo. La apuesta era clara: darle rodaje sudamericano a una de las promesas más cotizadas del continente mientras maduraba lejos de la vidriera inglesa.",
      "El semestre, sin embargo, fue de menor a menor. El ecuatoriano nunca logró afianzarse como titular y su falta de continuidad —llegó a quedar fuera de convocatorias, como en la visita a Gimnasia— encendió las alarmas en Londres mucho antes de la decisión final. Chelsea ya analiza el próximo destino: la opción que gana fuerza es una cesión al Mechelen de Bélgica.",
      "## La lectura de cantera",
      "Para el proyecto deportivo, el final del préstamo deja una lección y una oportunidad. La lección: los talentos de vitrina ajena solo funcionan si el equipo puede garantizarles minutos. La oportunidad: el lugar de mediapunta que libera Páez es exactamente el territorio por el que pelean los creadores de la casa, de Subiabre para abajo.",
    ],
    poster_url: img("photo-1552667466-07770ae110d0"),
    autor_id: "autor-2",
    sujeto_ids: ["suj-kendry-paez", "suj-coudet"],
    tags: ["préstamo", "traspaso", "mercado"],
    publicada_en: "2026-06-15T17:00:00.000Z",
  },
];
