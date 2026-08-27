export const state = {
  tasks: [],
  filters: {
    search: "",
    status: "",
    priority: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  view: "all",
  category: "",
  page: 1,
  limit: 8,
  totalPages: 1,
  selectedIds: new Set(),
  editingId: null,
};
