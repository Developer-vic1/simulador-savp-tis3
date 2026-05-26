const groupLabels = {
  source: "Fuentes",
  indicator: "Indicadores",
  profile: "Perfiles",
  area: "Areas",
  career: "Carreras",
  result: "Motor / resultado",
};

const explanationItems = [
  ["Datos que ingresan", "input"],
  ["Procesamiento interno", "process"],
  ["Resultado parcial", "output"],
  ["Explicacion para defensa", "defenseNote"],
];

export default function PhaseExplanationCard({ phase }) {
  if (!phase) return null;

  return (
    <aside className="phase-explanation-card" aria-label="Explicacion interna de la fase">
      <span className="phase-card-kicker">Lectura interna</span>
      <h2>{phase.title}</h2>

      <div className="phase-active-groups" aria-label="Nodos activados">
        {(phase.activeGroups ?? []).map((group) => (
          <span key={group}>{groupLabels[group] ?? group}</span>
        ))}
      </div>

      <dl className="phase-explanation-list">
        {explanationItems.map(([label, key]) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>{phase[key]}</dd>
          </div>
        ))}
      </dl>

      <p className="connection-note">
        Conexiones que se fortalecen: {describeStrengthenedConnections(phase)}
      </p>
    </aside>
  );
}

function describeStrengthenedConnections(phase) {
  const groups = phase.activeGroups ?? [];

  if (phase.id === 0) return "las fuentes quedan preparadas, aun sin propagacion.";
  if (groups.includes("profile") && groups.includes("result")) {
    return "los perfiles convergen hacia el motor multicriterio.";
  }
  if (groups.includes("area") && groups.includes("career")) {
    return "las areas activas alimentan carreras preliminares.";
  }
  if (groups.includes("career") && groups.includes("result")) {
    return "las carreras con mayor coherencia llegan al resultado final.";
  }
  if (groups.includes("indicator") && groups.includes("profile")) {
    return "los indicadores activos consolidan el perfil correspondiente.";
  }
  if (groups.includes("area")) return "el catalogo abre areas profesionales comparables.";

  return "la senal avanza hacia la siguiente capa interpretable del modelo.";
}
