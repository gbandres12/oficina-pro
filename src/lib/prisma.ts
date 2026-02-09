import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined,
};

// Estratégia definitiva para Vercel: deixar o Prisma gerenciar a conexão
// baseada inteiramente no arquivo schema.prisma e na variável de ambiente DATABASE_URL
export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ["error"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
