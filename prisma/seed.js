const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const employeePassword = await bcrypt.hash('user123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@andres.com' },
        update: {},
        create: {
            email: 'admin@andres.com',
            name: 'Gabriel Andres',
            password: adminPassword,
            role: 'ADMIN',
        },
    });

    const employee = await prisma.user.upsert({
        where: { email: 'funcionario@andres.com' },
        update: {},
        create: {
            email: 'funcionario@andres.com',
            name: 'João Mecânico',
            password: employeePassword,
            role: 'EMPLOYEE',
        },
    });

    console.log({ admin, employee });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
