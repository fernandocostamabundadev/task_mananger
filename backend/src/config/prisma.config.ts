import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

// ============================================================
// 1. CONFIGURAÇÕES DO PRISMA
// ============================================================

const prismaOptions: any = {
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
};

// ============================================================
// 2. SINGLETON - Evita múltiplas conexões
// ============================================================

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

// ============================================================
// 3. GERENCIAMENTO DE CONEXÃO
// ============================================================

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("✅ Conectado ao banco de dados");
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco:", error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log("✅ Desconectado do banco de dados");
  } catch (error) {
    console.error("❌ Erro ao desconectar:", error);
  }
};

// ============================================================
// 4. EXPORT
// ============================================================

export default prisma;
