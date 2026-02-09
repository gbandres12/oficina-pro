import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined,
    pool: Pool | undefined
};

const databaseUrl = process.env.DATABASE_URL || "";

function createPrismaClient() {
    const logValue: any = process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"];

    // No Prisma 7, se usarmos o driver adapter, precisamos fornecer ele sempre no construtor
    // Mesmo durante o build, senão ele lança erro de validação.

    // Se não houver URL (casos de build na Vercel), criamos um pool vazio apenas para passar a validação
    const connectionString = databaseUrl || "postgresql://postgres:postgres@localhost:5432/postgres";

    if (!globalForPrisma.pool) {
        globalForPrisma.pool = new Pool({
            connectionString,
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
