export const interpretativeRules = [
  {
    id: "principal-route",
    label: "Ruta principal fortalecida",
    condition:
      "RIASEC compatible + rendimiento alto + BTH relacionado + simulacion alta",
    result: "Fortalecer ruta principal.",
  },
  {
    id: "reinforcement-route",
    label: "Ruta posible con refuerzo",
    condition: "RIASEC compatible + rendimiento bajo",
    result: "Mantener ruta posible con recomendacion de refuerzo.",
  },
  {
    id: "motivation-risk",
    label: "Riesgo de desmotivacion",
    condition: "Rendimiento alto + interes bajo",
    result: "Marcar riesgo de desmotivacion.",
  },
  {
    id: "technical-continuity",
    label: "Continuidad tecnica fortalecida",
    condition: "BTH relacionado + simulacion alta",
    result: "Fortalecer continuidad tecnica.",
  },
  {
    id: "coherence-alert",
    label: "Alerta de coherencia",
    condition: "Carrera aspirada contradice rendimiento y simulacion",
    result: "Marcar alerta de coherencia.",
  },
  {
    id: "incomplete-data",
    label: "Resultado preliminar",
    condition: "Datos incompletos",
    result: "Resultado preliminar no concluyente.",
  },
  {
    id: "secondary-route",
    label: "Ruta secundaria",
    condition: "Existe ruta alternativa fuerte",
    result: "Mostrar ruta secundaria.",
  },
];
