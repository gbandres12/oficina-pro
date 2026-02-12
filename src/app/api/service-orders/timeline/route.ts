import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { serviceOrderId, status, description, userId } = body;

        if (!serviceOrderId || !status) {
            return NextResponse.json(
                { error: 'ID da ordem e status são obrigatórios' },
                { status: 400 }
            );
        }

        const id = randomUUID();
        const createdAt = new Date().toISOString();

        // Query usando raw SQL para inserir na timeline
        const query = `
            INSERT INTO "ServiceOrderTimeline" ("id", "serviceOrderId", "status", "description", "userId", "createdAt")
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [id, serviceOrderId, status, description || null, userId || null, createdAt];
        const newEvent = await db.fetchOne(query, values);

        // Opcional: Atualizar status da OS principal também se necessário
        // Por padrão, manter sincronizado é bom.
        // Vamos atualizar o status da OS se o status da timeline mudar o estado geral
        // Mas a timeline pode ter eventos que não mudam o status da OS (ex: "Nota adicionada").
        // Vamos assumir que o frontend manda o status da OS se quiser atualizar.
        // Por enquanto, só insere na timeline.

        return NextResponse.json({ success: true, data: newEvent });
    } catch (error) {
        console.error('Erro ao adicionar evento na timeline:', error);
        return NextResponse.json(
            { error: 'Erro ao processar requisição' },
            { status: 500 }
        );
    }
}
