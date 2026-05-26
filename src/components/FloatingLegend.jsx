import { nodeColors } from "../utils/nodeColors.js";

const labels = {
  source: "Fuente",
  indicator: "Indicador",
  profile: "Perfil",
  area: "Area",
  career: "Carrera",
  result: "Resultado",
};

export default function FloatingLegend() {
  return (
    <aside className="floating-legend" aria-label="Leyenda de tipos de nodo">
      {Object.entries(labels).map(([key, label]) => (
        <span key={key}>
          <i style={{ "--legend-color": nodeColors[key] }} />
          {label}
        </span>
      ))}
    </aside>
  );
}
