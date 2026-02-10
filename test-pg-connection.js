const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

async function testConnection() {
    console.log('Testando conexão com:', connectionString.split('@')[1]);
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        await client.connect();
        console.log('Conexão via PG bem sucedida!');
        const res = await client.query('SELECT NOW()');
        console.log('Resposta do banco:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('Erro de conexão via PG:', err.message);
        console.error('Stack:', err.stack);
    }
}

testConnection();
