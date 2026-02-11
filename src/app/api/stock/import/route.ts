import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { items } = await request.json();

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: 'Lista de itens inválida' }, { status: 400 });
        }

        const results = await Promise.all(
            items.map(async (item: any) => {
                const id = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                return db.fetchOne(`
                    INSERT INTO "InventoryItem" (id, name, sku, quantity, "minQuantity", "unitPrice", "updatedAt")
                    VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
                    ON CONFLICT (sku) DO UPDATE SET
                        quantity = "InventoryItem".quantity + EXCLUDED.quantity,
                        "unitPrice" = EXCLUDED."unitPrice",
                        "updatedAt" = CURRENT_TIMESTAMP
                    RETURNING *
                `, [id, item.name, item.sku, item.quantity || 0, item.minQuantity || 5, item.price || 0]);
            })
        );

        return NextResponse.json({ success: true, count: results.length });
    } catch (error: any) {
        console.error('Import error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
