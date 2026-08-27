const STORAGE_KEY = "fernando-todo-list-v1";

const seed = [
  {
    id: "1",
    title: "Estudar Física Quântica",
    description: "Revisar conceitos principais e resolver exercícios.",
    status: "PENDING",
    priority: "HIGH",
    dueDate: dateFromNow(0),
    category: "Estudos",
    createdAt: dateFromNow(-1),
  },
  {
    id: "2",
    title: "Fazer exercícios de Matemática",
    description: "Resolver a lista de exercícios da semana.",
    status: "PENDING",
    priority: "MEDIUM",
    dueDate: dateFromNow(1),
    category: "Estudos",
    createdAt: dateFromNow(-2),
  },
  {
    id: "3",
    title: "Trabalhar no projeto da faculdade",
    description: "Implementar a próxima funcionalidade do projeto.",
    status: "PENDING",
    priority: "HIGH",
    dueDate: dateFromNow(3),
    category: "Projetos",
    createdAt: dateFromNow(-3),
  },
  {
    id: "4",
    title: "Ler artigo sobre Relatividade",
    description: "Fazer anotações dos pontos mais importantes.",
    status: "COMPLETED",
    priority: "LOW",
    dueDate: dateFromNow(-2),
    category: "Estudos",
    createdAt: dateFromNow(-4),
  },
  {
    id: "5",
    title: "Assistir aula gravada",
    description: "Revisar a aula de ontem.",
    status: "COMPLETED",
    priority: "LOW",
    dueDate: dateFromNow(-4),
    category: "Estudos",
    createdAt: dateFromNow(-5),
  },
  {
    id: "6",
    title: "Revisar anotações de Termodinâmica",
    description: "Organizar fórmulas e conceitos.",
    status: "PENDING",
    priority: "MEDIUM",
    dueDate: dateFromNow(5),
    category: "Estudos",
    createdAt: dateFromNow(-6),
  },
  {
    id: "7",
    title: "Preparar apresentação do seminário",
    description: "Montar slides e revisar a apresentação.",
    status: "PENDING",
    priority: "HIGH",
    dueDate: dateFromNow(8),
    category: "Trabalho",
    createdAt: dateFromNow(-7),
  },
  {
    id: "8",
    title: "Comprar livros de Física",
    description: "Pesquisar preços e escolher os livros.",
    status: "PENDING",
    priority: "LOW",
    dueDate: dateFromNow(10),
    category: "Pessoais",
    createdAt: dateFromNow(-8),
  },
  {
    id: "9",
    title: "Publicar projeto no GitHub",
    description: "Revisar README e organizar repositório.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: dateFromNow(2),
    category: "Projetos",
    createdAt: dateFromNow(-9),
  },
  {
    id: "10",
    title: "Organizar ambiente de estudos",
    description: "Limpar mesa e organizar materiais.",
    status: "COMPLETED",
    priority: "LOW",
    dueDate: dateFromNow(-1),
    category: "Pessoais",
    createdAt: dateFromNow(-10),
  },
  {
    id: "11",
    title: "Estudar JavaScript",
    description: "Revisar módulos, promises e async/await.",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    dueDate: dateFromNow(4),
    category: "Estudos",
    createdAt: dateFromNow(-11),
  },
  {
    id: "12",
    title: "Documentar API REST",
    description: "Adicionar endpoints e exemplos ao README.",
    status: "PENDING",
    priority: "MEDIUM",
    dueDate: dateFromNow(7),
    category: "Projetos",
    createdAt: dateFromNow(-12),
  },
];

function dateFromNow(days) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return [...seed];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [...seed];
  }
}
function save(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
function clone(tasks) {
  return tasks.map((t) => ({ ...t }));
}

export async function getTasks(params = {}) {
  let tasks = clone(load());
  const search = (params.search || "").toLowerCase();
  if (search)
    tasks = tasks.filter((t) =>
      `${t.title} ${t.description} ${t.category}`
        .toLowerCase()
        .includes(search),
    );
  if (params.status) tasks = tasks.filter((t) => t.status === params.status);
  if (params.priority)
    tasks = tasks.filter((t) => t.priority === params.priority);
  const priorityRank = { LOW: 1, MEDIUM: 2, HIGH: 3 };
  const field = params.sortBy || "createdAt";
  tasks.sort((a, b) => {
    let av = field === "priority" ? priorityRank[a.priority] : (a[field] ?? "");
    let bv = field === "priority" ? priorityRank[b.priority] : (b[field] ?? "");
    if (field === "title") {
      av = String(av).toLowerCase();
      bv = String(bv).toLowerCase();
    }
    if (av < bv) return params.sortOrder === "asc" ? -1 : 1;
    if (av > bv) return params.sortOrder === "asc" ? 1 : -1;
    return 0;
  });
  const page = Number(params.page || 1),
    limit = Number(params.limit || 8);
  const totalPages = Math.max(1, Math.ceil(tasks.length / limit));
  const safePage = Math.min(page, totalPages);
  return {
    tasks: tasks.slice((safePage - 1) * limit, safePage * limit),
    total: tasks.length,
    page: safePage,
    totalPages,
  };
}

export async function getStats() {
  const tasks = load();
  return {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "COMPLETED").length,
    pending: tasks.filter((t) => t.status === "PENDING").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    overdue: tasks.filter((t) => isOverdue(t)).length,
    today: tasks.filter((t) => isToday(t.dueDate)).length,
    important: tasks.filter((t) => t.priority === "HIGH").length,
    archived: tasks.filter((t) => t.archived).length,
    categories: tasks.reduce(
      (a, t) => ((a[t.category] = (a[t.category] || 0) + 1), a),
      {},
    ),
  };
}
export async function createTask(payload) {
  const tasks = load();
  const task = {
    ...payload,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
  };
  tasks.unshift(task);
  save(tasks);
  return task;
}
export async function updateTask(id, payload) {
  const tasks = load();
  const i = tasks.findIndex((t) => t.id === id);
  if (i < 0) throw new Error("Tarefa não encontrada.");
  tasks[i] = { ...tasks[i], ...payload, updatedAt: new Date().toISOString() };
  save(tasks);
  return tasks[i];
}
export async function deleteTask(id) {
  save(load().filter((t) => t.id !== id));
}
export async function deleteTasks(ids) {
  const set = new Set(ids);
  save(load().filter((t) => !set.has(t.id)));
}
export async function archiveTask(id) {
  return updateTask(id, { archived: true });
}
export function isToday(value) {
  if (!value) return false;
  const d = new Date(value),
    n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}
export function isOverdue(task) {
  return Boolean(
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "COMPLETED" &&
    !task.archived,
  );
}
export function resetDemoData() {
  localStorage.removeItem(STORAGE_KEY);
}
