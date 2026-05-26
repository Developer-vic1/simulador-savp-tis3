import { academicIndicators, professionalSimulation } from "../data/academicIndicators.js";
import { professionalAreas } from "../data/graphData.js";
import { activeBthSpecialty } from "../data/bthSpecialties.js";
import { careersCatalog } from "../data/careersCatalog.js";
import { riasecData } from "../data/riasecData.js";
import { getCareerResults, getProfileScores } from "./compatibilityEngine.js";
import { compatibilityWeights } from "./weights.js";

const phaseMap = {
  riasec: 1,
  academic: 2,
  bth: 3,
  catalog: 4,
  simulation: 5,
  engine: 6,
  area: 7,
  career: 8,
  recalculation: 9,
  final: 10,
  feedback: 11,
};

const layerByType = {
  source: -320,
  indicator: -190,
  profile: -55,
  area: 145,
  career: 270,
  result: 360,
};

function getLayerX(id, type, options) {
  if (Number.isFinite(options.layerX)) return options.layerX;
  if (id === "engine") return 55;
  if (id === "final") return 360;
  if (id === "route" || id === "feedback") return 440;
  return layerByType[type] ?? 0;
}

function node(id, label, type, phase, options = {}) {
  const layerX = getLayerX(id, type, options);
  const layerY = options.layerY ?? options.fy ?? 0;
  const layerZ = options.layerZ ?? options.fz ?? 0;

  return {
    id,
    label,
    name: label,
    type,
    phase,
    score: options.score ?? null,
    weight: options.weight ?? null,
    description: options.description ?? "",
    explanation: options.explanation ?? "",
    recommended: Boolean(options.recommended),
    alternative: Boolean(options.alternative),
    alert: Boolean(options.alert),
    layerX,
    layerY,
    layerZ,
    x: options.x ?? layerX,
    y: options.y ?? layerY,
    z: options.z ?? layerZ,
  };
}

function link(source, target, phase, options = {}) {
  return {
    source,
    target,
    phase,
    weight: options.weight ?? 0.45,
    strength: options.strength ?? options.weight ?? 0.45,
    recommended: Boolean(options.recommended),
    alternative: Boolean(options.alternative),
    alert: Boolean(options.alert),
    label: options.label ?? "",
  };
}

export function buildGraphData() {
  const profileScores = getProfileScores();
  const careerResults = getCareerResults();
  const primaryCareers = careerResults.filter((career) =>
    ["Ingenieria de Sistemas", "Ciencia de Datos", "Ingenieria Electronica", "Administracion Tecnologica"].includes(
      career.name,
    ),
  );

  const nodes = [
    node("src-riasec", "Cuestionario RIASEC", "source", phaseMap.riasec, {
      description: "Fuente vocacional aplicada al inicio de gestion.",
      explanation: "Activa intereses Investigador, Convencional y Realista como senales dominantes.",
      layerY: -120,
    }),
    node("src-lms", "LMS Academico", "source", phaseMap.academic, {
      description: "Fuente de rendimiento academico y actividad de aprendizaje.",
      explanation: "Integra desempeno en areas clave y participacion dentro del entorno LMS.",
      layerY: -58,
    }),
    node("src-bth", "Especialidad BTH", "source", phaseMap.bth, {
      score: 92,
      description: "Especialidad tecnica cursada desde secundaria.",
      explanation: "Sistemas Informaticos fortalece continuidad hacia carreras tecnologicas.",
      layerY: 0,
    }),
    node("src-catalog", "Catalogo de Carreras", "source", phaseMap.catalog, {
      description: "Fuente de perfiles profesionales disponibles para contraste.",
      explanation: "Permite comparar areas, carreras y requisitos esperados.",
      layerY: 58,
    }),
    node("src-simulation", "Simulacion Academico-Profesional", "source", phaseMap.simulation, {
      description: "Fuente situacional de competencias profesionales.",
      explanation: "Evalua toma de decisiones, resolucion de problemas y respuesta ante presion.",
      layerY: 120,
    }),

    ...["Investigador", "Convencional", "Realista"].map((key, index) =>
      node(`riasec-${key}`, key, "indicator", phaseMap.riasec, {
        score: riasecData[key],
        description: `Indicador vocacional RIASEC ${key}.`,
        explanation: "Aporta afinidad vocacional para rutas tecnico-analiticas.",
        layerY: -92 + index * 46,
      }),
    ),
    ...["Matematica", "Tecnologia", "Fisica", "Lenguaje", "Participacion LMS"].map((key, index) =>
      node(`academic-${key}`, key, "indicator", phaseMap.academic, {
        score: academicIndicators[key],
        description: `Indicador LMS: ${key}.`,
        explanation: "Contribuye al perfil academico usado por el motor multicriterio.",
        layerY: 82 + index * 26,
      }),
    ),
    node("bth-active", activeBthSpecialty, "indicator", phaseMap.bth, {
      score: 92,
      description: "Especialidad BTH declarada por el estudiante.",
      explanation: "Relaciona aprendizaje tecnico con continuidad academico-profesional.",
      layerY: 0,
    }),
    ...["Resolucion de problemas", "Trabajo en equipo", "Comunicacion", "Manejo de presion"].map((key, index) =>
      node(`sim-${key}`, key, "indicator", phaseMap.simulation, {
        score: professionalSimulation[key],
        description: `Competencia observada en simulacion: ${key}.`,
        explanation: "Ajusta el resultado luego de contrastar desempeno situacional.",
        layerY: -160 + index * 45,
      }),
    ),

    node("profile-vocational", "Perfil Vocacional", "profile", phaseMap.riasec, {
      score: Math.round(profileScores.vocational),
      weight: compatibilityWeights.vocationalQuestionnaire,
      description: "Sintesis de preferencias RIASEC.",
      explanation: "Agrupa intereses compatibles con analisis, estructura y tecnologia.",
      layerY: -92,
    }),
    node("profile-academic", "Perfil Academico", "profile", phaseMap.academic, {
      score: Math.round(profileScores.academic),
      weight: compatibilityWeights.academicLms,
      description: "Sintesis del rendimiento LMS.",
      explanation: "Pondera areas con impacto directo en carreras de base cientifico-tecnica.",
      layerY: -30,
    }),
    node("profile-bth", "Perfil Tecnico BTH", "profile", phaseMap.bth, {
      score: Math.round(profileScores.bth),
      weight: compatibilityWeights.bthSpecialty,
      description: "Sintesis de continuidad tecnica.",
      explanation: "Evalua relacion entre la especialidad BTH y la ruta universitaria.",
      layerY: 30,
    }),
    node("profile-situational", "Perfil Situacional", "profile", phaseMap.simulation, {
      score: Math.round(profileScores.simulation),
      weight: compatibilityWeights.professionalSimulation,
      description: "Sintesis de competencias de simulacion.",
      explanation: "Ajusta compatibilidad con base en desempeno academico-profesional.",
      layerY: 92,
    }),
    node("profile-aspiration", "Coherencia Aspiracional", "profile", phaseMap.engine, {
      score: 100,
      weight: compatibilityWeights.declaredAspiration,
      description: "Contraste entre carrera aspirada y evidencias del sistema.",
      explanation: "La aspiracion declarada es coherente con BTH y rendimiento tecnico.",
      layerY: 150,
    }),
    node("engine", "Motor Multicriterio", "result", phaseMap.engine, {
      description: "Integrador ponderado de evidencias.",
      explanation:
        "Calcula compatibilidad final con pesos vocacional, academico, BTH, simulacion y aspiracion.",
      layerY: 0,
    }),

    ...professionalAreas.map((area, index) =>
      node(`area-${area}`, area, "area", phaseMap.area, {
        score: index < 2 ? 84 - index * 4 : 58,
        description: `Area profesional ${area}.`,
        explanation: "Recibe propagacion del motor y conecta con carreras preliminares.",
        layerY: -120 + index * 48,
      }),
    ),

    ...primaryCareers.map((career) =>
      node(`career-${career.name}`, career.name, "career", phaseMap.career, {
        score: career.compatibility,
        description: `Carrera del catalogo: ${career.name}.`,
        explanation:
          career.name === "Ingenieria de Sistemas"
            ? "Ruta recomendada por alta coherencia entre RIASEC, LMS, BTH y simulacion."
            : "Ruta alternativa o preliminar segun afinidad parcial con las evidencias.",
        recommended: career.name === "Ingenieria de Sistemas",
        alternative: ["Ciencia de Datos", "Ingenieria Electronica"].includes(career.name),
        layerY: -70 + primaryCareers.findIndex((primary) => primary.name === career.name) * 46,
      }),
    ),
    node("final", "Compatibilidad Final", "result", phaseMap.final, {
      score: 86,
      description: "Resultado consolidado del modelo multicriterio.",
      explanation: "Ingenieria de Sistemas alcanza 86 por coherencia vocacional, academica y tecnica.",
      recommended: true,
      layerY: -34,
    }),
    node("route", "Ruta Recomendada", "result", phaseMap.feedback, {
      score: 86,
      description: "Camino principal sugerido por el motor.",
      explanation: "Mantener trayectoria BTH en Sistemas Informaticos hacia Ingenieria de Sistemas.",
      recommended: true,
      layerY: 24,
    }),
    node("feedback", "Retroalimentacion", "result", phaseMap.feedback, {
      description: "Mensaje interno de orientacion para refuerzo y decision.",
      explanation: "Propone fortalecer comunicacion y trabajo en equipo como apoyo a la ruta principal.",
      layerY: 82,
    }),
  ];

  const links = [
    link("src-riasec", "riasec-Investigador", phaseMap.riasec, { weight: 0.88, recommended: true }),
    link("src-riasec", "riasec-Convencional", phaseMap.riasec, { weight: 0.81, recommended: true }),
    link("src-riasec", "riasec-Realista", phaseMap.riasec, { weight: 0.75, recommended: true }),
    link("riasec-Investigador", "profile-vocational", phaseMap.riasec, { weight: 0.88, recommended: true }),
    link("riasec-Convencional", "profile-vocational", phaseMap.riasec, { weight: 0.81, recommended: true }),
    link("riasec-Realista", "profile-vocational", phaseMap.riasec, { weight: 0.75, recommended: true }),

    ...["Matematica", "Tecnologia", "Fisica", "Lenguaje", "Participacion LMS"].map((key) =>
      link("src-lms", `academic-${key}`, phaseMap.academic, {
        weight: (academicIndicators[key] ?? 70) / 100,
        recommended: ["Matematica", "Tecnologia", "Fisica"].includes(key),
      }),
    ),
    ...["Matematica", "Tecnologia", "Fisica", "Lenguaje", "Participacion LMS"].map((key) =>
      link(`academic-${key}`, "profile-academic", phaseMap.academic, {
        weight: (academicIndicators[key] ?? 70) / 100,
        recommended: ["Matematica", "Tecnologia", "Fisica"].includes(key),
      }),
    ),
    link("src-bth", "bth-active", phaseMap.bth, { weight: 0.92, recommended: true }),
    link("bth-active", "profile-bth", phaseMap.bth, { weight: 0.92, recommended: true }),
    ...["Resolucion de problemas", "Trabajo en equipo", "Comunicacion", "Manejo de presion"].map((key) =>
      link("src-simulation", `sim-${key}`, phaseMap.simulation, {
        weight: (professionalSimulation[key] ?? 70) / 100,
        alert: key === "Comunicacion",
      }),
    ),
    ...["Resolucion de problemas", "Trabajo en equipo", "Comunicacion", "Manejo de presion"].map((key) =>
      link(`sim-${key}`, "profile-situational", phaseMap.simulation, {
        weight: (professionalSimulation[key] ?? 70) / 100,
        alert: key === "Comunicacion",
      }),
    ),

    link("src-catalog", "area-Tecnologia e Ingenieria", phaseMap.catalog, { weight: 0.86, recommended: true }),
    link("src-catalog", "area-Datos y Analitica", phaseMap.catalog, { weight: 0.8, alternative: true }),
    link("profile-vocational", "engine", phaseMap.engine, {
      weight: compatibilityWeights.vocationalQuestionnaire,
      recommended: true,
    }),
    link("profile-academic", "engine", phaseMap.engine, {
      weight: compatibilityWeights.academicLms,
      recommended: true,
    }),
    link("profile-bth", "engine", phaseMap.engine, { weight: compatibilityWeights.bthSpecialty, recommended: true }),
    link("profile-situational", "engine", phaseMap.engine, {
      weight: compatibilityWeights.professionalSimulation,
      recommended: true,
    }),
    link("profile-aspiration", "engine", phaseMap.engine, {
      weight: compatibilityWeights.declaredAspiration,
      recommended: true,
    }),
    link("engine", "area-Tecnologia e Ingenieria", phaseMap.area, { weight: 0.86, recommended: true }),
    link("engine", "area-Datos y Analitica", phaseMap.area, { weight: 0.8, alternative: true }),
    link("engine", "area-Administracion y Economia", phaseMap.area, { weight: 0.69, alternative: true }),
    link("engine", "area-Industria y Produccion", phaseMap.area, { weight: 0.58 }),
    link("engine", "area-Educacion Social", phaseMap.area, { weight: 0.42 }),
    link("engine", "area-Arte y Diseno", phaseMap.area, { weight: 0.38 }),
    ...careersCatalog
      .filter((career) => primaryCareers.some((primary) => primary.name === career.name))
      .map((career) =>
        link(`area-${career.area}`, `career-${career.name}`, phaseMap.career, {
          weight: career.expectedCompatibility / 100,
          recommended: career.name === "Ingenieria de Sistemas",
          alternative: ["Ciencia de Datos", "Ingenieria Electronica"].includes(career.name),
        }),
      ),
    link("career-Ingenieria de Sistemas", "final", phaseMap.final, { weight: 0.86, recommended: true }),
    link("career-Ciencia de Datos", "final", phaseMap.final, { weight: 0.8, alternative: true }),
    link("career-Ingenieria Electronica", "final", phaseMap.final, { weight: 0.74, alternative: true }),
    link("career-Administracion Tecnologica", "final", phaseMap.final, { weight: 0.69 }),
    link("final", "route", phaseMap.feedback, { weight: 0.86, recommended: true }),
    link("route", "feedback", phaseMap.feedback, { weight: 0.72, recommended: true }),
    link("feedback", "profile-aspiration", phaseMap.feedback, { weight: 0.55 }),
  ];

  return { nodes, links };
}
