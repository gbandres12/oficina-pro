import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        // Verifica se permissão (ADMIN ou MASTER)
        if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MASTER')) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const params = await props.params;
        const { id } = params;
        const body = await request.json();
        const { internalNotes, userId } = body; // userId para logar quem alterou se quiser

        if (internalNotes === undefined) {
            return NextResponse.json(
                { error: 'Campo internalNotes inválido' },
                { status: 400 }
            );
        }

        // Atualizar via SQL direto
        const query = `
            UPDATE "ServiceOrder"
            SET "internalNotes" = $1, "updatedAt" = NOW()
            WHERE "id" = $2
            RETURNING "internalNotes"
        `;

        const result = await db.fetchOne(query, [internalNotes, id]);

        if (!result) {
            return NextResponse.json(
                { error: 'Ordem de serviço não encontrada' },
                { status: 404 }
            );
        }

        // Registrar na timeline que houve alteração nas notas (opcional, mas bom para rastreabilidade)
        // Se quiser registrar, descomente abaixo
        /*
        const timelineId = crypto.randomUUID();
        await db.query(`
            INSERT INTO "ServiceOrderTimeline" ("id", "serviceOrderId", "status", "description", "userId", "createdAt")
            VALUES ($1, $2, $3, $4, $5, NOW())
        `, [timelineId, id, 'INTERNAL_NOTE_UPDATE', 'Notas internas atualizadas', userId]);
        */

        return NextResponse.json({ success: true, data: result.internalNotes });
    } catch (error) {
        console.error('Erro ao atualizar notas internas:', error);
        return NextResponse.json(
            { error: 'Erro ao processar requisição' },
            { status: 500 }
        );
    }
}
