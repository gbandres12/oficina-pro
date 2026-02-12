"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceOrderDetails } from '@/lib/types/service-order';
import { ServiceOrderRoadmap } from '@/components/orders/ServiceOrderRoadmap';
import { InternalNotes } from '@/components/orders/InternalNotes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Printer } from 'lucide-react';
import { ServiceOrderPrintDialog } from '@/components/orders/ServiceOrderPrintDialog';
import { toast } from 'sonner';

interface OrderDetailsClientProps {
    initialOrder: ServiceOrderDetails;
    userRole: string;
}

export function OrderDetailsClient({ initialOrder, userRole }: OrderDetailsClientProps) {
    const router = useRouter();
    const [order, setOrder] = useState<ServiceOrderDetails>(initialOrder);
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

    const refreshOrder = async () => {
        try {
            const response = await fetch(`/api/service-orders/${order.id}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setOrder(data.data);
                }
            }
        } catch (error) {
            console.error('Erro ao atualizar dados', error);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header com Navegação e Ações */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/ordens')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">OS #{order.number}</h1>
                        <p className="text-sm text-gray-500">
                            {order.client.name} • {order.vehicle.model} ({order.vehicle.plate})
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsPrintDialogOpen(true)}>
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna Principal: Detalhes e Roadmap */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Roadmap (Timeline) */}
                    <ServiceOrderRoadmap
                        timeline={order.timeline}
                        orderId={order.id}
                        currentStatus={order.status}
                        onStatusChange={refreshOrder}
                    />

                    {/* Detalhes Técnicos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalhes Técnicos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-sm text-gray-500">Relato do Cliente</h3>
                                <p className="bg-gray-50 p-3 rounded-md mt-1 text-sm">{order.clientReport || 'Nenhum relato registrado.'}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-gray-500">Diagnóstico/Observações</h3>
                                <p className="bg-gray-50 p-3 rounded-md mt-1 text-sm">{order.observations || 'Nenhuma observação registrada.'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Serviços e Peças (Resumo) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Serviços e Peças</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Serviços ({order.services.length})</h4>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        {order.services.map(s => (
                                            <li key={s.id}>{s.description} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.total)}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="border-t pt-4">
                                    <h4 className="font-medium mb-2">Peças ({order.parts.length})</h4>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        {order.parts.map(p => (
                                            <li key={p.id}>{p.name} ({Number(p.quantity)}) - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.total)}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="border-t pt-4 flex justify-end">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Total Geral</p>
                                        <p className="text-xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totals.totalFinal)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Coluna Lateral: Notas Internas e Infos Adicionais */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Notas Internas (Restrito) */}
                    <InternalNotes
                        orderId={order.id}
                        initialNotes={order.internalNotes}
                        userRole={userRole}
                    />

                    {/* Info Cliente */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p><span className="font-medium">Nome:</span> {order.client.name}</p>
                            <p><span className="font-medium">Tel:</span> {order.client.phone}</p>
                            <p><span className="font-medium">Email:</span> {order.client.email || '-'}</p>
                        </CardContent>
                    </Card>

                    {/* Info Veículo */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Veículo</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p><span className="font-medium">Modelo:</span> {order.vehicle.model}</p>
                            <p><span className="font-medium">Placa:</span> {order.vehicle.plate}</p>
                            <p><span className="font-medium">Marca:</span> {order.vehicle.brand}</p>
                            <p><span className="font-medium">KM:</span> {order.km.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Dialog de Impressão */}
            <ServiceOrderPrintDialog
                orderId={order.id}
                open={isPrintDialogOpen}
                onOpenChange={setIsPrintDialogOpen}
            />
        </div>
    );
}
