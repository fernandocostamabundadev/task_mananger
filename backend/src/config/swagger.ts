import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Task Manager API",
    version: "1.0.0",
    description:
      "API para gerenciamento de tarefas com TypeScript, Express e Prisma.",
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: "Servidor local de desenvolvimento",
    },
  ],
  tags: [{ name: "Tasks", description: "Operações de gerenciamento de tarefas" }],
  components: {
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string" },
          details: { type: "object" },
        },
      },
      Task: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          status: { type: "string", enum: ["PENDING", "IN_PROGRESS", "COMPLETED"] },
          priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
          dueDate: { type: "string", format: "date-time", nullable: true },
          completedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          deletedAt: { type: "string", format: "date-time", nullable: true },
        },
      },
      CreateTaskInput: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", minLength: 3, maxLength: 100 },
          description: { type: "string", nullable: true, maxLength: 500 },
          status: { type: "string", enum: ["PENDING", "IN_PROGRESS", "COMPLETED"] },
          priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
          dueDate: { type: "string", format: "date-time", nullable: true },
        },
      },
      UpdateTaskInput: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 3, maxLength: 100 },
          description: { type: "string", nullable: true, maxLength: 500 },
          status: { type: "string", enum: ["PENDING", "IN_PROGRESS", "COMPLETED"] },
          priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
          dueDate: { type: "string", format: "date-time", nullable: true },
        },
      },
      TaskStats: {
        type: "object",
        properties: {
          total: { type: "integer" },
          completed: { type: "integer" },
          pending: { type: "integer" },
          inProgress: { type: "integer" },
        },
      },
      BulkDeleteResponse: {
        type: "object",
        properties: {
          count: { type: "integer" },
        },
      },
      TasksPaginatedResponse: {
        type: "object",
        properties: {
          tasks: {
            type: "array",
            items: { $ref: "#/components/schemas/Task" },
          },
          total: { type: "integer" },
          page: { type: "integer" },
          limit: { type: "integer" },
          totalPages: { type: "integer" },
        },
      },
    },
  },
};

export const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: ["./src/routes/*.ts"],
});
