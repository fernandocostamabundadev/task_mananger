import { z } from "zod";

// 1. TIPOS (inferidos automaticamente pelo Zod)

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

// 2. SCHEMA DE CRIAÇÃO

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(3, "Título deve ter no mínimo 3 caracteres")
    .max(100, "Título deve ter no máximo 100 caracteres"),

  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .nullable()
    .optional(),

  status: z
    .enum(["PENDING", "IN_PROGRESS", "COMPLETED"])
    .default("PENDING")
    .optional(),

  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM").optional(),

  dueDate: z
    .string()
    .datetime({ message: "Data deve estar no formato ISO" })
    .nullable()
    .optional(),
});

// 3. SCHEMA DE ATUALIZAÇÃO

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .min(3, "Título deve ter no mínimo 3 caracteres")
      .max(100, "Título deve ter no máximo 100 caracteres")
      .optional(),

    description: z
      .string()
      .max(500, "Descrição deve ter no máximo 500 caracteres")
      .nullable()
      .optional(),

    status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),

    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),

    dueDate: z
      .string()
      .datetime({ message: "Data deve estar no formato ISO" })
      .nullable()
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Pelo menos um campo deve ser atualizado",
  });

// 4. TIPOS INFERIDOS

export type CreateTaskDTO = z.infer<typeof createTaskSchema>;
export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>;

// 5. FUNÇÕES DE VALIDAÇÃO (opcional)

export const validateCreateTask = (data: unknown) => {
  return createTaskSchema.safeParse(data);
};

export const validateUpdateTask = (data: unknown) => {
  return updateTaskSchema.safeParse(data);
};
