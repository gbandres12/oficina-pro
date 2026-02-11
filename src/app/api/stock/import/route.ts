import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const stockItemSchema = z.object({
    name: z.string().min(2).max(160),
    sku: z.string().min(1).max(80),
    quantity: z.number().nonnegative().default(0),
    minQuantity: z.number().nonnegative().default(5),
    price: z.number().nonnegative().default(0),
});

const stockImportSchema = z.object({
    items: z.array(stockItemSchema).min(1).max(1000),
});

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const parsed = stockImportSchema.safeParse(payload);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Lista de itens inválida', details: parsed.error.flatten() }, { status: 400 });
        }

        const { items } = parsed.data;

        await db.withTransaction(async (client) => {
            for (const item of items) {
                await client.query(
                    `INSERT INTO "InventoryItem" (id, name, sku, quantity, "minQuantity", "unitPrice", "updatedAt")
                     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
                     ON CONFLICT (sku) DO UPDATE SET
                        name = EXCLUDED.name,
                        quantity = "InventoryItem".quantity + EXCLUDED.quantity,
                        "unitPrice" = EXCLUDED."unitPrice",
                        "minQuantity" = EXCLUDED."minQuantity",
                        "updatedAt" = CURRENT_TIMESTAMP`,
                    [crypto.randomUUID(), item.name.trim(), item.sku.trim(), item.quantity, item.minQuantity, item.price]
                );
            }
        });

        return NextResponse.json({ success: true, count: items.length });
    } catch (error: unknown) {
        console.error('[STOCK_IMPORT] erro', { message: error instanceof Error ? error.message : String(error), code: (error as { code?: string })?.code });
        return NextResponse.json({ error: 'Erro interno na importação' }, { status: 500 });
    }
}
