import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        // Buscar estatísticas do dashboard
        const stats = await db.query(`
            SELECT
                (SELECT COUNT(*) FROM "ServiceOrder" WHERE status IN ('IN_PROGRESS', 'WAITING_PARTS', 'APPROVED')) as "carsInShop",
                (
                    COALESCE((
                        SELECT SUM(si.price * si.quantity)
                        FROM "ServiceItem" si
                        JOIN "ServiceOrder" so ON so.id = si."serviceOrderId"
                        WHERE so."createdAt" >= date_trunc('month', CURRENT_DATE)
                          AND so."createdAt" < date_trunc('month', CURRENT_DATE) + interval '1 month'
                    ), 0)
                    +
                    COALESCE((
                        SELECT SUM(pi.price * pi.quantity)
                        FROM "PartItem" pi
                        JOIN "ServiceOrder" so ON so.id = pi."serviceOrderId"
                        WHERE so."createdAt" >= date_trunc('month', CURRENT_DATE)
                          AND so."createdAt" < date_trunc('month', CURRENT_DATE) + interval '1 month'
                    ), 0)
                ) as "monthlyRevenue",
                (SELECT COUNT(*) FROM "ServiceOrder" WHERE status IN ('OPEN', 'QUOTATION', 'APPROVED') AND origin = 'SYSTEM') as "pendingOrders",
                (SELECT COUNT(*) FROM "InventoryItem" WHERE quantity <= "minQuantity") as "stockAlerts",
                (SELECT COALESCE(SUM("legacyTotalValue" - "legacyPaidValue"), 0) FROM "ServiceOrder" WHERE origin = 'LEGACY' AND status NOT IN ('FINISHED', 'CANCELLED') AND ("legacyTotalValue" - "legacyPaidValue") > 0) as "legacyPending"
        `);

        // Buscar ordens ativas recentes
        const activeOrders = await db.query(`
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
                CASE WHEN so.status = 'WAITING_PARTS' THEN 1 ELSE 0 END as "missingParts"
            FROM "ServiceOrder" so
            JOIN "Client" c ON so."clientId" = c.id
            JOIN "Vehicle" v ON so."vehicleId" = v.id
            WHERE so.status IN ('IN_PROGRESS', 'WAITING_PARTS', 'APPROVED')
            ORDER BY so."entryDate" DESC
            LIMIT 5
        `);

        // Contar veículos aguardando peças
        const waitingParts = await db.query(`
            SELECT COUNT(*) as count FROM "ServiceOrder" WHERE status = 'WAITING_PARTS'
        `);

        // Buscar próximos agendamentos (Ordens Abertas/Orçamento)
        const nextAppointments = await db.query(`
            SELECT 
                so.id,
                so."entryDate",
                c.name as "customerName",
                v.model as "vehicleModel",
                COALESCE((
                    SELECT si.description
                    FROM "ServiceItem" si
                    WHERE si."serviceOrderId" = so.id
                    ORDER BY si.id
                    LIMIT 1
                ), 'Serviço Geral') as "serviceType"
            FROM "ServiceOrder" so
            JOIN "Client" c ON so."clientId" = c.id
            JOIN "Vehicle" v ON so."vehicleId" = v.id
            WHERE so.status IN ('OPEN', 'QUOTATION')
            ORDER BY so."entryDate" ASC
            LIMIT 5
        `);

        // Série real de faturamento (últimos 6 meses)
        const revenueByMonth = await db.query(`
            WITH months AS (
                SELECT date_trunc('month', CURRENT_DATE) - (interval '1 month' * gs) AS month_start
                FROM generate_series(5, 0, -1) AS gs
            ),
            service_revenue AS (
                SELECT date_trunc('month', so."createdAt") AS month_start, SUM(si.price * si.quantity) AS total
                FROM "ServiceItem" si
                JOIN "ServiceOrder" so ON so.id = si."serviceOrderId"
                WHERE so."createdAt" >= date_trunc('month', CURRENT_DATE) - interval '5 months'
                GROUP BY 1
            ),
            part_revenue AS (
                SELECT date_trunc('month', so."createdAt") AS month_start, SUM(pi.price * pi.quantity) AS total
                FROM "PartItem" pi
                JOIN "ServiceOrder" so ON so.id = pi."serviceOrderId"
                WHERE so."createdAt" >= date_trunc('month', CURRENT_DATE) - interval '5 months'
                GROUP BY 1
            )
            SELECT
                m.month_start::date AS month,
                (COALESCE(sr.total, 0) + COALESCE(pr.total, 0))::float AS value
            FROM months m
            LEFT JOIN service_revenue sr ON sr.month_start = m.month_start
            LEFT JOIN part_revenue pr ON pr.month_start = m.month_start
            ORDER BY m.month_start ASC
        `);

        // Distribuição por tipo de serviço (mês atual, baseado na descrição do item)
        const servicesDistribution = await db.query(`
            SELECT
                COALESCE(NULLIF(TRIM(SPLIT_PART(si.description, ' ', 1)), ''), 'Sem Serviço') AS name,
                COUNT(*)::int AS value
            FROM "ServiceItem" si
            JOIN "ServiceOrder" so ON so.id = si."serviceOrderId"
            WHERE so."createdAt" >= date_trunc('month', CURRENT_DATE)
              AND so."createdAt" < date_trunc('month', CURRENT_DATE) + interval '1 month'
            GROUP BY 1
            ORDER BY 2 DESC
            LIMIT 4
        `);

        // Status de orçamentos reais (mês atual)
        const budgetStatus = await db.query(`
            SELECT
                SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END)::int AS approved,
                SUM(CASE WHEN status IN ('OPEN', 'QUOTATION') THEN 1 ELSE 0 END)::int AS pending,
                SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END)::int AS rejected
            FROM "ServiceOrder"
            WHERE "createdAt" >= date_trunc('month', CURRENT_DATE)
              AND "createdAt" < date_trunc('month', CURRENT_DATE) + interval '1 month'
              AND origin = 'SYSTEM'
        `);

        return NextResponse.json({
            success: true,
            stats: {
                ...stats.rows[0],
                waitingParts: waitingParts.rows[0].count
            },
            activeOrders: activeOrders.rows,
            nextAppointments: nextAppointments.rows,
            charts: {
                revenueByMonth: revenueByMonth.rows,
                servicesDistribution: servicesDistribution.rows,
                budgetStatus: budgetStatus.rows[0]
            }
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
    }
}
