import { NextRequest, NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

/**
 * Endpoint para processamento de XML de Nota Fiscal (NF-e)
 * Simula a extração de peças e alimentação automática do estoque.
 */
export async function POST(req: NextRequest) {
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
        // nfeProc -> NFe -> infNFe -> det (detalhes dos itens)
        const items = jsonObj.nfeProc?.NFe?.infNFe?.det || [];
        const normalizedItems = Array.isArray(items) ? items : [items];

        const extractedParts = normalizedItems.map((item: any) => ({
            name: item.prod?.xProd,
            sku: item.prod?.cProd,
            quantity: parseFloat(item.prod?.qCom),
            price: parseFloat(item.prod?.vUnCom),
            ncm: item.prod?.NCM
        }));

        // Aqui você faria a integração com o banco de dados (Prisma)
        // Exemplo: 
        // for (const part of extractedParts) {
        //   await prisma.inventoryItem.upsert({ ... })
        // }

        return NextResponse.json({
            success: true,
            message: `${extractedParts.length} peças identificadas e processadas.`,
            data: extractedParts
        });

    } catch (error) {
        console.error('Erro no processamento do XML:', error);
        return NextResponse.json({ success: false, error: 'Falha ao processar XML' }, { status: 500 });
    }
}
