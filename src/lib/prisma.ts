import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined,
    pool: Pool | undefined
};

const databaseUrl = process.env.DATABASE_URL || "";

function createPrismaClient() {
    // Definimos o log com 'as any' para evitar conflitos de tipo de string no build da Vercel
    const logValue: any = process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"];

    // Caso de build sem URL
    if (!databaseUrl) {
        return new PrismaClient({ log: logValue });
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
        log: logValue,
        adapter,
    });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
