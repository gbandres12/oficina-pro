import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
    let client;

    try {
        client = await pool.connect();

        // Buscar estatísticas do dashboard
        const stats = await client.query(`
            SELECT
                (SELECT COUNT(*) FROM "ServiceOrder" WHERE status IN ('IN_PROGRESS', 'WAITING_PARTS', 'APPROVED')) as "carsInShop",
                (SELECT COALESCE(SUM(si.price * si.quantity) + SUM(pi.price * pi.quantity), 0)
                 FROM "ServiceOrder" so
                 LEFT JOIN "ServiceItem" si ON so.id = si."serviceOrderId"
                 LEFT JOIN "PartItem" pi ON so.id = pi."serviceOrderId"
                 WHERE EXTRACT(MONTH FROM so."createdAt") = EXTRACT(MONTH FROM CURRENT_DATE)
                 AND EXTRACT(YEAR FROM so."createdAt") = EXTRACT(YEAR FROM CURRENT_DATE)
                ) as "monthlyRevenue",
                (SELECT COUNT(*) FROM "ServiceOrder" WHERE status IN ('OPEN', 'QUOTATION', 'APPROVED')) as "pendingOrders",
                (SELECT COUNT(*) FROM "InventoryItem" WHERE quantity <= "minQuantity") as "stockAlerts"
        `);

        // Buscar ordens ativas recentes
        const activeOrders = await client.query(`
            SELECT 
                so.id,
                so.number,
                so.status,
                so."entryDate",
                so.km,
                c.name as "customerName",
                v.plate as "vehiclePlate",
                v.model as "vehicleModel",
                v.brand as "vehicleBrand",
                so.mechanic,
                (SELECT COUNT(*) FROM "PartItem" WHERE "serviceOrderId" = so.id AND "serviceOrderId" NOT IN (
                    SELECT DISTINCT "serviceOrderId" FROM "PartItem" WHERE "serviceOrderId" = so.id
                )) as "missingParts"
            FROM "ServiceOrder" so
            JOIN "Client" c ON so."clientId" = c.id
            JOIN "Vehicle" v ON so."vehicleId" = v.id
            WHERE so.status IN ('IN_PROGRESS', 'WAITING_PARTS', 'APPROVED')
            ORDER BY so."entryDate" DESC
            LIMIT 5
        `);

        return NextResponse.json({
            success: true,
            stats: stats.rows[0],
            activeOrders: activeOrders.rows,
        });

    } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);

        return NextResponse.json(
            {
                error: 'Erro ao buscar dados do dashboard',
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
