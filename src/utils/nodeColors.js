export const nodeColors = {
  source: "#38bdf8",
  indicator: "#60a5fa",
  profile: "#a78bfa",
  area: "#34d399",
  career: "#fbbf24",
  result: "#fb7185",
};

export const lightNodeColors = {
  source: "#0284c7",
  indicator: "#2563eb",
  profile: "#7c3aed",
  area: "#047857",
  career: "#b45309",
  result: "#be123c",
};

export const ringColors = {
  source: "#22d3ee",
  indicator: "#3b82f6",
  profile: "#a855f7",
  area: "#22c55e",
  career: "#f59e0b",
  result: "#fb7185",
};

export function getNodeColor(node, isActive, highlightRecommendedPath, theme = "dark") {
  if (!isActive) return theme === "light" ? "#cbd5e1" : "#334155";
  if (node.alert) return theme === "light" ? "#d97706" : "#f97316";
  if (highlightRecommendedPath && node.recommended) return theme === "light" ? "#0891b2" : "#22d3ee";
  if (node.alternative) return theme === "light" ? "#b45309" : "#fbbf24";
  const palette = theme === "light" ? lightNodeColors : nodeColors;
  return palette[node.type] ?? (theme === "light" ? "#334155" : "#e2e8f0");
}

export function getLinkColor(link, isActive, highlightRecommendedPath, theme = "dark") {
  if (!isActive) return theme === "light" ? "rgba(100, 116, 139, 0.18)" : "rgba(71, 85, 105, 0.16)";
  if (link.alert) return theme === "light" ? "rgba(220, 38, 38, 0.72)" : "rgba(248, 113, 113, 0.88)";
  if (highlightRecommendedPath && link.recommended) {
    return theme === "light" ? "rgba(8, 145, 178, 0.9)" : "rgba(34, 211, 238, 0.98)";
  }
  if (link.recommended) return theme === "light" ? "rgba(14, 116, 144, 0.68)" : "rgba(103, 232, 249, 0.76)";
  if (link.alternative) return theme === "light" ? "rgba(180, 83, 9, 0.62)" : "rgba(251, 191, 36, 0.7)";
  return theme === "light" ? "rgba(51, 65, 85, 0.46)" : "rgba(148, 163, 184, 0.56)";
}

export function getParticleColor(link, isActive, highlightRecommendedPath, theme = "dark") {
  if (!isActive) return "rgba(0, 0, 0, 0)";
  if (link.alert) return theme === "light" ? "#dc2626" : "#f97316";
  if (highlightRecommendedPath && link.recommended) return theme === "light" ? "#0891b2" : "#67e8f9";
  if (link.alternative) return theme === "light" ? "#b45309" : "#fbbf24";
  return theme === "light" ? "#475569" : "#bae6fd";
}
