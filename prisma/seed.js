const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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

    const checklistUser = await prisma.user.upsert({
        where: { email: 'checklist@andres.com' },
        update: {},
        create: {
            email: 'checklist@andres.com',
            name: 'Pedro Checklist',
            password: employeePassword, // use the same default password: user123
            role: 'EMPLOYEE',
        },
    });

    console.log({ admin, employee, checklistUser });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
