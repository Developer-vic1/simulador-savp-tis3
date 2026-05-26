export function isNodeActive(node, currentPhase) {
  if (currentPhase === 0) return node.type === "source";
  return node.phase <= currentPhase;
}

export function isLinkActive(link, currentPhase, highlightRecommendedPath) {
  if (highlightRecommendedPath && link.recommended) return true;
  return currentPhase > 0 && link.phase <= currentPhase;
}

export function getNodeSize(node, isActive) {
  const base = {
    source: 6.5,
    indicator: 4.2,
    profile: 6,
    area: 5.4,
    career: 6,
    result: 7,
  };

  const scoreBoost = node.score ? node.score / 26 : 0;
  const recommendedBoost = node.recommended ? 2.2 : 0;
  const inactiveScale = isActive ? 1 : 0.58;

  return ((base[node.type] ?? 4.8) + scoreBoost + recommendedBoost) * inactiveScale;
}

export function getLinkWidth(link, isActive, highlightRecommendedPath) {
  const weight = link.weight ?? 0.4;
  const width = 0.35 + weight * 3.8;

  if (!isActive) return 0.12;
  if (highlightRecommendedPath && link.recommended) return width + 2.4;
  if (link.recommended) return width + 0.8;
  if (link.alternative) return width + 0.25;
  if (link.alert) return width + 0.55;

  return width;
}

export function getParticleCount(link, isActive, highlightRecommendedPath) {
  if (!isActive) return 0;
  if (highlightRecommendedPath && link.recommended) return 5;
  if (link.recommended) return 3;
  if (link.alternative || link.alert) return 2;
  return link.weight > 0.72 ? 1 : 0;
}
