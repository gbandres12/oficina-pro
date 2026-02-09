const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const { hash } = require('bcrypt-ts');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL || "";

function createPrismaClient() {
    if (!databaseUrl) {
        throw new Error("DATABASE_URL não configurada no .env");
    }

    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
    console.log('Iniciando seed no Supabase...');
    const adminPassword = await hash('admin123', 10);
    const employeePassword = await hash('user123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@andres.com' },
        update: {
            password: adminPassword,
        },
        create: {
            email: 'admin@andres.com',
            name: 'Gabriel Andres',
            password: adminPassword,
            role: 'ADMIN',
        },
    });

    const checklistUser = await prisma.user.upsert({
        where: { email: 'checklist@andres.com' },
        update: {
            password: employeePassword,
        },
        create: {
            email: 'checklist@andres.com',
            name: 'Pedro Checklist',
            password: employeePassword,
            role: 'EMPLOYEE',
        },
    });

    console.log('Seed finalizado com sucesso!');
    console.log('Admin:', admin.email);
    console.log('Checklist:', checklistUser.email);
}

main()
    .catch((e) => {
        console.error('Erro no Seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
