const { Pool } = require('pg');

async function test() {
    const pool = new Pool({
        user: 'postgres.lpklungmdugkdqzzxaul',
        host: 'aws-0-us-west-2.pooler.supabase.com',
        database: 'postgres',
        password: 'b7CTpsw46V4yhmFE',
        port: 6543,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Testando POOLER com novas credenciais...');
        const res = await pool.query('SELECT NOW()');
        console.log('CONEXÃO POOLER OK!', res.rows[0]);
    } catch (err) {
        console.error('ERRO NO POOLER:', err.message);
    } finally {
        await pool.end();
    }
}

test();
