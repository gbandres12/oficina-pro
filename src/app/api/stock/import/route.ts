import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { items } = await request.json();

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: 'Lista de itens inválida' }, { status: 400 });
        }

        const createdItems = await Promise.all(
            items.map(async (item: any) => {
                return prisma.inventoryItem.upsert({
                    where: { sku: item.sku },
                    update: {
                        quantity: { increment: item.quantity || 0 },
                        unitPrice: item.price || undefined,
                    },
                    create: {
                        name: item.name,
                        sku: item.sku,
                        quantity: item.quantity || 0,
                        minQuantity: item.minQuantity || 5,
                        unitPrice: item.price || 0,
                    }
                });
            })
        );

        return NextResponse.json({ success: true, count: createdItems.length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
