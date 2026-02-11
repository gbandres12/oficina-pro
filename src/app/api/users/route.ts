import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcrypt-ts';
import { auth } from '@/auth';
import { z } from 'zod';

const userCreateSchema = z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(160),
    password: z.string().min(8).max(128),
    role: z.enum(['ADMIN', 'EMPLOYEE']),
});

export async function POST(request: Request) {
    const session = await auth();

    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const payload = await request.json();
        const parsed = userCreateSchema.safeParse(payload);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 });
        }

        const { name, email, password, role } = parsed.data;

        const existingUser = await db.fetchOne('SELECT id FROM "User" WHERE email = $1', [email.toLowerCase()]);

        if (existingUser) {
            return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 });
        }

        const hashedPassword = await hash(password, 12);
        const user = await db.fetchOne(
            'INSERT INTO "User" (id, name, email, password, role, "updatedAt") VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id, name, email, role',
            [crypto.randomUUID(), name.trim(), email.toLowerCase(), hashedPassword, role]
        );

        return NextResponse.json(user, { status: 201 });
    } catch (error: unknown) {
        console.error('[USERS][POST] erro', { message: error instanceof Error ? error.message : String(error), code: (error as { code?: string })?.code });
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}

export async function GET() {
    const session = await auth();

    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const users = await db.fetchAll('SELECT id, name, email, role, "createdAt" FROM "User" ORDER BY "createdAt" DESC');
        return NextResponse.json(users);
    } catch (error: unknown) {
        console.error('[USERS][GET] erro', { message: error instanceof Error ? error.message : String(error), code: (error as { code?: string })?.code });
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
