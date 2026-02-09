import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 });
        }

        const hashedPassword = await hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role
            }
        });

        const { password: _password, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);
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
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });
        return NextResponse.json(users);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro interno';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
