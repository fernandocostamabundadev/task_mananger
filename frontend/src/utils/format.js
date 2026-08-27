export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
export function formatDate(value) {
  if (!value) return "Sem prazo";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Sem prazo";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}
export function formatRelativeDate(value) {
  if (!value) return "Sem prazo";
  const d = new Date(value),
    n = new Date();
  d.setHours(0, 0, 0, 0);
  n.setHours(0, 0, 0, 0);
  const diff = Math.round((d - n) / 86400000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  if (diff < 0) return `${Math.abs(diff)}d atrasada`;
  return `Em ${diff} dias`;
}
export function formatDateInput(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? ""
    : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
