import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined,
    pool: Pool | undefined
};

const databaseUrl = process.env.DATABASE_URL || "";

function createPrismaClient() {
    // Configurações base para o Prisma 7
    const baseOptions = {
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    };

    // Se estivermos em um ambiente de build ou sem URL, retornamos um cliente mínimo
    // para evitar erros de inicialização durante o build da Vercel
    if (!databaseUrl) {
        return new PrismaClient(baseOptions);
    }

    // Para o Prisma 7, precisamos usar o adaptador para conexões diretas (ex: Supabase)
    if (!globalForPrisma.pool) {
        globalForPrisma.pool = new Pool({
            connectionString: databaseUrl,
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        });
    }

    const adapter = new PrismaPg(globalForPrisma.pool);
    return new PrismaClient({
        ...baseOptions,
        adapter,
    });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
