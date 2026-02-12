import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Listar Ordens de Serviço
export async function GET(request: NextRequest) {
    try {
        // Buscar ordens de serviço com informações de cliente e veículo
        const result = await db.query(`
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
    }
}

// POST: Criar Nova Ordem de Serviço (com Cliente e Veículo)
export async function POST(request: NextRequest) {
    let client;

    try {
        const body = await request.json();

        const {
            clientName,
            clientEmail,
            clientPhone,
            clientDocument,
            vehiclePlate,
            vehicleModel,
            vehicleBrand,
            vehicleYear,
            vehicleVin,
            km,
            fuelLevel,
            mechanic,
            clientReport,
            observations,
        } = body;

        // Validações básicas
        if (!clientName || !clientPhone || !vehiclePlate || !vehicleModel || !vehicleBrand || !km || !clientReport) {
            return NextResponse.json(
                { error: 'Campos obrigatórios não preenchidos' },
                { status: 400 }
            );
        }

        // Obtém cliente do pool para transação
        client = await db.getClient();

        // Inicia transação
        await client.query('BEGIN');

        // 1. Verificar se o cliente já existe (por telefone ou documento)
        let clientId;
        const existingClient = await client.query(
            `SELECT id FROM "Client" WHERE phone = $1 OR (document = $2 AND $2 IS NOT NULL)`,
            [clientPhone, clientDocument || null]
        );

        if (existingClient.rows.length > 0) {
            clientId = existingClient.rows[0].id;

            // Atualizar dados do cliente
            await client.query(
                `UPDATE "Client" 
                 SET name = $1, email = $2, document = $3, "updatedAt" = CURRENT_TIMESTAMP
                 WHERE id = $4`,
                [clientName, clientEmail || null, clientDocument || null, clientId]
            );
        } else {
            // Criar novo cliente
            const newClient = await client.query(
                `INSERT INTO "Client" (id, name, email, phone, document, "createdAt", "updatedAt")
                 VALUES (gen_random_uuid(), $1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                 RETURNING id`,
                [clientName, clientEmail || null, clientPhone, clientDocument || null]
            );
            clientId = newClient.rows[0].id;
        }

        // 2. Verificar se o veículo já existe (por placa)
        let vehicleId;
        const existingVehicle = await client.query(
            `SELECT id FROM "Vehicle" WHERE plate = $1`,
            [vehiclePlate.toUpperCase()]
        );

        if (existingVehicle.rows.length > 0) {
            vehicleId = existingVehicle.rows[0].id;

            // Atualizar dados do veículo
            await client.query(
                `UPDATE "Vehicle" 
                 SET model = $1, brand = $2, year = $3, vin = $4, "clientId" = $5, "updatedAt" = CURRENT_TIMESTAMP
                 WHERE id = $6`,
                [vehicleModel, vehicleBrand, vehicleYear ? parseInt(vehicleYear) : null, vehicleVin || null, clientId, vehicleId]
            );
        } else {
            // Criar novo veículo
            const newVehicle = await client.query(
                `INSERT INTO "Vehicle" (id, plate, vin, model, brand, year, "clientId", "createdAt", "updatedAt")
                 VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                 RETURNING id`,
                [vehiclePlate.toUpperCase(), vehicleVin || null, vehicleModel, vehicleBrand, vehicleYear ? parseInt(vehicleYear) : null, clientId]
            );
            vehicleId = newVehicle.rows[0].id;
        }

        // 3. Criar a ordem de serviço
        const newOrder = await client.query(
            `INSERT INTO "ServiceOrder" (
                id, 
                status, 
                "entryDate", 
                km, 
                "fuelLevel", 
                mechanic, 
                observations, 
                "clientReport", 
                "clientId", 
                "vehicleId", 
                "createdAt", 
                "updatedAt"
            )
            VALUES (
                gen_random_uuid(), 
                'OPEN', 
                CURRENT_TIMESTAMP, 
                $1, 
                $2, 
                $3, 
                $4, 
                $5, 
                $6, 
                $7, 
                CURRENT_TIMESTAMP, 
                CURRENT_TIMESTAMP
            )
            RETURNING id, number`,
            [
                parseInt(km),
                fuelLevel ? parseInt(fuelLevel) : null,
                mechanic || null,
                observations || null,
                clientReport,
                clientId,
                vehicleId
            ]
        );

        // Commit da transação
        await client.query('COMMIT');

        return NextResponse.json({
            success: true,
            orderId: newOrder.rows[0].id,
            orderNumber: newOrder.rows[0].number,
            clientId,
            vehicleId,
        }, { status: 201 });

    } catch (error) {
        // Rollback em caso de erro
        if (client) {
            await client.query('ROLLBACK');
        }

        console.error('Erro ao criar ordem de serviço:', error);

        return NextResponse.json(
            {
                error: 'Erro ao criar ordem de serviço',
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
