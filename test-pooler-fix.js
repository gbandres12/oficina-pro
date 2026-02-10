const { Client } = require('pg');

const password = 'pZHhgDSlll27hZpJ';
const projectId = 'lpklungmdugkdqzzxaul';

async function testPooler() {
    // Testando com o formato correto de usuário para o Pooler (user.projectid)
    const connectionString = `postgresql://postgres.${projectId}:${password}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`;

    console.log('Testando conexão via Pooler (IPv4 compatível)...');
    console.log('Host:', 'aws-0-sa-east-1.pooler.supabase.com');

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ SUCESSO! Conectado via Pooler.');
        const res = await client.query('SELECT current_database(), current_user');
        console.log('Info:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('❌ FALHA via Pooler:', err.message);
        if (err.message.includes('Tenant or user not found')) {
            console.log('\n--- DICA ---');
            console.log('O erro "Tenant or user not found" indica que o Project ID ou a senha podem estar incorretos no formato do Pooler.');
            console.log('O formato deve ser: postgres.[ID_DO_PROJETO]');
        }
    }
}

testPooler();
