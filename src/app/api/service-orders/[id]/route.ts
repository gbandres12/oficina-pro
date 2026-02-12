import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;

        // Buscar ordem de serviço completa com cliente e veículo
        // Usamos aspas duplas para garantir que o Postgres respeite o casing gerado pelo Prisma
        const orderQuery = `
            SELECT 
                so.*,
                c.name as "clientName", c.phone as "clientPhone", c.document as "clientDocument", c.email as "clientEmail",
                v.plate as "vehiclePlate", v.brand as "vehicleBrand", v.model as "vehicleModel", v.year as "vehicleYear", v.vin as "vehicleVin"
            FROM "ServiceOrder" so
            LEFT JOIN "Client" c ON so."clientId" = c.id
            LEFT JOIN "Vehicle" v ON so."vehicleId" = v.id
            WHERE so.id = $1
        `;

        const serviceOrder = await db.fetchOne(orderQuery, [id]);

        if (!serviceOrder) {
            return NextResponse.json(
                { error: 'Ordem de serviço não encontrada' },
                { status: 404 }
            );
        }

        // Buscar itens relacionados em paralelo
        const [servicesRes, partsRes, checklistRes, damageRes, timelineRes] = await Promise.all([
            db.fetchAll('SELECT * FROM "ServiceItem" WHERE "serviceOrderId" = $1', [id]),
            db.fetchAll('SELECT * FROM "PartItem" WHERE "serviceOrderId" = $1', [id]),
            db.fetchAll('SELECT * FROM "ChecklistItem" WHERE "serviceOrderId" = $1', [id]),
            db.fetchAll('SELECT * FROM "DamagePoint" WHERE "serviceOrderId" = $1', [id]),
            db.fetchAll('SELECT * FROM "ServiceOrderTimeline" WHERE "serviceOrderId" = $1 ORDER BY "createdAt" DESC', [id])
        ]);

        const services = servicesRes || [];
        const parts = partsRes || [];
        const checklistItems = checklistRes || [];
        const damagePoints = damageRes || [];
        const timeline = timelineRes || [];

        // Calcular totais de serviços
        const subtotalServices = services.reduce(
            (acc: number, service: any) => acc + Number(service.price) * Number(service.quantity),
            0
        );

        // Calcular totais de peças
        const subtotalParts = parts.reduce(
            (acc: number, part: any) => acc + Number(part.price) * Number(part.quantity),
            0
        );

        // Por enquanto, desconto e acréscimo não estão implementados no schema
        const discountServices = 0;
        const discountParts = 0;
        const additionalServices = 0;
        const additionalParts = 0;

        const totalGeneral = subtotalServices + subtotalParts;
        const totalFinal = totalGeneral - (discountServices + discountParts) + (additionalServices + additionalParts);

        // Formatar dados para impressão
        const printData = {
            // Dados da OS
            id: serviceOrder.id,
            number: serviceOrder.number,
            entryDate: serviceOrder.entryDate,
            exitDate: serviceOrder.exitDate,
            status: serviceOrder.status,
            km: serviceOrder.km,
            mechanic: serviceOrder.mechanic || 'Não atribuído',
            observations: serviceOrder.observations || '',
            clientReport: serviceOrder.clientReport || '',
            fuelLevel: serviceOrder.fuelLevel,

            // Cliente
            client: {
                name: serviceOrder.clientName,
                phone: serviceOrder.clientPhone,
                document: serviceOrder.clientDocument || '',
                email: serviceOrder.clientEmail || '',
            },

            // Veículo
            vehicle: {
                plate: serviceOrder.vehiclePlate,
                brand: serviceOrder.vehicleBrand,
                model: serviceOrder.vehicleModel,
                year: serviceOrder.vehicleYear || 0,
                vin: serviceOrder.vehicleVin || '',
            },

            // Serviços
            services: services.map((service: any) => ({
                id: service.id,
                description: service.description,
                quantity: Number(service.quantity),
                price: Number(service.price),
                discount: 0,
                total: Number(service.price) * Number(service.quantity),
            })),

            // Peças
            parts: parts.map((part: any) => ({
                id: part.id,
                name: part.name,
                sku: part.sku || '',
                quantity: Number(part.quantity),
                price: Number(part.price),
                discount: 0,
                total: Number(part.price) * Number(part.quantity),
            })),

            // Checklist
            checklistItems: checklistItems,

            // Pontos de dano
            damagePoints: damagePoints,

            // Timeline e Notas
            timeline: timeline,
            internalNotes: serviceOrder.internalNotes || '',

            // Totais
            totals: {
                subtotalServices,
                subtotalParts,
                discountServices,
                discountParts,
                totalGeneral,
                additionalServices,
                additionalParts,
                totalFinal,
            },
        };

        return NextResponse.json({
            success: true,
            data: printData,
        });
    } catch (error) {
        console.error('Erro ao buscar ordem de serviço:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar ordem de serviço' },
            { status: 500 }
        );
    }
}
