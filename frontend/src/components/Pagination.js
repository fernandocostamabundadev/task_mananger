export function renderPagination({ page, totalPages, onPrev, onNext }) {
  const el = document.createElement("div");
  el.className = "pagination-controls";
  el.innerHTML = `<button class="page-btn" data-page="prev" ${page <= 1 ? "disabled" : ""}>‹</button><button class="page-current">${page}</button><button class="page-btn" data-page="next" ${page >= totalPages ? "disabled" : ""}>›</button>`;
  el.querySelector('[data-page="prev"]')?.addEventListener("click", onPrev);
  el.querySelector('[data-page="next"]')?.addEventListener("click", onNext);
  return el;
}
