import { useMemo, useState } from "react";
import SynapticGraph from "./components/SynapticGraph.jsx";
import PhaseControls from "./components/PhaseControls.jsx";
import NodeInfoPanel from "./components/NodeInfoPanel.jsx";
import FloatingLegend from "./components/FloatingLegend.jsx";
import DefenseNarrative from "./components/DefenseNarrative.jsx";
import { phases } from "./data/phases.js";
import { buildGraphData } from "./engine/graphBuilder.js";

export default function App() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [selectedNode, setSelectedNode] = useState(null);
  const [highlightRecommendedPath, setHighlightRecommendedPath] = useState(false);

  const graphData = useMemo(() => buildGraphData(), []);
  const activePhase = phases[currentPhase];

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

  return (
    <main className="app-shell">
      <SynapticGraph
        graphData={graphData}
        currentPhase={currentPhase}
        selectedNode={selectedNode}
        highlightRecommendedPath={highlightRecommendedPath}
        onSelectNode={setSelectedNode}
      />

      <section className="brand-layer" aria-label="Identidad del simulador">
        <p className="eyebrow">SAVP-TIS3 · Visualizacion interna</p>
        <h1>Motor Sinaptico de Compatibilidad Academico-Vocacional</h1>
        <p>
          Juan Perez · 4to de secundaria · BTH Sistemas Informaticos · Aspiracion:
          Ingenieria de Sistemas
        </p>
      </section>

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

      <DefenseNarrative />
      <FloatingLegend />
      <NodeInfoPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
    </main>
  );
}
