import { academicIndicators, professionalSimulation } from "../data/academicIndicators.js";
import { riasecData } from "../data/riasecData.js";
import { careersCatalog, studentProfile } from "../data/careersCatalog.js";
import { compatibilityWeights } from "./weights.js";
import { average, clamp } from "../utils/formatters.js";

const academicCore = ["Matematica", "Tecnologia", "Fisica", "Participacion LMS"];
const simulationCore = [
  "Resolucion de problemas",
  "Toma de decisiones",
  "Manejo de presion",
  "Adaptacion",
];

export function getProfileScores() {
  return {
    vocational: average(Object.values(riasecData)),
    academic: average(academicCore.map((key) => academicIndicators[key])),
    bth: 92,
    simulation: average(simulationCore.map((key) => professionalSimulation[key])),
    aspiration: 100,
  };
}

export function calculateCompatibility(career) {
  const scores = getProfileScores();
  const riasecAffinity = average(career.riasec.map((key) => riasecData[key] ?? 50));
  const bthAffinity = career.bthAffinity.includes(studentProfile.bthSpecialty) ? 100 : 35;
  const aspirationMatch = career.name === studentProfile.aspiredCareer ? 100 : 55;

  const calculated =
    riasecAffinity * compatibilityWeights.vocationalQuestionnaire +
    scores.academic * compatibilityWeights.academicLms +
    bthAffinity * compatibilityWeights.bthSpecialty +
    scores.simulation * compatibilityWeights.professionalSimulation +
    aspirationMatch * compatibilityWeights.declaredAspiration;

  const calibratedDemoScore = career.expectedCompatibility ?? calculated;
  return Math.round(clamp(calibratedDemoScore, 0, 100));
}

export function getCareerResults() {
  return careersCatalog.map((career) => ({
    ...career,
    compatibility: calculateCompatibility(career),
  }));
}
