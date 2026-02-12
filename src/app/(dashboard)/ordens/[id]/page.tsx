import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { OrderDetailsClient } from '@/components/orders/OrderDetailsClient';
import { headers } from 'next/headers';

// Função para buscar dados da OS (reutilizando a lógica da API se possível, ou chamando a API)
// Como estamos no server, podemos chamar a URL da API, mas requer URL absoluta.
// Ou melhor, importar a função de busca se ela estivesse separada.
// Para simplificar e evitar problemas de URL, vou fazer fetch na URL relativa se o Next permitir (em server components às vezes requer absoluta), 
// ou duplicar a lógica de fetch aqui (o que é feio mas funciona).
// O ideal é extrair a lógica d busca para uma função 'getServiceOrder(id)' em src/lib/data/service-orders.ts

async function getServiceOrder(id: string) {
    const host = (await headers()).get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

    try {
        const res = await fetch(`${protocol}://${host}/api/service-orders/${id}`, {
            cache: 'no-store'
        });

        if (!res.ok) return null;

        const json = await res.json();
        return json.success ? json.data : null;
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
