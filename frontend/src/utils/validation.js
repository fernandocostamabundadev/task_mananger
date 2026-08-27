export function validateTaskInput(task) {
  if (!task.title || !task.title.trim()) {
    return 'Informe um título para a tarefa.';
  }

  if (task.title.trim().length < 2) {
    return 'O título deve ter pelo menos 2 caracteres.';
  }

  if (task.description && task.description.trim().length > 500) {
    return 'A descrição deve ter no máximo 500 caracteres.';
  }

  if (!task.status) {
    return 'Selecione um status para a tarefa.';
  }

  if (!task.priority) {
    return 'Selecione uma prioridade para a tarefa.';
  }

  if (!task.category) {
    return 'Selecione uma categoria para a tarefa.';
  }

  if (task.dueDate && Number.isNaN(new Date(task.dueDate).getTime())) {
    return 'A data informada é inválida.';
  }

  return '';
}
