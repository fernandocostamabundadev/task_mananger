import prisma from "../config/prisma.config";
import { Task, TaskStatus, TaskPriority } from "@prisma/client";

// 1. INTERFACES

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "dueDate" | "priority" | "title";
  sortOrder?: "asc" | "desc";
  limit?: number;
  page?: number;
}

export interface CreateTaskData {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | string | null;
}

export interface UpdateTaskData {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | string | null;
}

export interface PaginatedResult {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 2. REPOSITORY

export class TaskRepository {
  // 1. Criar tarefa
  async create(data: CreateTaskData): Promise<Task> {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error("Título é obrigatório");
    }

    return await prisma.task.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        status: data.status || "PENDING",
        priority: data.priority || "MEDIUM",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });
  }

  // 2. lista tarefa por id
  async findById(id: string): Promise<Task> {
    const task = await prisma.task.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!task) {
      throw new Error(`Tarefa com ID ${id} não encontrada`);
    }

    return task;
  }

  // 3. listar todas as tarefas
  async findAll(filters: TaskFilters = {}): Promise<PaginatedResult> {
    const {
      status,
      priority,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      limit = 10,
      page = 1,
    } = filters;

    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (status) where.status = status;
    if (priority) where.priority = priority;

    if (search && search.trim().length > 0) {
      where.OR = [
        { title: { contains: search.trim() } },
        { description: { contains: search.trim() } },
      ];
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 4. atualizar tarefa
  async update(id: string, data: UpdateTaskData): Promise<Task> {
    try {
      await this.findById(id);

      const updateData: any = {};

      if (data.title !== undefined) {
        updateData.title = data.title.trim();
      }

      if (data.description !== undefined) {
        updateData.description = data.description?.trim() || null;
      }

      if (data.status !== undefined) {
        updateData.status = data.status;
        if (data.status === "COMPLETED") {
          updateData.completedAt = new Date();
        }
      }

      if (data.priority !== undefined) {
        updateData.priority = data.priority;
      }

      if (data.dueDate !== undefined) {
        updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
      }

      return await prisma.task.update({
        where: { id },
        data: updateData,
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new Error(`Tarefa com ID ${id} não encontrada para atualização`);
      }
      throw error;
    }
  }

  // 5. eliminar tarefa(soft-delete)
  async delete(id: string): Promise<Task> {
    try {
      await this.findById(id);

      return await prisma.task.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new Error(`Tarefa com ID ${id} não encontrada para exclusão`);
      }
      throw error;
    }
  }

  // 6. eliminar tarefa (hard-delete)
  async hardDelete(id: string): Promise<Task> {
    try {
      return await prisma.task.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new Error(`Tarefa com ID ${id} não encontrada`);
      }
      throw error;
    }
  }

  // 7. restaurar tarefa ( soft-delete )
  async restore(id: string): Promise<Task> {
    try {
      return await prisma.task.update({
        where: { id },
        data: { deletedAt: null },
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new Error(`Tarefa com ID ${id} não encontrada`);
      }
      throw error;
    }
  }

  // 8. buscar  por status
  async getStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
  }> {
    const [total, completed, pending, inProgress] = await Promise.all([
      prisma.task.count({ where: { deletedAt: null } }),
      prisma.task.count({ where: { deletedAt: null, status: "COMPLETED" } }),
      prisma.task.count({ where: { deletedAt: null, status: "PENDING" } }),
      prisma.task.count({ where: { deletedAt: null, status: "IN_PROGRESS" } }),
    ]);

    return { total, completed, pending, inProgress };
  }

  // 9. Beliminar várias tarefas (soft-delete)
  async bulkDelete(ids: string[]): Promise<{ count: number }> {
    const result = await prisma.task.updateMany({
      where: {
        id: { in: ids },
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });

    return { count: result.count };
  }
}

export default new TaskRepository();
