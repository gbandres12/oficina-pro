const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const { compare } = require('bcrypt-ts');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

async function check() {
    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        const user = await prisma.user.findUnique({
            where: { email: 'admin@andres.com' }
        });

        if (!user) {
            console.log('USUÁRIO NÃO ENCONTRADO NO BANCO!');
            return;
        }

        console.log('Usuário encontrado:', user.email);
        console.log('Hash no banco:', user.password);

        const match = await compare('admin123', user.password);
        console.log('A senha "admin123" confere?', match ? 'SIM ✅' : 'NÃO ❌');

    } catch (e) {
        console.error('Erro ao verificar:', e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

check();
