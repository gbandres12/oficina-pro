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

        // Atualizar status da OS principal para manter sincronia
        await db.query(
            'UPDATE "ServiceOrder" SET "status" = $1, "updatedAt" = $2 WHERE id = $3',
            [status, createdAt, serviceOrderId]
        );

        return NextResponse.json({ success: true, data: newEvent });
    } catch (error) {
        console.error('Erro ao adicionar evento na timeline:', error);
        return NextResponse.json(
            { error: 'Erro ao processar requisição' },
            { status: 500 }
        );
    }
}
