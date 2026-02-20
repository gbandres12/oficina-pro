import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const result = await db.query(`
            SELECT 
                id,
                "legacyNumber" as number,
                status,
                "entryDate",
                "legacyClientName" as "clientName",
                "legacyVehiclePlate" as "vehiclePlate",
                "legacyTotalValue" as "totalValue",
                "legacyPaidValue" as "paidValue",
                ("legacyTotalValue" - "legacyPaidValue") as "pendingValue",
                observations
            FROM "ServiceOrder"
            WHERE origin = 'LEGACY'
            ORDER BY "entryDate" DESC
        `);

        return NextResponse.json({
            success: true,
            orders: result.rows,
        });

    } catch (error) {
        console.error('Erro ao buscar ordens legadas:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar ordens legadas' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            legacyNumber,
            entryDate,
            clientName,
            vehiclePlate,
            totalValue,
            paidValue,
            status,
            observations
        } = body;

        // Validações básicas
        if (!legacyNumber || !clientName || !vehiclePlate || totalValue === undefined || paidValue === undefined) {
            return NextResponse.json(
                { error: 'Campos obrigatórios não preenchidos' },
                { status: 400 }
            );
        }

        const newOrder = await db.query(
            `INSERT INTO "ServiceOrder" (
                id, 
                "legacyNumber", 
                "entryDate", 
                "legacyClientName", 
                "legacyVehiclePlate", 
                "legacyTotalValue",
                "legacyPaidValue",
                status,
                observations, 
                origin, 
                "migratedAt",
                "createdAt", 
                "updatedAt",
                km
            )
            VALUES (
                gen_random_uuid(), 
                $1, 
                $2, 
                $3, 
                $4, 
                $5, 
                $6, 
                $7, 
                $8, 
                'LEGACY',
                CURRENT_TIMESTAMP, 
                CURRENT_TIMESTAMP, 
                CURRENT_TIMESTAMP,
                0
            )
            RETURNING id`,
            [
                legacyNumber,
                entryDate ? new Date(entryDate) : new Date(),
                clientName,
                vehiclePlate,
                totalValue,
                paidValue,
                status || 'FINISHED',
                observations || null
            ]
        );

        return NextResponse.json({
            success: true,
            orderId: newOrder.rows[0].id,
        }, { status: 201 });

    } catch (error) {
        console.error('Erro ao criar ordem legada:', error);
        return NextResponse.json(
            { error: 'Erro ao criar ordem de serviço legada' },
            { status: 500 }
        );
    }
}
