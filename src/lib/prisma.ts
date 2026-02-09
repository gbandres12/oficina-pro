import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined,
    pool: Pool | undefined
};

const databaseUrl = process.env.DATABASE_URL || "";

// Suporte para protocolos padrão e o proxy do Prisma
const isPostgres = databaseUrl.startsWith('postgres://') ||
    databaseUrl.startsWith('postgresql://') ||
    databaseUrl.startsWith('prisma+postgres://');

function createPrismaClient() {
    // SEMPRE passar um objeto de opções não-vazio para o Prisma 7
    const options: any = {
        log: ['error'],
    };

    if (isPostgres && databaseUrl) {
        if (!globalForPrisma.pool) {
            globalForPrisma.pool = new Pool({
                connectionString: databaseUrl,
                max: 10,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 5000,
            });
        }
        const adapter = new PrismaPg(globalForPrisma.pool);
        options.adapter = adapter;
    }

    return new PrismaClient(options);
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
