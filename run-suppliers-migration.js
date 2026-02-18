const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔄 Executando migration de fornecedores...');

        const migrationPath = path.join(__dirname, 'migrations', 'add_suppliers.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        await pool.query(sql);

        console.log('✅ Migration executada com sucesso!');
        console.log('📦 Tabela Supplier criada');
        console.log('👥 5 fornecedores de exemplo inseridos');

        // Verificar os dados
        const result = await pool.query('SELECT COUNT(*) as count FROM "Supplier"');
        console.log(`\n📊 Total de fornecedores: ${result.rows[0].count}`);

    } catch (error) {
        console.error('❌ Erro ao executar migration:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
