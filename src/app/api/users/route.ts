import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcrypt-ts';
import { auth } from '@/auth';
import { z } from 'zod';


const createUserSchema = z.object({
    name: z.string().min(2).max(120),
    email: z.email(),
    password: z.string().min(8).max(128),
    role: z.enum(['ADMIN', 'EMPLOYEE']),
});

export async function POST(request: Request) {
    const session = await auth();

    // Proteção: apenas ADMIN pode criar usuários
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const payload = await request.json();
        const parsed = createUserSchema.safeParse(payload);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Dados inválidos para criação de usuário' }, { status: 400 });
        }

        const { name, email, password, role } = parsed.data;
        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await db.fetchOne('SELECT id FROM "User" WHERE email = $1', [normalizedEmail]);

        if (existingUser) {
            return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 });
        }

        const hashedPassword = await hash(password, 12);
        const userId = `user_${Date.now()}`;

        const user = await db.fetchOne(
            'INSERT INTO "User" (id, name, email, password, role, "updatedAt") VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id, name, email, role',
            [userId, name.trim(), normalizedEmail, hashedPassword, role]
        );

        return NextResponse.json(user);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro interno';
        return NextResponse.json({ error: message }, { status: 500 });
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
        const message = error instanceof Error ? error.message : 'Erro interno';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
