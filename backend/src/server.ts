import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Tasks: http://localhost:${PORT}/api/tasks`);
  console.log(`Stats: http://localhost:${PORT}/api/tasks/stats`);
  console.log(`Ambiente: ${process.env.NODE_ENV || "development"}`);
});
