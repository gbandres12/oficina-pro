import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
    let client;

    try {
        client = await pool.connect();

        // Buscar transações financeiras com informações de cliente via ServiceOrder, se houver
        const result = await client.query(`
            SELECT 
                ft.id,
                ft.type,
                ft.amount,
                ft.description,
                ft.category,
                ft.status,
                ft.date,
                ft."costCenterId",
                ft."serviceOrderId",
                cc.name as "costCenterName",
                so.number as "soNumber",
                c.name as "clientName"
            FROM "FinancialTransaction" ft
            LEFT JOIN "CostCenter" cc ON ft."costCenterId" = cc.id
            LEFT JOIN "ServiceOrder" so ON ft."serviceOrderId" = so.id
            LEFT JOIN "Client" c ON so."clientId" = c.id
            ORDER BY ft.date DESC
            LIMIT 500
        `);

        return NextResponse.json({
            success: true,
            transactions: result.rows,
        });

    } catch (error) {
        console.error('Erro ao buscar transações financeiras:', error);

        return NextResponse.json(
            {
                error: 'Erro ao buscar transações financeiras',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    } finally {
        if (client) {
            client.release();
        }
    }
}
