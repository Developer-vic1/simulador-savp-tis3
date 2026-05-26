const chapters = [
  { limit: 2, label: "Capitulo 1", title: "Entrada de evidencias." },
  { limit: 5, label: "Capitulo 2", title: "Construccion de perfiles." },
  { limit: 8, label: "Capitulo 3", title: "Integracion multicriterio." },
  { limit: Number.POSITIVE_INFINITY, label: "Capitulo 4", title: "Compatibilidad y retroalimentacion." },
];

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
  const progress = ((currentPhase + 1) / totalPhases) * 100;
  const currentChapter = chapters.find((chapter) => currentPhase <= chapter.limit) ?? chapters[0];

  return (
    <section className="phase-controls" aria-label="Controles del motor">
      <div className="chapter-strip">
        <span>{currentChapter.label}</span>
        <strong>{currentChapter.title}</strong>
      </div>

      <div className="phase-progress" aria-label={`Progreso de fase ${currentPhase + 1} de ${totalPhases}`}>
        <div style={{ width: `${progress}%` }} />
      </div>

      <div>
        <span className="phase-index">
          Fase {currentPhase + 1} / {totalPhases}
        </span>
        <h2>{activePhase.title}</h2>
        <p>{activePhase.description}</p>
      </div>

      <div className="phase-dots" aria-hidden="true">
        {Array.from({ length: totalPhases }).map((_, index) => (
          <span key={index} className={index <= currentPhase ? "is-lit" : ""} />
        ))}
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
