import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined,
};

// Configuração para usar o driver adapter (necessário para o erro engineType: client no Prisma 7)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.warn("DATABASE_URL não encontrada. Certifique-ve que as variáveis de ambiente estão configuradas.");
}

const pool = new Pool({
    connectionString,
    max: 10, // Limite de conexões para evitar estourar o banco no Vercel
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
const adapter = new PrismaPg(pool);

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log: ["error"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
