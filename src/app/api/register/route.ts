import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcrypt-ts';

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
        }

        const existingUser = await db.fetchOne('SELECT id FROM "User" WHERE email = $1', [email]);

        if (existingUser) {
            return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 });
        }

        const hashedPassword = await hash(password, 10);
        const userId = `user_${Date.now()}`;

        const result = await db.fetchOne(
            'INSERT INTO "User" (id, name, email, password, role, "updatedAt") VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id, name, email, role',
            [userId, name, email, hashedPassword, 'ADMIN']
        );

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Register error:', error);
        return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
    }
}
