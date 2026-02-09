const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt-ts');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando seed...');
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
