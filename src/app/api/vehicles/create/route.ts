import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

        const vehicle = await prisma.vehicle.create({
            data: {
                plate,
                model,
                brand,
                year: year ? parseInt(year) : null,
                vin: vin || null,
                clientId: clientId,
            },
        });

        return NextResponse.json({ success: true, vehicle });
    } catch (error: any) {
        console.error('Erro ao criar veículo:', error);

        if (error.code === 'P2002') {
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
