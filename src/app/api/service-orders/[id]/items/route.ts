import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

/**
 * POST /api/service-orders/[id]/items - Adiciona uma peça ou serviço à OS
 * DELETE /api/service-orders/[id]/items?itemId=...&type=... - Remove um item
 */
export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    let client;
    try {
        const params = await props.params;
        const { id: serviceOrderId } = params;
        const body = await request.json();
        const { type, name, description, quantity, price, sku, inventoryItemId } = body;

        if (!type || (!name && !description) || !price || !quantity) {
            return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
        }

        client = await db.getClient();
        await client.query('BEGIN');

        let newItem;

        if (type === 'SERVICE') {
            const query = `
                INSERT INTO "ServiceItem" (id, description, price, quantity, "serviceOrderId")
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            newItem = await client.query(query, [
                randomUUID(),
                description || name,
                price,
                quantity,
                serviceOrderId
            ]);
        } else if (type === 'PART') {
            const query = `
                INSERT INTO "PartItem" (id, name, sku, price, quantity, "serviceOrderId")
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            newItem = await client.query(query, [
                randomUUID(),
                name,
                sku || null,
                price,
                quantity,
                serviceOrderId
            ]);

            // Se for do estoque, deduzir quantidade
            if (inventoryItemId) {
                await client.query(
                    'UPDATE "InventoryItem" SET quantity = quantity - $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2',
                    [quantity, inventoryItemId]
                );
            }
        }

        await client.query('COMMIT');

        return NextResponse.json({
            success: true,
            data: newItem?.rows[0]
        });

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('Erro ao adicionar item à OS:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    let client;
    try {
        const { searchParams } = new URL(request.url);
        const itemId = searchParams.get('itemId');
        const type = searchParams.get('type'); // 'PART' or 'SERVICE'

        if (!itemId || !type) {
            return NextResponse.json({ error: 'Item ID e tipo são obrigatórios' }, { status: 400 });
        }

        client = await db.getClient();
        await client.query('BEGIN');

        const table = type === 'SERVICE' ? 'ServiceItem' : 'PartItem';

        const deleteQuery = `DELETE FROM "${table}" WHERE id = $1 RETURNING *`;
        const deleted = await client.query(deleteQuery, [itemId]);

        await client.query('COMMIT');

        return NextResponse.json({
            success: true,
            data: deleted?.rows[0]
        });

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('Erro ao remover item da OS:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
