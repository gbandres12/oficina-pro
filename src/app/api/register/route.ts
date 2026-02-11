import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcrypt-ts';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(160),
    password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const parsed = registerSchema.safeParse(payload);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 });
        }

        const { name, email, password } = parsed.data;

        const existingUser = await db.fetchOne('SELECT id FROM "User" WHERE email = $1', [email.toLowerCase()]);

        if (existingUser) {
            return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 });
        }

        const hashedPassword = await hash(password, 12);
        const userId = crypto.randomUUID();

        const result = await db.fetchOne(
            'INSERT INTO "User" (id, name, email, password, role, "updatedAt") VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id, name, email, role',
            [userId, name.trim(), email.toLowerCase(), hashedPassword, 'ADMIN']
        );

        return NextResponse.json(result, { status: 201 });
    } catch (error: unknown) {
        console.error('[REGISTER] erro', { message: error instanceof Error ? error.message : String(error), code: (error as { code?: string })?.code });
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
