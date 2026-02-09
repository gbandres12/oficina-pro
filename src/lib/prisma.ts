import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined,
};

// Versão simplificada para evitar conflitos de tipo no Prisma 7
export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ["error"],
        // @ts-ignore - Prisma 7 pode ter variações de tipo entre build e runtime
        datasourceUrl: process.env.DATABASE_URL,
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
