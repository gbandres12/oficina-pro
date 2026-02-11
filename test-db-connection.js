require('dotenv').config();
const { db } = require('./src/lib/db');

async function test() {
    try {
        console.log('Testando conexão com DATABASE_URL:', process.env.DATABASE_URL ? 'DEFINIDA' : 'NÃO DEFINIDA');
        const result = await db.query('SELECT NOW()');
        console.log('Sucesso!', result.rows[0]);
        process.exit(0);
    } catch (err) {
        console.error('Erro no teste:', err);
        process.exit(1);
    }
}

test();
