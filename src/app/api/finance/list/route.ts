import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // Buscar transações financeiras com informações de cliente via ServiceOrder, se houver
        const result = await db.query(`
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

        const legacyResult = await db.query(`
            SELECT COALESCE(SUM("legacyTotalValue" - "legacyPaidValue"), 0) as total
            FROM "ServiceOrder" 
            WHERE origin = 'LEGACY' 
              AND status NOT IN ('FINISHED', 'CANCELLED') 
              AND ("legacyTotalValue" - "legacyPaidValue") > 0
        `);
        const legacyPendingTotal = legacyResult.rows[0].total;

        return NextResponse.json({
            success: true,
            transactions: result.rows,
            legacyPendingTotal
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
    }
}
