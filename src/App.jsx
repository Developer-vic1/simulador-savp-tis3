import { useEffect, useMemo, useState } from "react";
import SynapticGraph from "./components/SynapticGraph.jsx";
import PhaseControls from "./components/PhaseControls.jsx";
import NodeInfoPanel from "./components/NodeInfoPanel.jsx";
import FloatingLegend from "./components/FloatingLegend.jsx";
import DefenseNarrative from "./components/DefenseNarrative.jsx";
import PhaseExplanationCard from "./components/PhaseExplanationCard.jsx";
import ProcessingConsole from "./components/ProcessingConsole.jsx";
import { phases } from "./data/phases.js";
import { buildGraphData } from "./engine/graphBuilder.js";

const THEME_STORAGE_KEY = "savp-tis3-theme";

function getInitialTheme() {
  if (typeof window === "undefined") return "dark";
  return window.localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
}

export default function App() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [selectedNode, setSelectedNode] = useState(null);
  const [highlightRecommendedPath, setHighlightRecommendedPath] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  const graphData = useMemo(() => buildGraphData(), []);
  const activePhase = phases[currentPhase];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const startMotor = () => {
    setCurrentPhase(1);
    setHighlightRecommendedPath(false);
  };

  const nextPhase = () => {
    setCurrentPhase((phase) => Math.min(phase + 1, phases.length - 1));
  };

  const resetMotor = () => {
    setCurrentPhase(0);
    setSelectedNode(null);
    setHighlightRecommendedPath(false);
  };

  const toggleTheme = () => {
    setTheme((value) => (value === "dark" ? "light" : "dark"));
  };

  return (
    <main className="app-shell">
      <SynapticGraph
        graphData={graphData}
        currentPhase={currentPhase}
        selectedNode={selectedNode}
        highlightRecommendedPath={highlightRecommendedPath}
        theme={theme}
        onSelectNode={setSelectedNode}
      />

      <section className="brand-layer" aria-label="Identidad del simulador">
        <p className="eyebrow">SAVP-TIS3 - Visualizacion interna</p>
        <h1>Motor Sinaptico de Compatibilidad Academico-Vocacional</h1>
        <p>
          Juan Perez - 4to de secundaria - BTH Sistemas Informaticos - Aspiracion:
          Ingenieria de Sistemas
        </p>
      </section>

      <button type="button" className="theme-toggle" onClick={toggleTheme}>
        {theme === "dark" ? "Modo claro" : "Modo oscuro"}
      </button>

      <PhaseControls
        currentPhase={currentPhase}
        activePhase={activePhase}
        totalPhases={phases.length}
        onStart={startMotor}
        onNext={nextPhase}
        onReset={resetMotor}
        onHighlightPath={() => setHighlightRecommendedPath((value) => !value)}
        highlightRecommendedPath={highlightRecommendedPath}
      />

      <ProcessingConsole currentPhase={currentPhase} />
      <PhaseExplanationCard phase={activePhase} />
      <DefenseNarrative />
      <FloatingLegend />
      <NodeInfoPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
    </main>
  );
}
