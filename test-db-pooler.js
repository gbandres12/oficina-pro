require('dotenv').config();
const { Pool } = require('pg');

async function test() {
    // Testando o Pooler (Sempre prefira Pooler para IPv4)
    const pool = new Pool({
        user: 'postgres.lpklungmdugkdqzzxaul',
        host: 'aws-0-us-west-2.pooler.supabase.com',
        database: 'postgres',
        password: 'andrestech26@@',
        port: 6543,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Testando POOLER com password literal: andrestech26@@');
        const res = await pool.query('SELECT NOW()');
        console.log('Conexão POOLER OK!', res.rows[0]);
    } catch (err) {
        console.error('Falha no POOLER:', err.message);
    } finally {
        await pool.end();
    }
}

test();
