import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        let query = `
            SELECT 
                id, 
                name, 
                sku, 
                quantity as stock, 
                "unitPrice" as price, 
                "minQuantity" as min, 
                CASE 
                    WHEN quantity <= 0 THEN 'OUT'
                    WHEN quantity <= "minQuantity" THEN 'LOW'
                    ELSE 'OK'
                END as status
            FROM "InventoryItem"
        `;

        const values: any[] = [];
        if (search) {
            query += ` WHERE name ILIKE $1 OR sku ILIKE $1 `;
            values.push(`%${search}%`);
        }

        query += ` ORDER BY name ASC LIMIT 50 `;

        const result = await db.query(query, values);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching stock:', error);
        return NextResponse.json(
            { error: 'Error fetching stock' },
            { status: 500 }
        );
    }
}
