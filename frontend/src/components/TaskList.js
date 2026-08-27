import { renderEmptyState, renderTaskCard } from "../templates/task.js";
export function renderTaskList(tasks, selectedIds) {
  return tasks.length
    ? tasks.map((task) => renderTaskCard(task, selectedIds)).join("")
    : renderEmptyState();
}
