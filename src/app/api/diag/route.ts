import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
    const session = await auth();

    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const result = await db.query<{ now: string }>('SELECT NOW()::text as now');
        return NextResponse.json({
            status: 'ok',
            dbTime: result.rows[0]?.now ?? null,
            environment: process.env.NODE_ENV,
        });
    } catch (error: unknown) {
        console.error('[DIAG] erro', { message: error instanceof Error ? error.message : String(error), code: (error as { code?: string })?.code });
        return NextResponse.json({ status: 'error', error: 'Falha de conexão com o banco' }, { status: 500 });
    }
}
