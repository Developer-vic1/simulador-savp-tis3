import { formatPercent, formatWeight } from "../utils/formatters.js";

export default function NodeInfoPanel({ node, onClose }) {
  if (!node) return null;

  return (
    <aside className="node-panel" aria-label="Informacion del nodo seleccionado">
      <button type="button" className="panel-close" onClick={onClose} aria-label="Cerrar panel">
        x
      </button>
      <span className="panel-type">{node.type}</span>
      <h2>{node.label}</h2>
      <p>{node.description}</p>

      <dl>
        <div>
          <dt>Score</dt>
          <dd>{formatPercent(node.score)}</dd>
        </div>
        <div>
          <dt>Peso</dt>
          <dd>{formatWeight(node.weight)}</dd>
        </div>
        <div>
          <dt>Fase</dt>
          <dd>{node.phase + 1}</dd>
        </div>
      </dl>

      <p className="academic-note">{node.explanation}</p>
    </aside>
  );
}
