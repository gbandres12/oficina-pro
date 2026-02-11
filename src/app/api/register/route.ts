import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcrypt-ts';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2).max(120),
    email: z.email(),
    password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const parsed = registerSchema.safeParse(payload);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Dados de cadastro inválidos' }, { status: 400 });
        }

        const { name, email, password } = parsed.data;
        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await db.fetchOne('SELECT id FROM "User" WHERE email = $1', [normalizedEmail]);

        if (existingUser) {
            return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 });
        }

        const hashedPassword = await hash(password, 12);
        const userId = `user_${Date.now()}`;

        const result = await db.fetchOne(
            'INSERT INTO "User" (id, name, email, password, role, "updatedAt") VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id, name, email, role',
            [userId, name.trim(), normalizedEmail, hashedPassword, 'EMPLOYEE']
        );

        return NextResponse.json(result, { status: 201 });
    } catch (error: unknown) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
