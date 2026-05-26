export const nodeColors = {
  source: "#38bdf8",
  indicator: "#a7f3d0",
  profile: "#c4b5fd",
  area: "#fcd34d",
  career: "#fb7185",
  result: "#f8fafc",
};

export function getNodeColor(node, isActive, highlightRecommendedPath) {
  if (!isActive) return "#334155";
  if (node.alert) return "#f97316";
  if (highlightRecommendedPath && node.recommended) return "#22d3ee";
  if (node.alternative) return "#fbbf24";
  return nodeColors[node.type] ?? "#e2e8f0";
}

export function getLinkColor(link, isActive, highlightRecommendedPath) {
  if (!isActive) return "rgba(71, 85, 105, 0.28)";
  if (link.alert) return "rgba(248, 113, 113, 0.85)";
  if (highlightRecommendedPath && link.recommended) return "rgba(34, 211, 238, 0.95)";
  if (link.alternative) return "rgba(251, 191, 36, 0.72)";
  return "rgba(148, 163, 184, 0.6)";
}
