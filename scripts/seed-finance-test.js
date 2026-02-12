const { Pool } = require('pg');
require('dotenv').config();

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    console.log('Seeding financial data via SQL for verification...');

    try {
        // Get a client and a service order (if they exist)
        const clientRes = await pool.query('SELECT id FROM "Client" LIMIT 1');
        const soRes = await pool.query('SELECT id FROM "ServiceOrder" LIMIT 1');

        const clientId = clientRes.rows[0]?.id;
        const soId = soRes.rows[0]?.id;

        if (!clientId || !soId) {
            console.warn('Warning: No client or service order found. Seeding basic transactions only.');
        }

        const now = new Date();
        const lastMonth = new Date();
        lastMonth.setMonth(now.getMonth() - 1);

        // Clear previous test data more safely
        await pool.query('DELETE FROM "FinancialTransaction" WHERE description LIKE \'% - Teste%\'');

        // Create an overdue transaction (Pending in the past)
        await pool.query(`
            INSERT INTO "FinancialTransaction" (id, type, amount, description, category, status, date, "serviceOrderId", "createdAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        `, [
            'test-overdue-' + Date.now(),
            'INCOME',
            500.00,
            'Pagamento Vencido - Teste',
            'Serviços',
            'PENDING',
            lastMonth,
            soId
        ]);

        // Create a pending transaction for today
        await pool.query(`
            INSERT INTO "FinancialTransaction" (id, type, amount, description, category, status, date, "serviceOrderId", "createdAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        `, [
            'test-pending-' + Date.now(),
            'INCOME',
            350.00,
            'Pagamento Pendente Hoje - Teste',
            'Serviços',
            'PENDING',
            now,
            soId
        ]);

        // Create a paid transaction for today
        await pool.query(`
            INSERT INTO "FinancialTransaction" (id, type, amount, description, category, status, date, "serviceOrderId", "createdAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        `, [
            'test-paid-' + Date.now(),
            'INCOME',
            1200.00,
            'Venda Concluída - Teste',
            'Vendas',
            'PAID',
            now,
            soId
        ]);

        console.log('Seed completed successfully.');
    } catch (err) {
        console.error('Error seeding data:', err);
    } finally {
        await pool.end();
    }
}

main();
