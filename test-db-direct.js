require('dotenv').config();
const { Pool } = require('pg');

async function test() {
    const pool = new Pool({
        user: 'postgres',
        host: 'db.lpklungmdugkdqzzxaul.supabase.co',
        database: 'postgres',
        password: 'b7CTpsw46V4yhmFE',
        port: 5432,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Testando CONEXÃO DIRETA (us-west-2)...');
        const res = await pool.query('SELECT NOW()');
        console.log('CONEXÃO DIRETA OK!', res.rows[0]);
    } catch (err) {
        console.error('Falha DIRETA:', err.message);
    } finally {
        await pool.end();
    }
}

test();
