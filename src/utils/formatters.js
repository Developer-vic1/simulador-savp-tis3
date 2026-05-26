export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function average(values) {
  const filtered = values.filter((value) => Number.isFinite(value));
  if (!filtered.length) return 0;
  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
}

export function formatPercent(value) {
  if (value === null || value === undefined) return "Sin dato";
  return `${Math.round(value)}%`;
}

export function formatWeight(value) {
  if (value === null || value === undefined) return "No aplica";
  return `${Math.round(value * 100)}%`;
}
