import { Request, Response } from "express";
import { HttpStatus } from "../constants/httpStatus.js";
import TaskService from "../services/task.service.js";

const getIdFromParams = (req: Request): string => {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
};

export class TaskController {
  // 1 criar
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const task = await TaskService.create(req.body);
      return res.status(HttpStatus.CREATED).json(task);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  }
  // 2 buscar todas tarefas
  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const filters = {
        status:
          typeof req.query.status === "string"
            ? (req.query.status as any)
            : undefined,
        priority:
          typeof req.query.priority === "string"
            ? (req.query.priority as any)
            : undefined,
        search:
          typeof req.query.search === "string" ? req.query.search : undefined,
        sortBy:
          typeof req.query.sortBy === "string"
            ? (req.query.sortBy as any)
            : undefined,
        sortOrder:
          typeof req.query.sortOrder === "string"
            ? (req.query.sortOrder as any)
            : undefined,
        limit:
          typeof req.query.limit === "string"
            ? Number(req.query.limit)
            : undefined,
        page:
          typeof req.query.page === "string"
            ? Number(req.query.page)
            : undefined,
      } as any;

      const tasks = await TaskService.findAll(filters);
      return res.status(HttpStatus.OK).json(tasks);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  }
  // 3 buscar tarefa por id
  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const id = getIdFromParams(req);
      const task = await TaskService.findById(id);
      return res.status(HttpStatus.OK).json(task);
    } catch (error: any) {
      return res.status(HttpStatus.NOT_FOUND).json({ error: error.message });
    }
  }
  // 4 atualizar tarefa
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = getIdFromParams(req);
      const task = await TaskService.update(id, req.body);
      return res.status(HttpStatus.OK).json(task);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  }
  // 5 eliminat tarefa (soft-delete)
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = getIdFromParams(req);
      await TaskService.delete(id);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  }
  // 6 restaurar tarefa
  async restore(req: Request, res: Response): Promise<Response> {
    try {
      const id = getIdFromParams(req);
      const task = await TaskService.restore(id);
      return res.status(HttpStatus.OK).json(task);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  }
  // 7 buscar status da tarefa
  async getStats(_req: Request, res: Response): Promise<Response> {
    try {
      const stats = await TaskService.getStats();
      return res.status(HttpStatus.OK).json(stats);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  }
  // 8 eliminar varias tarefas
  async bulkDelete(req: Request, res: Response): Promise<Response> {
    try {
      const ids = Array.isArray(req.body?.ids)
        ? req.body.ids
        : req.body?.id
          ? [req.body.id]
          : [];

      const result = await TaskService.bulkDelete(ids);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  }
}

export default new TaskController();
