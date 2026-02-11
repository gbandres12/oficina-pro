require('dotenv').config();
const { Pool } = require('pg');

async function test() {
    const pool = new Pool({
        user: 'postgres.lpklungmdugkdqzzxaul',
        host: 'aws-0-us-west-2.pooler.supabase.com',
        database: 'postgres',
        password: 'pZHhgDSlll27hZpJ',
        port: 6543,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Testando POOLER com SENHA ANTIGA');
        const res = await pool.query('SELECT NOW()');
        console.log('Conexão SENHA ANTIGA OK!', res.rows[0]);
    } catch (err) {
        console.error('Falha SENHA ANTIGA:', err.message);
    } finally {
        await pool.end();
    }
}

test();
