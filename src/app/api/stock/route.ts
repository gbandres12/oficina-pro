import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const result = await db.query(`
            SELECT 
                id, 
                name, 
                sku, 
                stock, 
                price, 
                "minStock" as min, 
                unit,
                CASE 
                    WHEN stock <= 0 THEN 'OUT'
                    WHEN stock <= "minStock" THEN 'LOW'
                    ELSE 'OK'
                END as status
            FROM "InventoryItem"
            ORDER BY name ASC
        `);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching stock:', error);
        return NextResponse.json(
            { error: 'Error fetching stock' },
            { status: 500 }
        );
    }
}
