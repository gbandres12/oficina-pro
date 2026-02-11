import { NextRequest, NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import { z } from 'zod';
import { db } from '@/lib/db';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const partSchema = z.object({
    name: z.string().min(1),
    sku: z.string().min(1),
    quantity: z.number().positive(),
    price: z.number().nonnegative(),
    ncm: z.string().optional(),
});

type ParsedPart = z.infer<typeof partSchema>;

type NfeProductNode = {
    prod?: {
        xProd?: string;
        cProd?: string;
        qCom?: string | number;
        vUnCom?: string | number;
        NCM?: string;
    };
};

function toProductNode(input: unknown): NfeProductNode {
    if (typeof input === 'object' && input !== null) {
        return input as NfeProductNode;
    }

    return {};
}

function normalizeItems(rawItems: unknown): ParsedPart[] {
    const asArray = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

    return asArray
        .map((item) => {
            const node = toProductNode(item);
            return {
                name: String(node.prod?.xProd ?? '').trim(),
                sku: String(node.prod?.cProd ?? '').trim(),
                quantity: Number(node.prod?.qCom ?? 0),
                price: Number(node.prod?.vUnCom ?? 0),
                ncm: node.prod?.NCM ? String(node.prod.NCM) : undefined,
            };
        })
        .map((item) => partSchema.safeParse(item))
        .filter((result): result is { success: true; data: ParsedPart } => result.success)
        .map((result) => result.data);
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!(file instanceof File)) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json({ error: 'Arquivo maior que 5MB' }, { status: 413 });
        }

        if (!file.name.toLowerCase().endsWith('.xml')) {
            return NextResponse.json({ error: 'Formato inválido. Envie um XML de NF-e' }, { status: 400 });
        }

        const xmlData = await file.text();
        const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });
        const jsonObj = parser.parse(xmlData) as Record<string, unknown>;

        const nfeProc = (jsonObj.nfeProc as Record<string, unknown> | undefined) ?? {};
        const nfe = (jsonObj.NFe as Record<string, unknown> | undefined) ?? (nfeProc.NFe as Record<string, unknown> | undefined) ?? {};
        const infNFe = (nfe.infNFe as Record<string, unknown> | undefined) ?? {};
        const rawItems = infNFe.det ?? [];

        const extractedParts = normalizeItems(rawItems);

        if (extractedParts.length === 0) {
            return NextResponse.json({ error: 'Nenhuma peça válida encontrada no XML' }, { status: 400 });
        }

        await db.withTransaction(async (client) => {
            for (const part of extractedParts) {
                await client.query(
                    `INSERT INTO "InventoryItem" (id, name, sku, quantity, "minQuantity", "unitPrice", "updatedAt")
                     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
                     ON CONFLICT (sku) DO UPDATE SET
                        name = EXCLUDED.name,
                        quantity = "InventoryItem".quantity + EXCLUDED.quantity,
                        "unitPrice" = EXCLUDED."unitPrice",
                        "updatedAt" = CURRENT_TIMESTAMP`,
                    [crypto.randomUUID(), part.name, part.sku, part.quantity, 5, part.price]
                );
            }
        });

        return NextResponse.json({
            success: true,
            message: `${extractedParts.length} peças importadas no estoque.`,
            data: extractedParts,
        });
    } catch (error: unknown) {
        console.error('[PARTS_IMPORT] erro', { message: error instanceof Error ? error.message : String(error), code: (error as { code?: string })?.code });
        return NextResponse.json({ success: false, error: 'Falha ao processar XML' }, { status: 500 });
    }
}
