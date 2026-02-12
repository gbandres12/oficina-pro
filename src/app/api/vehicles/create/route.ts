import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { plate, model, brand, year, vin, clientId } = body;

        if (!plate || !model || !brand || !clientId) {
            return NextResponse.json(
                { success: false, error: 'Placa, modelo, marca e cliente são obrigatórios' },
                { status: 400 }
            );
        }

        // Using standard naming based on schema knowledge
        const insertQuery = `
            INSERT INTO "Vehicle" (plate, model, brand, year, vin, "clientId", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING *
        `;

        const values = [
            plate,
            model,
            brand,
            year ? parseInt(year) : null,
            vin || null,
            clientId
        ];

        const vehicle = await db.fetchOne(insertQuery, values);

        return NextResponse.json({ success: true, vehicle });
    } catch (error: any) {
        console.error('Erro ao criar veículo:', error);

        // Check for unique constraint violation (Postgres code 23505)
        if (error.code === '23505') {
            return NextResponse.json(
                { success: false, error: 'Já existe um veículo cadastrado com esta placa ou chassi' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Erro interno ao cadastrar veículo' },
            { status: 500 }
        );
    }
}

