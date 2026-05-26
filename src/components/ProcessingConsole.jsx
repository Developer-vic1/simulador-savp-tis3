const consoleMessages = [
  [0, "Esperando inicio del motor sinaptico..."],
  [1, "Recibiendo evidencias RIASEC..."],
  [2, "Normalizando indicadores LMS..."],
  [3, "Conectando especialidad BTH..."],
  [4, "Leyendo catalogo academico de carreras..."],
  [5, "Evaluando simulacion situacional..."],
  [6, "Ponderando criterios..."],
  [7, "Propagando senal hacia areas profesionales..."],
  [8, "Calculando compatibilidad preliminar por carrera..."],
  [9, "Recalculando fortalezas y alertas..."],
  [10, "Consolidando compatibilidad final..."],
  [11, "Activando ruta recomendada..."],
];

export default function ProcessingConsole({ currentPhase }) {
  const visibleMessages = consoleMessages
    .filter(([phase]) => phase <= currentPhase)
    .slice(-4);

  return (
    <aside className="processing-console" aria-label="Consola interna de procesamiento">
      <div className="console-header">
        <span />
        <strong>Proceso interno</strong>
      </div>
      <ol>
        {visibleMessages.map(([phase, message]) => (
          <li key={phase} className={phase === currentPhase ? "is-current" : ""}>
            <span>{String(phase).padStart(2, "0")}</span>
            {message}
          </li>
        ))}
      </ol>
    </aside>
  );
}
