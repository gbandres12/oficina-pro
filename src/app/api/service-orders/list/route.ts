import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
    let client;

    try {
        client = await pool.connect();

        // Buscar ordens de serviço com informações de cliente e veículo
        const result = await client.query(`
            SELECT 
                so.id,
                so.number,
                so.status,
                so."entryDate",
                so."exitDate",
                so.km,
                so.mechanic,
                so."clientReport",
                so.observations,
                c.name as "clientName",
                c.phone as "clientPhone",
                v.plate as "vehiclePlate",
                v.model as "vehicleModel",
                v.brand as "vehicleBrand"
            FROM "ServiceOrder" so
            JOIN "Client" c ON so."clientId" = c.id
            JOIN "Vehicle" v ON so."vehicleId" = v.id
            ORDER BY so."entryDate" DESC
            LIMIT 100
        `);

        return NextResponse.json({
            success: true,
            orders: result.rows,
        });

    } catch (error) {
        console.error('Erro ao buscar ordens de serviço:', error);

        return NextResponse.json(
            {
                error: 'Erro ao buscar ordens de serviço',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    } finally {
        if (client) {
            client.release();
        }
    }
}
