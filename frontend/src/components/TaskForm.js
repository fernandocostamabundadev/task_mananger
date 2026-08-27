import { formatDateInput } from "../utils/format.js";
export function populateTaskForm(task) {
  document.querySelector("#taskForm").dataset.editing = "true";
  document.querySelector("#formTitle").textContent = "Editar tarefa";
  document.querySelector("#taskTitle").value = task.title || "";
  document.querySelector("#taskDescription").value = task.description || "";
  document.querySelector("#taskStatus").value = task.status || "PENDING";
  document.querySelector("#taskPriority").value = task.priority || "MEDIUM";
  document.querySelector("#taskDueDate").value = formatDateInput(task.dueDate);
  document.querySelector("#taskCategory").value = task.category || "Estudos";
  document.querySelector("#cancelEditBtn").hidden = false;
  document.querySelector("#taskModal").hidden = false;
  document.querySelector("#taskTitle").focus();
}
export function resetTaskFormState() {
  const form = document.querySelector("#taskForm");
  form.reset();
  form.dataset.editing = "false";
  document.querySelector("#taskStatus").value = "PENDING";
  document.querySelector("#taskPriority").value = "MEDIUM";
  document.querySelector("#taskCategory").value = "Estudos";
  document.querySelector("#cancelEditBtn").hidden = true;
  document.querySelector("#formTitle").textContent = "Nova tarefa";
}
