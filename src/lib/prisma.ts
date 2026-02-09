import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined,
    pool: Pool | undefined
};

const databaseUrl = process.env.DATABASE_URL || "";

// Só usamos o adaptador se tivermos uma URL válida
const useAdapter = databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://');

function createPrismaClient() {
    // Caso especial para o deploy da Vercel (evita erro no build)
    if (!databaseUrl && process.env.NODE_ENV === "production") {
        return new PrismaClient();
    }

    if (useAdapter) {
        if (!globalForPrisma.pool) {
            globalForPrisma.pool = new Pool({
                connectionString: databaseUrl,
                max: 10,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });
        }
        const adapter = new PrismaPg(globalForPrisma.pool);
        return new PrismaClient({ adapter, log: ['error'] });
    }

    return new PrismaClient({
        log: ['error'],
    });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
