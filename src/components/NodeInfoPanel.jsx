import { formatPercent, formatWeight } from "../utils/formatters.js";

const typeLabels = {
  source: "Fuente de evidencia",
  indicator: "Indicador observable",
  profile: "Perfil sintetico",
  area: "Area profesional",
  career: "Carrera candidata",
  result: "Nodo de resultado",
};

const modelConnections = {
  source: "Entrada primaria del modelo: origina senales que luego se normalizan y ponderan.",
  indicator: "Variable intermedia: transforma evidencia cruda en senales comparables.",
  profile: "Capa de sintesis: agrupa indicadores para alimentar el motor multicriterio.",
  area: "Capa de propagacion: organiza la compatibilidad antes de llegar a carreras concretas.",
  career: "Alternativa evaluada: recibe senales de areas y criterios ponderados.",
  result: "Salida explicativa: consolida compatibilidad, ruta recomendada o retroalimentacion.",
};

export default function NodeInfoPanel({ node, onClose }) {
  if (!node) return null;

  return (
    <aside className="node-panel" aria-label="Informacion del nodo seleccionado">
      <button type="button" className="panel-close" onClick={onClose} aria-label="Cerrar panel">
        x
      </button>

      <div className="panel-heading">
        <span className="panel-type">{typeLabels[node.type] ?? node.type}</span>
        <h2>{node.name ?? node.label}</h2>
        <p>{node.description || "Nodo interno de la visualizacion sinaptica SAVP-TIS3."}</p>
      </div>

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
          <dd>{Number.isFinite(node.phase) ? node.phase + 1 : "No aplica"}</dd>
        </div>
      </dl>

      <section className="panel-section">
        <h3>Explicacion academica</h3>
        <p>{node.explanation || "Este nodo participa en la lectura multicriterio del caso."}</p>
      </section>

      <section className="panel-section">
        <h3>Conexion con el modelo</h3>
        <p>{modelConnections[node.type] ?? "Elemento interno de apoyo al procesamiento de evidencias."}</p>
      </section>

      <div className="node-flags" aria-label="Estado de ruta">
        {node.recommended && <span>Ruta recomendada</span>}
        {node.alternative && <span>Alternativa fuerte</span>}
        {node.alert && <span>Alerta formativa</span>}
      </div>
    </aside>
  );
}
