import express, { Request, Response } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import taskRoutes from "./routes/task.routes.js";
import { swaggerSpec } from "./config/swagger.js";

const app = express();

// CORS - Permitir requisições do frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas
app.use("/api/tasks", taskRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "API de Tarefas - TypeScript",
    version: "1.0.0",
    endpoints: {
      tasks: "/api/tasks",
      stats: "/api/tasks/stats",
    },
  });
});

export default app;
