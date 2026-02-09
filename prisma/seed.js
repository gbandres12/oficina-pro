const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const { hash } = require('bcrypt-ts');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL || "";
// Incluímos prisma+postgres:// pois o proxy local do Prisma também precisa do adaptador pg para funcionar corretamente no ambiente Node.js
const isStandardPostgres = databaseUrl.startsWith('postgres://') ||
    databaseUrl.startsWith('postgresql://') ||
    databaseUrl.startsWith('prisma+postgres://');

function createPrismaClient() {
    if (isStandardPostgres) {
        const pool = new Pool({ connectionString: databaseUrl });
        const adapter = new PrismaPg(pool);
        return new PrismaClient({ adapter, log: ['error', 'warn'] });
    }
    return new PrismaClient({ log: ['error', 'warn'] });
}

const prisma = createPrismaClient();

async function main() {
    console.log('Iniciando seed...');
    const adminPassword = await hash('admin123', 10);
    const employeePassword = await hash('user123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@andres.com' },
        update: {
            password: adminPassword, // Garantir que a senha seja resetada se já existir
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
        if (e.code === 'ECONNREFUSED') {
            console.error('\n❌ ERRO DE CONEXÃO: O banco de dados não está respondendo.');
            console.error('Certifique-se de que o Prisma Postgres local ou seu banco remoto está ativo.');
        }
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
