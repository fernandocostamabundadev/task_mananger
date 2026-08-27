import { Router } from "express";
import TaskController from "../controllers/task.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createTaskSchema,
  updateTaskSchema,
} from "../validation/task.validatation.js";

const router = Router();
// 1 buscar todas tarefas
/**
 * @openapi
 * /api/tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Lista tarefas com filtros e paginação
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, dueDate, priority, title]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista paginada de tarefas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TasksPaginatedResponse'
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", TaskController.findAll);
// 2 buscar por status da tarefa
/**
 * @openapi
 * /api/tasks/stats:
 *   get:
 *     tags: [Tasks]
 *     summary: Retorna estatísticas das tarefas
 *     responses:
 *       200:
 *         description: Estatísticas da API
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskStats'
 *       400:
 *         description: Erro ao consultar estatísticas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/stats", TaskController.getStats);
// 3 eliminar varias tarefas
/**
 * @openapi
 * /api/tasks/bulk:
 *   delete:
 *     tags: [Tasks]
 *     summary: Remove várias tarefas em lote
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Quantidade de tarefas removidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BulkDeleteResponse'
 *       400:
 *         description: Erro ao excluir em lote
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/bulk", TaskController.bulkDelete);
// 4 criar tarefa
/**
 * @openapi
 * /api/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Cria uma nova tarefa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskInput'
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", validate(createTaskSchema), TaskController.create);
// 5 buscar por id
/**
 * @openapi
 * /api/tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Busca uma tarefa por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tarefa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Tarefa não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", TaskController.findById);
// 6 atualizar tarefa
/**
 * @openapi
 * /api/tasks/{id}:
 *   put:
 *     tags: [Tasks]
 *     summary: Atualiza uma tarefa
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskInput'
 *     responses:
 *       200:
 *         description: Tarefa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", validate(updateTaskSchema), TaskController.update);
// 7 eliminar tarefa (soft-delet)
/**
 * @openapi
 * /api/tasks/{id}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Remove uma tarefa com soft delete
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Tarefa removida com sucesso
 *       400:
 *         description: Erro ao excluir tarefa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", TaskController.delete);
// 8 restaurar tarefa
/**
 * @openapi
 * /api/tasks/{id}/restore:
 *   patch:
 *     tags: [Tasks]
 *     summary: Restaura uma tarefa excluída
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tarefa restaurada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Erro ao restaurar tarefa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/:id/restore", TaskController.restore);

export default router;
