import { lazy, Suspense, useEffect, useState } from "react";
import { buildGraph } from "./graph/graphModel.js";
import { SimulationEngine, phases } from "./simulation/SimulationEngine.js";
import { scenarios } from "./data/demo.js";

const engine = new SimulationEngine();
const graph = buildGraph();
const SynapticGraph = lazy(() => import("./components/SynapticGraph.jsx"));

export default function App() {
  const [state, setState] = useState(() => engine.snapshot());
  const [selectedId, setSelectedId] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null);
  const [panel, setPanel] = useState(null);
  const [traceMode, setTraceMode] = useState(false);
  const [highlightFlow, setHighlightFlow] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("savp-theme") ?? "dark",
  );
  const [reducedMotion, setReducedMotion] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(
    () =>
      engine.subscribe((event) => {
        if (event.type === "STATE_CHANGED") setState(event.state);
      }),
    [],
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("savp-theme", theme);
  }, [theme]);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!autoplay || state.status !== "running" || state.phase === 7)
      return undefined;
    const timer = setTimeout(() => {
      void engine.next();
    }, 2300 / state.speed);
    return () => clearTimeout(timer);
  }, [autoplay, state.phase, state.status, state.speed]);
  useEffect(() => {
    function key(event) {
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          document.activeElement?.tagName,
        )
      )
        return;
      if (event.key === "Escape") {
        setPanel(null);
        setSelectedId(null);
        setSelectedLink(null);
        setTraceMode(false);
      }
      if (event.code === "Space") {
        event.preventDefault();
        if (state.status === "paused") engine.resume();
        else if (state.status === "running") engine.pause();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        void engine.next();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        engine.previous();
      }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [state.status]);
  const active = phases[state.phase];
  const profile = state.careerProfiles.find(
    (item) => item.id === state.selectedCareerId,
  );
  const nextScenario = scenarios[state.scenarioAnswers.length];
  const selectedNode = graph.nodes.find((node) => node.id === selectedId);
  const linkSignals = state.signals.filter(
    (signal) => `${signal.source}:${signal.target}` === selectedLink,
  );
  const nodeEvidence =
    state.evidenceAnalysis?.evidence.filter(
      (item) => item.path?.includes(selectedId) || selectedId === "evidence",
    ) ?? [];
  const traceEntries = state.history.filter(
    (event) =>
      !["RIASEC_ITEM_PROCESSED", "EVIDENCE_ADDED"].includes(event.type),
  );
  const reset = () => {
    setAutoplay(false);
    setPanel(null);
    setSelectedId(null);
    setTraceMode(false);
    engine.reset();
  };
  return (
    <main className="app-shell">
      <Suspense
        fallback={
          <div className="graph-stage" aria-label="Cargando escena 3D" />
        }
      >
        <SynapticGraph
          graphData={graph}
          state={state}
          selectedId={selectedId}
          traceMode={traceMode}
          highlightFlow={highlightFlow}
          onSelectNode={(id) => {
            setSelectedId(id);
            setSelectedLink(null);
            setPanel("node");
          }}
          onSelectLink={(id) => {
            setSelectedLink(id);
            setSelectedId(null);
            setPanel("signal");
          }}
          reducedMotion={reducedMotion}
        />
      </Suspense>

      <header className="brand-layer">
        <span className="eyebrow">
          SAVP–TIS3 <span className="live-dot" />{" "}
          {state.status === "waiting"
            ? "EN ESPERA"
            : state.status.toUpperCase()}
        </span>
        <h1>Simulación del funcionamiento interno</h1>
        <p>
          {state.student.name} · {state.student.course} · BTH{" "}
          {state.student.bth}
        </p>
        {state.traceId && (
          <code className="trace-id">TRACE {state.traceId}</code>
        )}
      </header>

      <div className="top-actions">
        <button
          className="subtle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "☼ Claro" : "☾ Oscuro"}
        </button>
        <button
          className="subtle"
          onClick={() => setPanel(panel === "flow" ? null : "flow")}
        >
          Vista textual
        </button>
      </div>

      <section className="phase-card" aria-live="polite">
        <span className="eyebrow">
          FASE {String(state.phase).padStart(2, "0")} / {phases.length - 1}
        </span>
        <h2>{active.title}</h2>
        <p>{active.narrative}</p>
        {state.phase === 4 && (
          <p className="small-data">
            RIASEC {state.riasecResult?.code} · {state.retrieval?.documentCount}{" "}
            documentos · {state.retrieval?.chunkCount} chunks reales
          </p>
        )}
        {state.phase >= 5 && (
          <p className="small-data">
            {state.evidenceAnalysis?.evidence.length} evidencias ·{" "}
            {state.evidenceAnalysis?.sources.length} fuentes ·{" "}
            {state.missingData.length} ausencias · {state.warnings.length}{" "}
            avisos
          </p>
        )}
      </section>

      <section className="control-dock" aria-label="Controles de simulación">
        <div className="control-main">
          {state.status === "waiting" ? (
            <button className="primary" onClick={() => engine.start()}>
              Iniciar simulación
            </button>
          ) : (
            <>
              <button
                onClick={() =>
                  state.status === "paused" ? engine.resume() : engine.pause()
                }
                disabled={state.status === "completed"}
              >
                {state.status === "paused" ? "Continuar" : "Pausar"}
              </button>
              <button
                onClick={() => engine.previous()}
                disabled={state.phase <= 1}
              >
                Anterior
              </button>
              <button
                className="primary"
                onClick={() => void engine.next()}
                disabled={
                  state.status !== "running" ||
                  state.phase === phases.length - 1 ||
                  (state.phase === 7 &&
                    state.scenarioAnswers.length < scenarios.length)
                }
              >
                Siguiente
              </button>
              <button onClick={reset}>Reiniciar</button>
            </>
          )}
        </div>
        <div className="control-secondary">
          <label>
            Velocidad{" "}
            <select
              value={state.speed}
              onChange={(event) => engine.setSpeed(event.target.value)}
            >
              {[0.5, 1, 1.5, 2].map((speed) => (
                <option key={speed} value={speed}>
                  {speed}×
                </option>
              ))}
            </select>
          </label>
          <label>
            Modo{" "}
            <select
              value={state.mode}
              onChange={(event) => engine.setMode(event.target.value)}
            >
              <option value="guided">Guiado</option>
              <option value="explore">Exploración</option>
            </select>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={autoplay}
              onChange={(event) => setAutoplay(event.target.checked)}
            />{" "}
            Auto
          </label>
          <button
            className="subtle"
            onClick={() => {
              setTraceMode(!traceMode);
              setPanel(!traceMode ? "trace" : null);
            }}
          >
            Ver traza
          </button>
          <button
            className="subtle"
            onClick={() => setHighlightFlow(!highlightFlow)}
          >
            Iluminar flujo
          </button>
        </div>
      </section>

      {state.phase >= 6 && state.phase < 11 && (
        <section className="career-strip" aria-label="Perfiles de carrera">
          <span className="eyebrow">PERFILES · SELECCIONA UNA RUTA</span>
          <div>
            {state.careerProfiles.map((career) => (
              <button
                key={career.id}
                className={
                  career.id === state.selectedCareerId ? "active" : "subtle"
                }
                onClick={() => engine.selectCareer(career.id)}
                disabled={
                  state.scenarioAnswers.length > 0 &&
                  career.id !== state.selectedCareerId
                }
              >
                {career.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {state.phase === 7 && (
        <section className="scenario-panel" aria-label="Escenario interactivo">
          <span className="eyebrow">
            {profile?.name} · {nextScenario?.id ?? "COMPLETADO"}
          </span>
          {nextScenario ? (
            <>
              <h2>{nextScenario.question}</h2>
              <div className="choices">
                {nextScenario.choices.map((choice, index) => (
                  <button
                    key={choice.text}
                    onClick={() => engine.answer(nextScenario.id, index)}
                  >
                    {String.fromCharCode(65 + index)}. {choice.text}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2>Escenarios completos</h2>
              <p>
                Se crearon {state.simulationEvidence.length} evidencias. Avanza
                para integrarlas.
              </p>
            </>
          )}
          {state.scenarioAnswers.length > 0 && (
            <p className="small-data">
              {state.scenarioAnswers.length} / {scenarios.length} respuestas
              registradas
            </p>
          )}
        </section>
      )}

      {state.phase === 11 && state.finalResult && (
        <section className="result-panel" aria-label="Orientación final">
          <span className="eyebrow">ORIENTACIÓN · {state.traceId}</span>
          <h2>{profile?.name}</h2>
          <div className="dimensions">
            <span>
              Afinidad <strong>{profile?.affinity}</strong>
            </span>
            <span>
              Preparación <strong>{profile?.preparation}</strong>
            </span>
            <span>
              BTH <strong>{profile?.technicalContinuity}</strong>
            </span>
            <span>
              Interés <strong>{profile?.declaredInterest}</strong>
            </span>
          </div>
          <p className="small-data">
            Relación ocupacional: {profile?.occupationalRelation} · Refuerzo:{" "}
            {profile?.reinforcementAreas.join(", ")}
          </p>
          <p>{state.tutorResponse?.text}</p>
          <p className="small-data">
            {state.finalResult.sources.length} fuentes ·{" "}
            {state.finalResult.evidence.length} evidencias ·{" "}
            {state.missingData.length} sin evidencia · {state.warnings.length}{" "}
            avisos
          </p>
          <p className="small-data">
            Evidencias: {profile?.evidenceIds.join(", ") || "sin evidencia"}
          </p>
          <p className="small-data">
            {state.warnings.join(" ")} {state.limitations.join(" ")}
          </p>
          <div className="control-main">
            <button onClick={() => setPanel("evidence")}>Ver evidencias</button>
            <button
              onClick={() => {
                setPanel("trace");
                setTraceMode(true);
              }}
            >
              Ver traza completa
            </button>
          </div>
        </section>
      )}

      {panel && (
        <aside className="detail-panel" aria-label="Panel de detalle">
          <button
            className="close"
            onClick={() => {
              setPanel(null);
              setSelectedId(null);
              setSelectedLink(null);
            }}
            aria-label="Cerrar panel"
          >
            ×
          </button>
          {panel === "node" && selectedNode && (
            <>
              <span className="eyebrow">NODO · {selectedNode.type}</span>
              <h2>{selectedNode.label}</h2>
              <p>{selectedNode.description}</p>
              <dl>
                <dt>Estado</dt>
                <dd>{state.nodes[selectedId] ?? "en espera"}</dd>
                <dt>Fase</dt>
                <dd>{selectedNode.phase}</dd>
                <dt>Trace ID</dt>
                <dd>{state.traceId ?? "sin iniciar"}</dd>
              </dl>
              {selectedId === "riasec" && state.riasecResult?.dimensions && (
                <>
                  <h3>Dimensiones · {state.riasecResult.code}</h3>
                  {Object.entries(state.riasecResult.dimensions).map(
                    ([key, value]) => (
                      <div className="metric" key={key}>
                        <b>{key}</b>
                        <span>
                          <i style={{ width: `${value * 5}%` }} />
                        </span>
                        <small>{value} / 20</small>
                      </div>
                    ),
                  )}
                  <h3>30 respuestas observadas</h3>
                  <p className="answer-grid">
                    {state.riasecResult.answers.map((answer, index) => (
                      <span
                        key={index}
                        title={`Reactivo ${index + 1}: ${answer} → ${answer - 1}`}
                      >
                        {answer}
                      </span>
                    ))}
                  </p>
                </>
              )}
              {selectedId === "analytics" &&
                state.learningAnalytics?.trends && (
                  <>
                    <h3>Tendencias</h3>
                    {Object.entries(state.learningAnalytics.trends).map(
                      ([key, item]) => (
                        <p className="evidence-item" key={key}>
                          {key}: {item.values.join(" → ")} · cambio{" "}
                          {item.change >= 0 ? "+" : ""}
                          {item.change}
                        </p>
                      ),
                    )}
                    <p>
                      Asistencia:{" "}
                      {state.learningAnalytics.attendance ?? "sin evidencia"}% ·
                      actividad{" "}
                      {state.learningAnalytics.activity ?? "sin evidencia"}
                    </p>
                    <p>
                      Promedio por periodo:{" "}
                      {state.learningAnalytics.periodAverages
                        .map(
                          (period) =>
                            `${period.name}: ${period.value ?? "sin evidencia"}`,
                        )
                        .join(" · ")}
                    </p>
                  </>
                )}
              {selectedId === "retrieval" && state.retrieval && (
                <>
                  <h3>Pipeline local</h3>
                  <p>{state.retrieval.pipeline.join(" → ")}</p>
                  <p>
                    {state.retrieval.documentCount} documentos ·{" "}
                    {state.retrieval.chunkCount} chunks ·{" "}
                    {state.retrieval.evidence.length} coincidencias
                  </p>
                  <p>{state.retrieval.method}</p>
                  <h3>Fragmentos del corpus</h3>
                  {state.retrieval.chunkSamples.map((chunk) => (
                    <p className="evidence-item" key={chunk.id}>
                      <b>
                        {chunk.id} · {chunk.title}
                      </b>
                      <br />
                      {chunk.content}
                    </p>
                  ))}
                </>
              )}
              {selectedId === "bridge" && profile && (
                <>
                  <h3>Reglas ejecutadas · {profile.name}</h3>
                  {profile.rules.map((rule) => (
                    <p className="evidence-item" key={rule.ruleId}>
                      {rule.ruleId}: {rule.result}
                    </p>
                  ))}
                </>
              )}
              {nodeEvidence.map((item) => (
                <p key={item.id} className="evidence-item">
                  {item.id}: {item.label ?? item.title}
                </p>
              ))}
            </>
          )}
          {panel === "signal" && (
            <>
              <span className="eyebrow">ENLACE {selectedLink}</span>
              <h2>Señales reales</h2>
              {linkSignals.length ? (
                linkSignals.map((signal) => (
                  <div className="evidence-item" key={signal.id}>
                    <b>
                      {signal.id} · {signal.type}
                    </b>
                    <p>
                      {signal.source} → {signal.target} · {signal.status}
                    </p>
                    <small>
                      {signal.traceId} · {signal.createdAt}
                    </small>
                    <pre>{JSON.stringify(signal.payload)}</pre>
                  </div>
                ))
              ) : (
                <p>Este enlace aún no transportó señales en la ejecución.</p>
              )}
            </>
          )}
          {panel === "evidence" && (
            <>
              <span className="eyebrow">REGISTRO DE EVIDENCIA</span>
              <h2>Origen y límites</h2>
              {state.evidenceAnalysis?.evidence.map((item) => (
                <div key={item.id} className="evidence-item">
                  <b>
                    {item.id} · {item.type}
                  </b>
                  <p>{item.label ?? item.content}</p>
                  <small>
                    {item.sourceId} · {item.traceId}
                  </small>
                  <p className="small-data">{item.path?.join(" → ")}</p>
                </div>
              ))}
              <h3>Sin evidencia</h3>
              {state.missingData.map((item) => (
                <p key={item.id}>? {item.label}: sin evidencia</p>
              ))}
            </>
          )}
          {panel === "trace" && (
            <>
              <span className="eyebrow">TRAZA INVERSA</span>
              <h2>{state.traceId ?? "Sin ejecución"}</h2>
              <p>
                Salida ← PETER 2 ← Tutor ← perfiles ← Bridge ← evidencias ←
                procesadores ← entradas ← estudiante
              </p>
              {profile && (
                <>
                  <h3>Fundamento de {profile.name}</h3>
                  {profile.evidenceIds.map((id) => {
                    const item = state.evidenceAnalysis?.evidence.find(
                      (entry) => entry.id === id,
                    );
                    return (
                      <p className="evidence-item" key={id}>
                        <b>{id}</b> ← {item?.sourceId ?? "fuente no disponible"}
                        <br />
                        <small>{item?.path?.join(" ← ")}</small>
                      </p>
                    );
                  })}
                </>
              )}
              <div className="timeline">
                {[...traceEntries].reverse().map((event) => (
                  <button
                    key={event.id}
                    onClick={() => {
                      setSelectedId(event.node);
                      setPanel("node");
                    }}
                  >
                    <small>+{(event.elapsedMs / 1000).toFixed(2)}s</small>{" "}
                    {event.type} <span>{event.node}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {panel === "flow" && (
            <>
              <span className="eyebrow">VISTA TEXTUAL</span>
              <h2>Flujo de la simulación</h2>
              <ol>
                {phases.slice(1).map((phase) => (
                  <li key={phase.title}>
                    <b>{phase.title}</b>
                    <p>{phase.narrative}</p>
                  </li>
                ))}
              </ol>
              <h3>Inspeccionar componente</h3>
              <div className="node-list">
                {graph.nodes.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => {
                      setSelectedId(node.id);
                      setPanel("node");
                    }}
                  >
                    {node.label}
                  </button>
                ))}
              </div>
              <p>
                La apariencia sináptica representa eventos y señales del
                sistema, no una red neuronal artificial.
              </p>
            </>
          )}
        </aside>
      )}
    </main>
  );
}
