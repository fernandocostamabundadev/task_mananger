import {
  createTask,
  deleteTask,
  getStats,
  getTasks,
  updateTask,
} from "./api/tasks.js";
import { renderPagination } from "./components/Pagination.js";
import { populateTaskForm, resetTaskFormState } from "./components/TaskForm.js";
import { renderTaskList } from "./components/TaskList.js";
import { state } from "./state/store.js";
import { validateTaskInput } from "./utils/validation.js";

const statusSequence = ["PENDING", "IN_PROGRESS", "COMPLETED"];
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const elements = {};

document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {
  cacheDom();
  bindEvents();
  resetTaskForm();
  loadDashboard();
}

function cacheDom() {
  [
    "taskForm",
    "taskTitle",
    "taskDescription",
    "taskStatus",
    "taskPriority",
    "taskDueDate",
    "taskCategory",
    "cancelEditBtn",
    "formTitle",
    "taskList",
    "searchInput",
    "searchToggleBtn",
    "searchPanel",
    "filterToggleBtn",
    "filterPanel",
    "statusFilter",
    "priorityFilter",
    "sortByFilter",
    "sortOrderFilter",
    "selectAll",
    "pagination",
    "toast",
    "taskModal",
    "resultsSummary",
  ].forEach((id) => {
    elements[id] = $("#" + id);
  });
}

function bindEvents() {
  $("#newTaskBtn")?.addEventListener("click", () => openNewTask());
  $("#closeModalBtn")?.addEventListener("click", closeModal);
  elements.taskModal?.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-modal]")) closeModal();
  });

  elements.taskForm?.addEventListener("submit", handleTaskSubmit);
  elements.cancelEditBtn?.addEventListener("click", () => {
    resetTaskForm();
    closeModal();
  });

  $("#menuToggle")?.addEventListener("click", () => {
    toggleSidebar();
  });

  $("#sidebar")?.addEventListener("click", (event) => {
    if (event.target === $("#sidebar")) {
      closeSidebar();
    }
  });

  elements.searchToggleBtn?.addEventListener("click", () => {
    elements.searchPanel?.classList.toggle("search-open");
    elements.searchInput?.focus();
  });

  $("#filterToggleBtn")?.addEventListener("click", () => {
    elements.filterPanel?.classList.toggle("open");
  });

  elements.searchInput?.addEventListener("input", () => {
    state.filters.search = elements.searchInput.value.trim();
    state.page = 1;
    fetchTasks();
  });

  ["statusFilter", "priorityFilter", "sortByFilter", "sortOrderFilter"].forEach(
    (id) => {
      elements[id]?.addEventListener("change", () => {
        state.filters.status = elements.statusFilter.value;
        state.filters.priority = elements.priorityFilter.value;
        state.filters.sortBy = elements.sortByFilter.value;
        state.filters.sortOrder = elements.sortOrderFilter.value;
        state.page = 1;
        fetchTasks();
      });
    },
  );

  $("#clearFiltersBtn")?.addEventListener("click", toggleSidebar);
  $("#dateFilterBtn")?.addEventListener("click", () => setView("today"));
  $("#statusFilterBtn")?.addEventListener("click", () => {
    $("#statusFilter")?.focus();
    elements.filterPanel?.classList.add("open");
  });

  elements.taskList?.addEventListener("click", handleTaskClick);
  elements.taskList?.addEventListener("change", handleTaskChange);
  elements.selectAll?.addEventListener("change", handleSelectAll);

  $$(".nav-item").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  $$(".list-item").forEach((button) => {
    button.addEventListener("click", () => {
      state.category = button.dataset.category;
      state.view = "category";
      state.page = 1;
      $$(".list-item").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      fetchTasks();
    });
  });

  $$(".tab").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.tab));
  });

  $("#notificationBtn")?.addEventListener("click", () =>
    showToast("Tudo em ordem hoje.", "success"),
  );
  $("#addListBtn")?.addEventListener("click", () =>
    showToast("As listas padrão já estão disponíveis.", "success"),
  );

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      elements.searchPanel?.classList.add("search-open");
      elements.searchInput?.focus();
    }

    if (event.key === "Escape") {
      const menu = document.querySelector(".action-menu");
      if (menu) {
        menu.remove();
      }
      closeModal();
    }
  });
}

async function loadDashboard() {
  try {
    await fetchTasks();
    await updateStats();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function fetchTasks() {
  const params = {
    page: state.page,
    limit: state.limit,
    ...state.filters,
  };

  const response = await getTasks(params);
  state.tasks = response.tasks;
  state.totalPages = response.totalPages;
  renderTasks(response.total);
  renderPaginationUI();
  updateSelectionState();
}

function renderTasks(total) {
  let tasks = [...state.tasks];

  if (state.view === "today")
    tasks = tasks.filter((task) => isToday(task.dueDate));
  if (state.view === "important")
    tasks = tasks.filter((task) => task.priority === "HIGH");
  if (state.view === "pending")
    tasks = tasks.filter((task) => task.status !== "COMPLETED");
  if (state.view === "completed")
    tasks = tasks.filter((task) => task.status === "COMPLETED");
  if (state.view === "overdue") tasks = tasks.filter((task) => isOverdue(task));
  if (state.view === "archived") tasks = tasks.filter((task) => task.archived);
  if (state.view === "category")
    tasks = tasks.filter((task) => task.category === state.category);

  if (elements.taskList) {
    elements.taskList.innerHTML = renderTaskList(tasks, state.selectedIds);
  }

  if (elements.resultsSummary) {
    const start = total === 0 ? 0 : (state.page - 1) * state.limit + 1;
    const end = total === 0 ? 0 : Math.min(state.page * state.limit, total);
    elements.resultsSummary.textContent = total
      ? `Mostrando ${start} a ${end} de ${total} tarefas`
      : "Mostrando 0 tarefas";
  }

  updateTabs();
}

function updateTabs() {
  getStats().then((stats) => {
    $("#tabAll").textContent = stats.total;
    $("#tabPending").textContent = stats.pending;
    $("#tabCompleted").textContent = stats.completed;
    $("#tabOverdue").textContent = stats.overdue;
  });
}

function renderPaginationUI() {
  if (!elements.pagination) return;

  elements.pagination.innerHTML = "";
  elements.pagination.appendChild(
    renderPagination({
      page: state.page,
      totalPages: state.totalPages,
      onPrev: () => {
        if (state.page > 1) {
          state.page -= 1;
          fetchTasks();
        }
      },
      onNext: () => {
        if (state.page < state.totalPages) {
          state.page += 1;
          fetchTasks();
        }
      },
    }),
  );
}

async function updateStats() {
  const stats = await getStats();

  $("#countAll").textContent = stats.total;
  $("#countToday").textContent = stats.today;
  $("#countImportant").textContent = stats.important;
  $("#countPending").textContent = stats.pending;
  $("#countCompleted").textContent = stats.completed;
  $("#countArchived").textContent = stats.archived;

  Object.entries(stats.categories || {}).forEach(([category, value]) => {
    const element = document.querySelector(
      `[data-category-count="${category}"]`,
    );
    if (element) {
      element.textContent = value;
    }
  });

  const percentage = stats.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;
  $("#progressPercent").textContent = `${percentage}%`;
  $("#progressCompleted").textContent = `${stats.completed} concluídas`;
  $("#progressMeta").textContent = `de ${stats.total} tarefas`;
  $("#progressBar").style.width = `${percentage}%`;
  $("#progressRing").style.setProperty("--progress", `${percentage * 3.6}deg`);
  $("#notificationCount").textContent = stats.overdue;
}

function handleTaskClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const taskId = button.dataset.id;

  if (button.dataset.action === "toggle-status") {
    toggleStatus(taskId);
  }

  if (button.dataset.action === "menu") {
    showTaskMenu(taskId, button);
  }
}

function handleTaskChange(event) {
  const checkbox = event.target.closest("[data-task-id]");
  if (!checkbox) return;

  const taskId = checkbox.dataset.taskId;
  if (checkbox.checked) {
    state.selectedIds.add(taskId);
  } else {
    state.selectedIds.delete(taskId);
  }

  updateSelectionState();
}

function handleSelectAll(event) {
  const checked = event.target.checked;

  state.tasks.forEach((task) => {
    if (checked) {
      state.selectedIds.add(task.id);
    } else {
      state.selectedIds.delete(task.id);
    }
  });

  updateSelectionState();
}

function updateSelectionState() {
  if (!elements.selectAll) return;
  const allSelected =
    state.tasks.length > 0 &&
    state.tasks.every((task) => state.selectedIds.has(task.id));
  elements.selectAll.checked = allSelected;
}

async function handleTaskSubmit(event) {
  event.preventDefault();

  const data = {
    title: elements.taskTitle.value.trim(),
    description: elements.taskDescription.value.trim(),
    status: elements.taskStatus.value,
    priority: elements.taskPriority.value,
    dueDate: elements.taskDueDate.value
      ? new Date(`${elements.taskDueDate.value}T12:00:00`).toISOString()
      : null,
    category: elements.taskCategory.value,
  };

  const error = validateTaskInput(data);
  if (error) {
    showToast(error, "error");
    return;
  }

  try {
    if (state.editingId) {
      await updateTask(state.editingId, data);
      showToast("Tarefa atualizada com sucesso.", "success");
    } else {
      await createTask(data);
      showToast("Tarefa criada com sucesso.", "success");
    }

    resetTaskForm();
    closeModal();
    state.page = 1;
    await loadDashboard();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function toggleStatus(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  const currentIndex = statusSequence.indexOf(task.status);
  const nextStatus = statusSequence[(currentIndex + 1) % statusSequence.length];

  try {
    await updateTask(taskId, { status: nextStatus });
    showToast("Status atualizado.", "success");
    await loadDashboard();
  } catch (error) {
    showToast(error.message, "error");
  }
}

function showTaskMenu(taskId, anchor) {
  const existingMenu = document.querySelector(".action-menu");
  if (existingMenu) existingMenu.remove();

  const task = state.tasks.find((item) => item.id === taskId);
  const menu = document.createElement("div");
  menu.className = "action-menu";
  menu.innerHTML = `
    <button type="button" data-menu="edit">Editar</button>
    <button type="button" data-menu="delete">Excluir</button>
    <button type="button" data-menu="complete">${task?.status === "COMPLETED" ? "Reabrir" : "Concluir"}</button>
  `;

  document.body.appendChild(menu);

  const rect = anchor.getBoundingClientRect();
  menu.style.position = "fixed";
  menu.style.top = `${Math.min(rect.bottom + 8, window.innerHeight - 140)}px`;
  menu.style.left = `${Math.max(16, rect.right - 140)}px`;

  const closeMenu = (event) => {
    if (!menu.contains(event.target) && event.target !== anchor) {
      menu.remove();
      document.removeEventListener("click", closeMenu);
    }
  };

  menu.addEventListener("click", async (event) => {
    const action = event.target.closest("[data-menu]");
    if (!action) return;

    const actionType = action.dataset.menu;
    menu.remove();
    document.removeEventListener("click", closeMenu);

    if (actionType === "edit") {
      const selectedTask = state.tasks.find((item) => item.id === taskId);
      if (!selectedTask) return;
      state.editingId = taskId;
      populateTaskForm(selectedTask);
      return;
    }

    if (actionType === "delete") {
      if (!confirm("Deseja excluir esta tarefa?")) return;
      try {
        await deleteTask(taskId);
        state.selectedIds.delete(taskId);
        showToast("Tarefa excluída.", "success");
        await loadDashboard();
      } catch (error) {
        showToast(error.message, "error");
      }
      return;
    }

    if (actionType === "complete") {
      const selectedTask = state.tasks.find((item) => item.id === taskId);
      if (!selectedTask) return;
      const nextStatus =
        selectedTask.status === "COMPLETED" ? "PENDING" : "COMPLETED";
      try {
        await updateTask(taskId, { status: nextStatus });
        await loadDashboard();
      } catch (error) {
        showToast(error.message, "error");
      }
    }
  });

  document.addEventListener("click", closeMenu, { capture: true });
}

function setView(view) {
  state.view = view;
  state.category = "";
  state.page = 1;

  $$(".nav-item").forEach((button) => {
    button.classList.toggle("nav-item--active", button.dataset.view === view);
  });

  $$(".tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === view);
  });

  fetchTasks();
}

function toggleSidebar() {
  const sidebar = $("#sidebar");
  if (!sidebar) return;

  const isOpen = !sidebar.classList.contains("mobile-open");
  sidebar.classList.toggle("mobile-open", isOpen);
  sidebar.setAttribute("aria-expanded", String(isOpen));

  const toggleButtons = [$("#menuToggle"), $("#clearFiltersBtn")];
  toggleButtons.forEach((button) => {
    if (!button) return;
    const shouldShowClose = isOpen;
    button.classList.toggle("is-open", shouldShowClose);
    button.setAttribute(
      "aria-label",
      shouldShowClose ? "Fechar menu lateral" : "Abrir menu lateral",
    );

    if (button.id === "clearFiltersBtn") {
      button.innerHTML = shouldShowClose
        ? '<span aria-hidden="true">×</span>'
        : '<span class="sidebar-burger" aria-hidden="true"><span></span><span></span><span></span></span>';
    } else {
      button.textContent = shouldShowClose ? "×" : "☰";
    }
  });
}

function closeSidebar() {
  const sidebar = $("#sidebar");
  if (!sidebar) return;

  sidebar.classList.remove("mobile-open");
  sidebar.setAttribute("aria-expanded", "false");

  const menuToggle = $("#menuToggle");
  if (menuToggle) {
    menuToggle.classList.remove("is-open");
    menuToggle.textContent = "☰";
    menuToggle.setAttribute("aria-label", "Abrir menu");
  }

  const launcher = $("#clearFiltersBtn");
  if (launcher) {
    launcher.classList.remove("is-open");
    launcher.innerHTML =
      '<span class="sidebar-burger" aria-hidden="true"><span></span><span></span><span></span></span>';
    launcher.setAttribute("aria-label", "Abrir menu lateral");
  }
}

function openNewTask() {
  resetTaskForm();
  if (elements.taskModal) elements.taskModal.hidden = false;
  elements.taskTitle?.focus();
}

function resetTaskForm() {
  state.editingId = null;
  resetTaskFormState();
}

function closeModal() {
  if (elements.taskModal) elements.taskModal.hidden = true;
}

function showToast(message, type = "success") {
  if (!elements.toast) return;
  elements.toast.textContent = message;
  elements.toast.className = `toast show ${type}`;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    elements.toast.className = "toast";
  }, 2800);
}
