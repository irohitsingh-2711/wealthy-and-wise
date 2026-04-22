export function formatCurrency(value) {
  const rounded = Math.round(value || 0);
  if (Math.abs(rounded) >= 1e7) return `Rs ${ (rounded / 1e7).toFixed(2) } Cr`;
  if (Math.abs(rounded) >= 1e5) return `Rs ${ (rounded / 1e5).toFixed(2) } L`;
  return `Rs ${rounded.toLocaleString("en-IN")}`;
}

export function formatCompactCurrency(value) {
  const rounded = Math.round(value || 0);
  if (Math.abs(rounded) >= 1e7) return `Rs ${(rounded / 1e7).toFixed(1)}Cr`;
  if (Math.abs(rounded) >= 1e5) return `Rs ${(rounded / 1e5).toFixed(1)}L`;
  if (Math.abs(rounded) >= 1000) return `Rs ${Math.round(rounded / 1000)}k`;
  return `Rs ${rounded}`;
}

export function formatDuration(months) {
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  const yearLabel = years ? `${years} yr${years === 1 ? "" : "s"}` : "";
  const monthLabel = remMonths ? `${remMonths} mo` : "";
  return [yearLabel, monthLabel].filter(Boolean).join(" and ") || "0 mo";
}
