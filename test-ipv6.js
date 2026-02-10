const { Client } = require('pg');
require('dotenv').config();

// Tenta usar o endereço IPv6 diretamente entre colchetes
// O endereço resolvido anteriormente foi: 2600:1f13:838:6e18:96d0:f611:b9f1:7961
const ipv6Host = '[2600:1f13:838:6e18:96d0:f611:b9f1:7961]';
const password = 'pZHhgDSlll27hZpJ';
const projectId = 'lpklungmdugkdqzzxaul';

async function testIPv6() {
    console.log('Testando conexão via IPv6 direto...');

    const client = new Client({
        host: '2600:1f13:838:6e18:96d0:f611:b9f1:7961',
        port: 5432,
        user: 'postgres',
        password: password,
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ SUCESSO! Conectado via IPv6.');
        const res = await client.query('SELECT NOW()');
        console.log('Hora do banco:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('❌ FALHA via IPv6:', err.message);
    }
}

testIPv6();
