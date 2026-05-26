export default function PhaseControls({
  currentPhase,
  activePhase,
  totalPhases,
  onStart,
  onNext,
  onReset,
  onHighlightPath,
  highlightRecommendedPath,
}) {
  const isWaiting = currentPhase === 0;
  const isFinalPhase = currentPhase >= totalPhases - 1;

  return (
    <section className="phase-controls" aria-label="Controles del motor">
      <div>
        <span className="phase-index">
          Fase {currentPhase + 1} / {totalPhases}
        </span>
        <h2>{activePhase.title}</h2>
        <p>{activePhase.description}</p>
      </div>

      <div className="control-row">
        <button type="button" onClick={onStart} disabled={!isWaiting}>
          Iniciar motor
        </button>
        <button type="button" onClick={onNext} disabled={isWaiting || isFinalPhase}>
          Siguiente fase
        </button>
        <button
          type="button"
          className={highlightRecommendedPath ? "is-active" : ""}
          onClick={onHighlightPath}
        >
          Iluminar ruta recomendada
        </button>
        <button type="button" className="ghost" onClick={onReset}>
          Reiniciar
        </button>
      </div>
    </section>
  );
}
