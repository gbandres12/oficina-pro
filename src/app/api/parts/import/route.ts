import { NextRequest, NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import { db } from '@/lib/db';

/**
 * Endpoint para processamento de XML de Nota Fiscal (NF-e)
 * Extração FLEXÍVEL de peças - aceita dados parciais
 */
export async function POST(req: NextRequest) {
    let client;

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
        }

        const xmlData = await file.text();
        const parser = new XMLParser();
        const jsonObj = parser.parse(xmlData);

        // Estrutura típica de uma NF-e (Simplificada)
        const items = jsonObj.nfeProc?.NFe?.infNFe?.det || [];
        const normalizedItems = Array.isArray(items) ? items : [items];

        client = await db.getClient();
        await client.query('BEGIN');

        let imported = 0;
        let updated = 0;
        let errors: string[] = [];

        for (const item of normalizedItems) {
            try {
                // Extrair dados do XML
                const rawName = item.prod?.xProd;
                const rawSku = item.prod?.cProd;
                const rawQuantity = item.prod?.qCom;
                const rawPrice = item.prod?.vUnCom;
                const rawNcm = item.prod?.NCM;

                // Normalizar campos
                const normalizedName = rawName?.trim() || null;
                const normalizedSku = rawSku?.trim().toUpperCase() || null;
                const quantity = rawQuantity ? parseFloat(rawQuantity) : 0;
                const price = rawPrice ? parseFloat(rawPrice) : 0;
                const ncm = rawNcm?.trim() || null;

                // ⚡ VALIDAÇÃO FLEXÍVEL: apenas nome OU SKU é obrigatório
                if (!normalizedName && !normalizedSku) {
                    errors.push(`Item ignorado: precisa de nome ou SKU - ${JSON.stringify(item.prod)}`);
                    continue;
                }

                // Nome padrão se não informado
                const finalName = normalizedName || `Produto ${normalizedSku}`;

                // Verificar se peça já existe (por SKU ou nome)
                let existingCheck;
                if (normalizedSku) {
                    existingCheck = await client.query(`
                        SELECT id, quantity FROM "InventoryItem" 
                        WHERE sku = $1
                        LIMIT 1
                    `, [normalizedSku]);
                } else {
                    existingCheck = await client.query(`
                        SELECT id, quantity FROM "InventoryItem" 
                        WHERE LOWER(name) = LOWER($1)
                        LIMIT 1
                    `, [finalName]);
                }

                if (existingCheck && existingCheck.rows.length > 0) {
                    // ✅ Atualizar peça existente
                    const existingStock = Number(existingCheck.rows[0].quantity) || 0;
                    const newStock = existingStock + quantity;

                    await client.query(`
                        UPDATE "InventoryItem" 
                        SET 
                            name = COALESCE($1, name),
                            sku = COALESCE($2, sku),
                            quantity = $3,
                            "unitPrice" = COALESCE($4, "unitPrice"),
                            "updatedAt" = CURRENT_TIMESTAMP
                        WHERE id = $5
                    `, [
                        normalizedName,
                        normalizedSku,
                        newStock, // Soma o estoque
                        price > 0 ? price : undefined,
                        existingCheck.rows[0].id
                    ]);
                    updated++;
                } else {
                    // ✅ Inserir nova peça (aceita campos vazios)
                    await client.query(`
                        INSERT INTO "InventoryItem" 
                        (name, sku, quantity, "unitPrice", "minQuantity")
                        VALUES ($1, $2, $3, $4, $5)
                    `, [
                        finalName,
                        normalizedSku,
                        quantity,
                        price,
                        0 // minQuantity padrão
                    ]);
                    imported++;
                }
            } catch (error) {
                errors.push(`Erro ao processar item: ${JSON.stringify(item.prod)} - ${error}`);
            }
        }

        await client.query('COMMIT');

        return NextResponse.json({
            success: true,
            imported,
            updated,
            total: imported + updated,
            errors: errors.length > 0 ? errors : undefined,
            message: `✅ XML processado: ${imported} novos itens, ${updated} atualizados`
        });

    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
        }

        console.error('Erro no processamento do XML:', error);
        return NextResponse.json({
            success: false,
            error: 'Falha ao processar XML',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 });
    } finally {
        if (client) {
            client.release();
        }
    }
}
