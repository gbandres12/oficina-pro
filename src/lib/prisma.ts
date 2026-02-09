import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined,
    pool: Pool | undefined
};

const databaseUrl = process.env.DATABASE_URL || "";
const isStandardPostgres = databaseUrl.startsWith('postgres://') ||
    databaseUrl.startsWith('postgresql://') ||
    databaseUrl.startsWith('prisma+postgres://');

function createPrismaClient() {
    if (isStandardPostgres) {
        if (!globalForPrisma.pool) {
            globalForPrisma.pool = new Pool({ connectionString: databaseUrl });
        }
        const adapter = new PrismaPg(globalForPrisma.pool);
        return new PrismaClient({ adapter, log: ['error'] });
    }
    return new PrismaClient({ log: ['error'] });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
