import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
    let client;

    try {
        client = await pool.connect();

        // Buscar ordens de serviço ativas com detalhes completos
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
                c.name as "clientName",
                c.phone as "clientPhone",
                v.plate as "vehiclePlate",
                v.model as "vehicleModel",
                v.brand as "vehicleBrand",
                CASE 
                    WHEN so.status = 'FINISHED' THEN 100
                    WHEN so.status = 'IN_PROGRESS' THEN 50
                    WHEN so.status = 'APPROVED' THEN 25
                    WHEN so.status = 'WAITING_PARTS' THEN 15
                    ELSE 5
                END as progress,
                -- Status de peças (simpl ificado por enquanto)
                CASE 
                    WHEN so.status = 'WAITING_PARTS' THEN 'MISSING'
                    WHEN so.status = 'IN_PROGRESS' THEN 'OK'
                    WHEN so.status = 'FINISHED' THEN 'OK'
                    ELSE 'ANALYZING'
                END as "partsStatus"
            FROM "ServiceOrder" so
            JOIN "Client" c ON so."clientId" = c.id
            JOIN "Vehicle" v ON so."vehicleId" = v.id
            WHERE so.status IN ('OPEN', 'QUOTATION', 'APPROVED', 'IN_PROGRESS', 'WAITING_PARTS')
            ORDER BY so."entryDate" DESC
            LIMIT 50
        `);

        // Calcular estatísticas
        const stats = await client.query(`
            SELECT 
                COUNT(*) FILTER (WHERE status IN ('OPEN', 'QUOTATION', 'APPROVED', 'IN_PROGRESS', 'WAITING_PARTS')) as total_patio,
                COUNT(*) FILTER (WHERE status = 'WAITING_PARTS') as waiting_parts,
                COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress,
                COALESCE(AVG(
                    CASE 
                        WHEN "exitDate" IS NOT NULL 
                        THEN EXTRACT(EPOCH FROM ("exitDate" - "entryDate"))/86400 
                        ELSE NULL 
                    END
                ), 2.4) as avg_days
            FROM "ServiceOrder"
            WHERE "createdAt" >= CURRENT_DATE - INTERVAL '30 days'
        `);

        return NextResponse.json({
            success: true,
            vehicles: result.rows,
            stats: {
                totalPatio: parseInt(stats.rows[0].total_patio) || 0,
                waitingParts: parseInt(stats.rows[0].waiting_parts) || 0,
                inProgress: parseInt(stats.rows[0].in_progress) || 0,
                avgDays: parseFloat(stats.rows[0].avg_days).toFixed(1)
            }
        });

    } catch (error) {
        console.error('Erro ao buscar dados do pátio:', error);

        return NextResponse.json(
            {
                error: 'Erro ao buscar dados do pátio',
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
