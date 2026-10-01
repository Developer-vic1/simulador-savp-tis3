export const student = {
  id: "STU-DEMO-01",
  name: "Juan Pérez",
  course: "4to de secundaria",
  bth: "Sistemas Informáticos",
  interest: "Ingeniería de Sistemas",
  query:
    "Quiero conocer qué carreras relacionadas con tecnología son coherentes con mi perfil.",
  attendance: 92,
  activity: "alta",
  periods: [
    {
      name: "1",
      grades: { Matemática: 78, Tecnología: 84, Física: 75, Lenguaje: 72 },
    },
    {
      name: "2",
      grades: { Matemática: 83, Tecnología: 88, Física: 78, Lenguaje: 73 },
    },
    {
      name: "3",
      grades: { Matemática: 86, Tecnología: 91, Física: 80, Lenguaje: 74 },
    },
  ],
  // Cinco reactivos por dimensión. Son respuestas demo observables, no resultados precalculados.
  riasecAnswers: [
    4, 5, 4, 4, 5, 5, 5, 4, 5, 4, 2, 3, 2, 3, 2, 3, 4, 3, 3, 4, 3, 4, 3, 3, 4,
    4, 5, 4, 4, 5,
  ],
};

export const riasecDimensions = ["R", "I", "A", "S", "E", "C"];

export const careerCatalog = [
  [
    "Ingeniería de Sistemas",
    "Tecnología",
    "ICR",
    ["Matemática", "Tecnología"],
    ["Sistemas Informáticos"],
    ["análisis", "programación"],
    "Comunicación técnica",
  ],
  [
    "Ingeniería Informática",
    "Tecnología",
    "IRC",
    ["Matemática", "Tecnología"],
    ["Sistemas Informáticos"],
    ["programación", "sistemas"],
    "Documentación",
  ],
  [
    "Ciencia de Datos",
    "Datos",
    "ICR",
    ["Matemática", "Tecnología"],
    ["Sistemas Informáticos"],
    ["análisis", "datos"],
    "Estadística avanzada",
  ],
  [
    "Ingeniería Electrónica",
    "Tecnología",
    "RIC",
    ["Matemática", "Física"],
    ["Electrónica"],
    ["circuitos", "resolución"],
    "Electrónica práctica",
  ],
  [
    "Telecomunicaciones",
    "Tecnología",
    "RIC",
    ["Matemática", "Física"],
    ["Electrónica"],
    ["redes", "señales"],
    "Redes",
  ],
  [
    "Ingeniería Civil",
    "Ingeniería",
    "RIC",
    ["Matemática", "Física"],
    ["Construcción Civil"],
    ["diseño", "estructuras"],
    "Dibujo técnico",
  ],
  [
    "Administración",
    "Gestión",
    "ECS",
    ["Matemática", "Lenguaje"],
    ["Contabilidad"],
    ["gestión", "organización"],
    "Gestión financiera",
  ],
  [
    "Contaduría",
    "Gestión",
    "CIE",
    ["Matemática"],
    ["Contabilidad"],
    ["contabilidad", "auditoría"],
    "Normativa contable",
  ],
  [
    "Psicología",
    "Social",
    "SIA",
    ["Lenguaje"],
    [],
    ["escucha", "investigación"],
    "Métodos de investigación",
  ],
  [
    "Educación",
    "Social",
    "SAE",
    ["Lenguaje"],
    [],
    ["docencia", "comunicación"],
    "Didáctica",
  ],
  [
    "Diseño",
    "Arte",
    "AIR",
    ["Tecnología", "Lenguaje"],
    ["Diseño Gráfico"],
    ["diseño", "creatividad"],
    "Portafolio",
  ],
  [
    "Gastronomía",
    "Servicios",
    "RAE",
    ["Tecnología"],
    ["Gastronomía"],
    ["producción", "servicio"],
    "Técnicas culinarias",
  ],
].map(
  ([name, area, riasec, subjects, bth, occupations, reinforcement], index) => ({
    id: `CAR-${String(index + 1).padStart(2, "0")}`,
    name,
    area,
    riasec: [...riasec],
    subjects,
    bth,
    occupations,
    reinforcement,
  }),
);

// Mini corpus local. La pantalla informa el tamaño real de este corpus de demostración.
export const documents = [
  {
    id: "DOC-01",
    source: "Catálogo académico demo",
    title: "Ingeniería de Sistemas",
    verified: false,
    text: "Ingeniería de Sistemas integra tecnología, análisis, programación, bases de datos y resolución de problemas tecnológicos.",
  },
  {
    id: "DOC-02",
    source: "Catálogo académico demo",
    title: "Ciencia de Datos",
    verified: false,
    text: "Ciencia de Datos utiliza matemática, estadística, programación y análisis de información.",
  },
  {
    id: "DOC-03",
    source: "Guía ocupacional demo",
    title: "Desarrollo de software",
    verified: false,
    text: "El desarrollo de software requiere pensamiento analítico, comunicación técnica y trabajo en equipo.",
  },
  {
    id: "DOC-04",
    source: "Guía ocupacional demo",
    title: "Ingeniería Electrónica",
    verified: false,
    text: "Ingeniería Electrónica combina física, circuitos, matemática y sistemas de control.",
  },
  {
    id: "DOC-05",
    source: "Plan de estudio demo",
    title: "Perfil de Informática",
    verified: false,
    text: "La informática estudia programación, redes, sistemas y gestión de datos.",
  },
];

export const scenarios = [
  {
    id: "SIM-01",
    question:
      "Una consulta de 5.000 registros tarda demasiado. ¿Qué revisarías primero?",
    choices: [
      {
        text: "Cambiar la interfaz",
        effects: { diseño: "observado" },
        note: "La interfaz podría mejorar la experiencia, pero no explica el tiempo de consulta.",
      },
      {
        text: "Examinar consultas y acceso a datos",
        effects: { análisis: "fuerte", resolución: "fuerte" },
        note: "Se investigan primero los puntos donde ocurre la demora.",
      },
      {
        text: "Comprar equipos",
        effects: { decisión: "por reforzar" },
        note: "Conviene medir el cuello de botella antes de invertir.",
      },
    ],
  },
  {
    id: "SIM-02",
    question:
      "Tu equipo discrepa sobre el alcance de una aplicación. ¿Cómo procedes?",
    choices: [
      {
        text: "Definir requisitos con el equipo y usuarios",
        effects: { comunicación: "fuerte", colaboración: "fuerte" },
        note: "Se hace explícito el problema y se acuerdan criterios.",
      },
      {
        text: "Programar sin conversar",
        effects: { comunicación: "por reforzar" },
        note: "Falta validar el alcance con las personas implicadas.",
      },
      {
        text: "Postergar la decisión",
        effects: { decisión: "por reforzar" },
        note: "El problema sigue sin resolverse.",
      },
    ],
  },
  {
    id: "SIM-03",
    question:
      "Encuentras datos personales expuestos durante una prueba. ¿Qué haces?",
    choices: [
      {
        text: "Reportar y restringir el acceso",
        effects: { ética: "fuerte", decisión: "fuerte" },
        note: "Protege a las personas y documenta el incidente.",
      },
      {
        text: "Ignorarlos porque son de prueba",
        effects: { ética: "por reforzar" },
        note: "Los datos expuestos requieren atención aunque estén en un entorno de prueba.",
      },
      {
        text: "Compartir una captura pública",
        effects: { ética: "por reforzar" },
        note: "La difusión aumenta la exposición.",
      },
    ],
  },
];
