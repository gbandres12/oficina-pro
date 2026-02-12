import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcrypt-ts';
import { auth } from '@/auth';
import { createUserSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function POST(request: Request) {
    const session = await auth();

    // Proteção: apenas ADMIN pode criar usuários
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json(
            { error: 'Não autorizado. Apenas administradores podem criar usuários.' },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();

        // Validação com Zod (automaticamente normaliza os dados)
        const validatedData = createUserSchema.parse(body);
        const { name, email, password, role } = validatedData;

        // Verificar duplicidade de email (case-insensitive)
        // O email já está normalizado (lowercase) pelo Zod
        const existingUser = await db.fetchOne(
            'SELECT id FROM "User" WHERE LOWER(email) = LOWER($1)',
            [email]
        );

        if (existingUser) {
            return NextResponse.json(
                {
                    error: 'E-mail já cadastrado',
                    details: 'Já existe um usuário com este e-mail no sistema.'
                },
                { status: 409 } // 409 Conflict
            );
        }

        // Hash da senha
        const hashedPassword = await hash(password, 10);

        // Gerar ID único
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Inserir usuário no banco
        const user = await db.fetchOne(
            `INSERT INTO "User" (id, name, email, password, role, "updatedAt") 
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) 
             RETURNING id, name, email, role, "createdAt"`,
            [userId, name, email, hashedPassword, role]
        );

        console.log(`✅ Novo usuário criado: ${email} (${role})`);

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        }, { status: 201 });

    } catch (error: any) {
        // Tratamento específico de erros de validação Zod
        if (error instanceof ZodError) {
            const firstError = error.errors[0];
            return NextResponse.json(
                {
                    error: 'Dados inválidos',
                    details: firstError.message,
                    field: firstError.path.join('.'),
                    errors: error.errors // Todos os erros para debug
                },
                { status: 400 }
            );
        }

        // Erro de duplicata (caso o check falhe por race condition)
        if (error.message?.includes('duplicate') || error.code === '23505') {
            return NextResponse.json(
                { error: 'E-mail já cadastrado', details: 'Este e-mail já está em uso.' },
                { status: 409 }
            );
        }

        // Erro genérico
        console.error('❌ Erro ao criar usuário:', error);
        return NextResponse.json(
            {
                error: 'Erro interno do servidor',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
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
