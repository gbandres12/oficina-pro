const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL || '';

function createPrismaClient() {
    if (!databaseUrl) {
        throw new Error('DATABASE_URL não configurada no .env');
    }

    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
    console.log('Limpando banco para ambiente de testes...');

    await prisma.saleItem.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.checklistItem.deleteMany();
    await prisma.damagePoint.deleteMany();
    await prisma.serviceItem.deleteMany();
    await prisma.partItem.deleteMany();
    await prisma.financialTransaction.deleteMany();
    await prisma.serviceOrder.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.client.deleteMany();
    await prisma.inventoryItem.deleteMany();
    await prisma.costCenter.deleteMany();
    await prisma.user.deleteMany();

    console.log('Banco limpo. Nenhum dado inicial foi inserido.');
}

main()
    .catch((e) => {
        console.error('Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
