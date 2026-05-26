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

  const scoreBoost = node.score ? node.score / 24 : 0;
  const recommendedBoost = node.recommended ? 2.4 : 0;
  const inactiveScale = isActive ? 1 : 0.58;

  return ((base[node.type] ?? 4.8) + scoreBoost + recommendedBoost) * inactiveScale;
}

export function getLinkWidth(link, isActive, highlightRecommendedPath) {
  const width = 0.45 + (link.weight ?? 0.4) * 2.8;
  if (highlightRecommendedPath && link.recommended) return width + 2;
  return isActive ? width : 0.18;
}
