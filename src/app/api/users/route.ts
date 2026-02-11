import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcrypt-ts';
import { auth } from '@/auth';

export async function POST(request: Request) {
    const session = await auth();

    // Proteção: apenas ADMIN pode criar usuários
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const { name, email, password, role } = await request.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
        }

        const existingUser = await db.fetchOne('SELECT id FROM "User" WHERE email = $1', [email]);

        if (existingUser) {
            return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 });
        }

        const hashedPassword = await hash(password, 10);
        const userId = `user_${Date.now()}`;

        const user = await db.fetchOne(
            'INSERT INTO "User" (id, name, email, password, role, "updatedAt") VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id, name, email, role',
            [userId, name, email, hashedPassword, role]
        );

        return NextResponse.json(user);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
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
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
    }
}
