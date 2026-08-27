export function renderStatsPanel(stats) {
  return `<div>${stats.total} tarefas • ${stats.completed} concluídas • ${stats.pending} pendentes</div>`;
}
