import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // Buscar veículos com informações do cliente e última OS
        const result = await db.query(`
            SELECT 
                v.id,
                v.plate,
                v.vin,
                v.model,
                v.brand,
                v.year,
                v."createdAt",
                c.name as "ownerName",
                c.id as "ownerId",
                (
                    SELECT so.status 
                    FROM "ServiceOrder" so 
                    WHERE so."vehicleId" = v.id 
                    ORDER BY so."createdAt" DESC 
                    LIMIT 1
                ) as "currentStatus",
                (
                    SELECT so.km 
                    FROM "ServiceOrder" so 
                    WHERE so."vehicleId" = v.id 
                    ORDER BY so."createdAt" DESC 
                    LIMIT 1
                ) as "lastKm"
            FROM "Vehicle" v
            JOIN "Client" c ON v."clientId" = c.id
            ORDER BY v."createdAt" DESC
        `);

        return NextResponse.json({
            success: true,
            vehicles: result.rows,
        });

    } catch (error) {
        console.error('Erro ao buscar veículos:', error);

        return NextResponse.json(
            {
                error: 'Erro ao buscar veículos',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}
