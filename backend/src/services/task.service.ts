import TaskRepository, {
  CreateTaskData,
  UpdateTaskData,
  TaskFilters,
  PaginatedResult,
} from "../repository/task.repository";
import { Task } from "@prisma/client";

// 1. TIPOS

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
}

// 2. SERVICE (Nível Intermediário)

export class TaskService {
  // 2.1 MÉTODOS PÚBLICOS

  // 1. CRIAR tarefa
  async create(data: CreateTaskData): Promise<Task> {
    this.validateCreate(data);
    const sanitized = this.sanitizeCreate(data);
    return await TaskRepository.create(sanitized);
  }

  // 2. BUSCAR tarefa POR ID
  async findById(id: string): Promise<Task> {
    this.validateId(id);
    return await TaskRepository.findById(id);
  }

  // 3. LISTAR TODAS tarefas (com filtros e paginação)
  async findAll(filters: TaskFilters = {}): Promise<PaginatedResult> {
    return await TaskRepository.findAll(filters);
  }

  // 4. ATUALIZAR tarefa
  async update(id: string, data: UpdateTaskData): Promise<Task> {
    this.validateId(id);
    this.validateUpdate(data);

    // Verifica se existe
    await TaskRepository.findById(id);

    const sanitized = this.sanitizeUpdate(data);
    return await TaskRepository.update(id, sanitized);
  }

  // 5. DELETAR tarefa (Soft Delete)
  async delete(id: string): Promise<Task> {
    this.validateId(id);
    return await TaskRepository.delete(id);
  }

  // 6. RESTAURAR tarefa
  async restore(id: string): Promise<Task> {
    this.validateId(id);
    return await TaskRepository.restore(id);
  }

  // 7. ESTATÍSTICAS de tarefa
  async getStats(): Promise<TaskStats> {
    return await TaskRepository.getStats();
  }

  // 8. DELETAR MÚLTIPLAS tarefas (Soft Delete)
  async bulkDelete(ids: string[]): Promise<{ count: number }> {
    if (!ids || ids.length === 0) {
      throw new Error("Pelo menos um ID é obrigatório");
    }
    return await TaskRepository.bulkDelete(ids);
  }

  // 2.2 MÉTODOS PRIVADOS DE VALIDAÇÃO

  private validateId(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new Error("ID é obrigatório");
    }
  }

  private validateCreate(data: CreateTaskData): void {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error("Título é obrigatório");
    }

    if (data.title.length < 3) {
      throw new Error("Título deve ter no mínimo 3 caracteres");
    }

    if (data.title.length > 100) {
      throw new Error("Título deve ter no máximo 100 caracteres");
    }

    if (data.description && data.description.length > 500) {
      throw new Error("Descrição deve ter no máximo 500 caracteres");
    }
  }

  private validateUpdate(data: UpdateTaskData): void {
    if (data.title !== undefined) {
      if (data.title.trim().length === 0) {
        throw new Error("Título não pode ser vazio");
      }
      if (data.title.length < 3) {
        throw new Error("Título deve ter no mínimo 3 caracteres");
      }
      if (data.title.length > 100) {
        throw new Error("Título deve ter no máximo 100 caracteres");
      }
    }

    if (
      data.description !== undefined &&
      data.description &&
      data.description.length > 500
    ) {
      throw new Error("Descrição deve ter no máximo 500 caracteres");
    }
  }

  // 2.3 MÉTODOS PRIVADOS DE SANITIZAÇÃO

  private sanitizeCreate(data: CreateTaskData): CreateTaskData {
    return {
      ...data,
      title: data.title.trim(),
      description: data.description?.trim() || null,
    };
  }

  private sanitizeUpdate(data: UpdateTaskData): UpdateTaskData {
    const sanitized: UpdateTaskData = {};

    if (data.title !== undefined) {
      sanitized.title = data.title.trim();
    }

    if (data.description !== undefined) {
      sanitized.description = data.description?.trim() || null;
    }

    if (data.status !== undefined) {
      sanitized.status = data.status;
    }

    if (data.priority !== undefined) {
      sanitized.priority = data.priority;
    }

    if (data.dueDate !== undefined) {
      sanitized.dueDate = data.dueDate;
    }

    return sanitized;
  }
}

export default new TaskService();
