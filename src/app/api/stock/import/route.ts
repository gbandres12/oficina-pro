import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Importação FLEXÍVEL de itens de estoque via JSON
 * Aceita campos parciais - pode preencher depois
 */
export async function POST(request: Request) {
    try {
        const { items } = await request.json();

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: 'Lista de itens inválida' }, { status: 400 });
        }

        let imported = 0;
        let updated = 0;
        let errors: string[] = [];

        for (const item of items) {
            try {
                // Normalizar dados
                const normalizedName = item.name?.trim() || null;
                const normalizedSku = item.sku?.trim().toUpperCase() || null;
                const quantity = item.quantity ? parseInt(item.quantity) : 0;
                const minQuantity = item.minQuantity ? parseInt(item.minQuantity) : 0;
                const price = item.price ? Math.round(parseFloat(item.price) * 100) : 0; // Centavos

                // ⚡ VALIDAÇÃO FLEXÍVEL: apenas nome OU SKU obrigatório
                if (!normalizedName && !normalizedSku) {
                    errors.push(`Item ignorado: precisa de nome ou SKU - ${JSON.stringify(item)}`);
                    continue;
                }

                // Nome padrão se não informado
                const finalName = normalizedName || `Produto ${normalizedSku}`;
                const finalSku = normalizedSku || `SKU_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

                // Tentar upsert (insert ou update)
                const id = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

                const result = await db.fetchOne(`
                    INSERT INTO "InventoryItem" 
                    (id, name, sku, stock, "minStock", price, unit, "updatedAt")
                    VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
                    ON CONFLICT (sku) DO UPDATE SET
                        name = COALESCE(EXCLUDED.name, "InventoryItem".name),
                        stock = "InventoryItem".stock + EXCLUDED.stock,
                        "minStock" = COALESCE(EXCLUDED."minStock", "InventoryItem"."minStock"),
                        price = CASE 
                            WHEN EXCLUDED.price > 0 THEN EXCLUDED.price 
                            ELSE "InventoryItem".price 
                        END,
                        "updatedAt" = CURRENT_TIMESTAMP
                    RETURNING id, (xmax = 0) as inserted
                `, [
                    id,
                    finalName,
                    finalSku,
                    quantity,
                    minQuantity,
                    price,
                    item.unit?.trim() || 'Un'
                ]);

                if (result.inserted) {
                    imported++;
                } else {
                    updated++;
                }
            } catch (itemError: any) {
                errors.push(`Erro ao processar item: ${JSON.stringify(item)} - ${itemError.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            imported,
            updated,
            total: imported + updated,
            errors: errors.length > 0 ? errors : undefined,
            message: `✅ Importação concluída: ${imported} novos, ${updated} atualizados`
        });
    } catch (error: any) {
        console.error('Import error:', error);
        return NextResponse.json({
            error: 'Erro na importação',
            details: error.message
        }, { status: 500 });
    }
}

/**
 * GET: Listar itens de estoque (útil para visualização)
 */
export async function GET() {
    try {
        const items = await db.fetchAll(`
            SELECT id, name, sku, stock, "minStock", price, unit, "createdAt", "updatedAt"
            FROM "InventoryItem"
            ORDER BY "createdAt" DESC
            LIMIT 100
        `);

        return NextResponse.json({
            success: true,
            items,
            count: items.length
        });
    } catch (error: any) {
        console.error('List error:', error);
        return NextResponse.json({
            error: 'Erro ao listar estoque',
            details: error.message
        }, { status: 500 });
    }
}
