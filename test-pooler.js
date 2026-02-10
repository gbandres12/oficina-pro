const { Client } = require('pg');

const regions = ['sa-east-1', 'us-east-1'];
const password = 'pZHhgDSlll27hZpJ';
const projectId = 'lpklungmdugkdqzzxaul';

async function testRegions() {
    for (const region of regions) {
        const connectionString = `postgresql://postgres.${projectId}:${password}@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`;
        console.log(`Testando região: ${region}...`);
        const client = new Client({ connectionString });

        try {
            await client.connect();
            console.log(`✅ CONECTADO COM SUCESSO na região: ${region}`);
            const res = await client.query('SELECT current_database(), current_user');
            console.log('Info:', res.rows[0]);
            await client.end();
            return; // Stop if success
        } catch (err) {
            console.log(`❌ Falha na região ${region}:`, err.message);
        }
    }
}

testRegions();
