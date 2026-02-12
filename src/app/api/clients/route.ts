import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    try {
        if (query && query.length >= 3) {
            // Lógica de Busca (Search)
            const result = await db.query(`
                SELECT id, name, email, phone, document
                FROM "Client"
                WHERE name ILIKE $1 OR document ILIKE $1 OR phone ILIKE $1
                LIMIT 5
            `, [`%${query}%`]);

            return NextResponse.json({
                success: true,
                clients: result.rows
            });
        } else {
            // Lógica de Listagem (List)
            const result = await db.query(`
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
        }
    } catch (error) {
        console.error('Error in Clients API:', error);
        return NextResponse.json(
            {
                error: 'Internal Server Error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
