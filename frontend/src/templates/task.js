import { isOverdue } from "../api/tasks.js";
import { escapeHtml, formatDate, formatRelativeDate } from "../utils/format.js";
const statusLabels = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
};
const priorityLabels = { LOW: "Baixa", MEDIUM: "Média", HIGH: "Alta" };
export function renderEmptyState() {
  return `<div class="empty-state"><div class="empty-icon">✓</div><h3>Nenhuma tarefa encontrada</h3><p>Tente ajustar os filtros ou crie uma nova tarefa.</p></div>`;
}
export function renderTaskCard(task, selectedIds) {
  const checked = selectedIds.has(task.id) ? "checked" : "";
  const overdue = isOverdue(task);
  const done = task.status === "COMPLETED";
  return `<article class="task-row ${done ? "is-completed" : ""} ${overdue ? "is-overdue" : ""} ${task.archived ? "is-archived" : ""}">
  <div class="task-check"><input type="checkbox" data-task-id="${task.id}" ${checked} aria-label="Selecionar ${escapeHtml(task.title)}"></div>
  <div class="task-main"><div class="task-title-line"><h3>${escapeHtml(task.title)}</h3><span class="category-label"><i class="dot dot--${categoryClass(task.category)}"></i>${escapeHtml(task.category || "Geral")}</span></div><p>${escapeHtml(task.description || "Sem descrição.")}</p></div>
  <div><span class="badge priority-${task.priority.toLowerCase()}"><i>⚑</i>${priorityLabels[task.priority]}</span></div>
  <div class="date-cell"><span>▣ ${formatDate(task.dueDate)}</span><small class="${overdue ? "overdue-text" : ""}">${overdue ? "Atrasada" : formatRelativeDate(task.dueDate)}</small></div>
  <div><button class="status-badge status-${task.status.toLowerCase()}" data-action="toggle-status" data-id="${task.id}"><i></i>${statusLabels[task.status]}</button></div>
  <div class="task-actions"><button class="more-btn" data-action="menu" data-id="${task.id}" aria-label="Mais ações">•••</button></div>
</article>`;
}
function categoryClass(c = "") {
  return (
    {
      Estudos: "blue",
      Trabalho: "purple",
      Pessoais: "green",
      Projetos: "orange",
    }[c] || "blue"
  );
}
