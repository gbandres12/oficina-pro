import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
    let client;

    try {
        client = await pool.connect();

        // Buscar clientes com contagem de ordens e total gasto
        const result = await client.query(`
            SELECT 
                c.id,
                c.name,
                c.email,
                c.phone,
                c.document,
                c."createdAt",
                COUNT(DISTINCT so.id) as "orderCount",
                COALESCE(SUM(si.price * si.quantity) + SUM(pi.price * pi.quantity), 0) as "totalSpent"
            FROM "Client" c
            LEFT JOIN "ServiceOrder" so ON c.id = so."clientId"
            LEFT JOIN "ServiceItem" si ON so.id = si."serviceOrderId"
            LEFT JOIN "PartItem" pi ON so.id = pi."serviceOrderId"
            GROUP BY c.id, c.name, c.email, c.phone, c.document, c."createdAt"
            ORDER BY c."createdAt" DESC
        `);

        return NextResponse.json({
            success: true,
            clients: result.rows,
        });

    } catch (error) {
        console.error('Erro ao buscar clientes:', error);

        return NextResponse.json(
            {
                error: 'Erro ao buscar clientes',
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
