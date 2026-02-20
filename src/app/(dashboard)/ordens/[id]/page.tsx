import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { OrderDetailsClient } from '@/components/orders/OrderDetailsClient';
import { db } from '@/lib/db';

// Função para buscar dados da OS diretamente no banco
async function getServiceOrder(id: string) {
    try {
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
            return null;
        }

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

        const subtotalServices = services.reduce((acc: number, service: any) => acc + Number(service.price) * Number(service.quantity), 0);
        const subtotalParts = parts.reduce((acc: number, part: any) => acc + Number(part.price) * Number(part.quantity), 0);

        const discountServices = 0;
        const discountParts = 0;
        const additionalServices = 0;
        const additionalParts = 0;

        const totalGeneral = subtotalServices + subtotalParts;
        const totalFinal = totalGeneral - (discountServices + discountParts) + (additionalServices + additionalParts);

        return {
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
            client: {
                name: serviceOrder.clientName,
                phone: serviceOrder.clientPhone,
                document: serviceOrder.clientDocument || '',
                email: serviceOrder.clientEmail || '',
            },
            vehicle: {
                plate: serviceOrder.vehiclePlate,
                brand: serviceOrder.vehicleBrand,
                model: serviceOrder.vehicleModel,
                year: serviceOrder.vehicleYear || 0,
                vin: serviceOrder.vehicleVin || '',
            },
            services: services.map((service: any) => ({
                id: service.id,
                description: service.description,
                quantity: Number(service.quantity),
                price: Number(service.price),
                discount: 0,
                total: Number(service.price) * Number(service.quantity),
            })),
            parts: parts.map((part: any) => ({
                id: part.id,
                name: part.name,
                sku: part.sku || '',
                quantity: Number(part.quantity),
                price: Number(part.price),
                discount: 0,
                total: Number(part.price) * Number(part.quantity),
            })),
            checklistItems,
            damagePoints,
            timeline,
            internalNotes: serviceOrder.internalNotes || '',
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
    } catch (e) {
        console.error('Erro ao buscar OS no server component:', e);
        return null;
    }
}

export default async function OrderDetailsPage(
    props: {
        params: Promise<{ id: string }>;
    }
) {
    const params = await props.params;
    const { id } = params;

    const session = await auth();
    // Se não tiver sessão, redireciona ou mostra erro. 
    // Assumindo que o middleware já proteja a rota /ordens/*, mas bom garantir.
    // if (!session) redirect('/login'); 

    const order = await getServiceOrder(id);

    if (!order) {
        notFound();
    }

    const userRole = session?.user?.role || 'GUEST';

    return (
        <OrderDetailsClient
            initialOrder={order}
            userRole={userRole}
        />
    );
}
