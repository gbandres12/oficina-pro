"use client";

import React from 'react';
import { TimelineEvent } from '@/lib/types/service-order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceOrderRoadmapProps {
    timeline: TimelineEvent[];
    orderId: string;
    currentStatus: string;
    onStatusChange: () => void; // Callback para recarregar dados
}

export function ServiceOrderRoadmap({ timeline, orderId, currentStatus, onStatusChange }: ServiceOrderRoadmapProps) {

    const handleAddEvent = async (status: string, description: string) => {
        try {
            const response = await fetch('/api/service-orders/timeline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceOrderId: orderId,
                    status,
                    description,
                    // userId seria pego do contexto de auth, mas por enquanto opcional
                })
            });

            if (response.ok) {
                toast.success('Status atualizado!');
                onStatusChange();
            } else {
                toast.error('Erro ao atualizar status');
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro de conexão');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'IN_PROGRESS': return <Play className="w-4 h-4 text-blue-500" />;
            case 'WAITING_PARTS': return <Pause className="w-4 h-4 text-orange-500" />;
            case 'FINISHED': return <CheckCircle className="w-4 h-4 text-green-500" />;
            default: return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const formatStatus = (status: string) => {
        const map: Record<string, string> = {
            'OPEN': 'Aberta',
            'IN_PROGRESS': 'Em Execução',
            'WAITING_PARTS': 'Aguardando Peças',
            'FINISHED': 'Finalizada',
            'APPROVED': 'Aprovada',
            'QUOTATION': 'Orçamento'
        };
        return map[status] || status;
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Roadmap do Serviço</span>
                    <div className="flex gap-2">
                        {/* Botões de Ação Rápida para Mecânicos */}
                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                            onClick={() => handleAddEvent('IN_PROGRESS', 'Serviço iniciado pelo mecânico')}
                        >
                            <Play className="w-4 h-4 mr-1" /> Iniciar
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
                            onClick={() => handleAddEvent('WAITING_PARTS', 'Serviço pausado aguardando peças')}
                        >
                            <Pause className="w-4 h-4 mr-1" /> Pausar
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                            onClick={() => handleAddEvent('FINISHED', 'Serviço finalizado pelo mecânico')}
                        >
                            <CheckCircle className="w-4 h-4 mr-1" /> Finalizar
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
                    {timeline.length === 0 && (
                        <div className="ml-6 text-gray-500 text-sm">Nenhum evento registrado.</div>
                    )}

                    {timeline.map((event) => (
                        <div key={event.id} className="ml-6 relative">
                            <span className="absolute -left-[31px] top-0 flex items-center justify-center w-6 h-6 bg-white rounded-full border border-gray-200 ring-4 ring-white">
                                {getStatusIcon(event.status)}
                            </span>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        {formatStatus(event.status)}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                </div>
                                <time className="text-xs text-gray-500 whitespace-nowrap mt-1 sm:mt-0">
                                    {new Date(event.createdAt).toLocaleString('pt-BR')}
                                </time>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
