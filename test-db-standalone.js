require('dotenv').config();
const { Pool } = require('pg');

async function test() {
    const connectionString = process.env.DATABASE_URL;
    console.log('DATABASE_URL:', connectionString ? 'DEFINIDA' : 'NÃO DEFINIDA');

    if (!connectionString) {
        console.error('ERRO: DATABASE_URL está vindo como undefined!');
        return;
    }

    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Conexão OK:', res.rows[0]);
    } catch (err) {
        console.error('Erro ao conectar:', err);
    } finally {
        await pool.end();
    }
}

test();
