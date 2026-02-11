require('dotenv').config();
const { Pool } = require('pg');

async function test() {
    // Configuração manual para evitar problemas de encoding na string
    const pool = new Pool({
        user: 'postgres',
        host: 'db.lpklungmdugkdqzzxaul.supabase.co',
        database: 'postgres',
        password: 'andrestech26@@',
        port: 5432,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Testando com password literal: andrestech26@@');
        const res = await pool.query('SELECT NOW()');
        console.log('Conexão OK!', res.rows[0]);
    } catch (err) {
        console.error('Falha na conexão:', err.message);
    } finally {
        await pool.end();
    }
}

test();
