"use client";

import React, { useEffect, useState } from 'react';
import {
    ClipboardList,
    Search,
    Plus,
    Clock,
    CheckCircle2,
    AlertCircle,
    Wrench,
    User,
    Car,
    Calendar,
    MoreVertical,
    Kanban,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CreateOrderDialog } from '@/components/orders/CreateOrderDialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface ServiceOrder {
    id: string;
    number: number;
    status: string;
    entryDate: string;
    km: number;
    mechanic: string | null;
    clientName: string;
    clientPhone: string;
    vehiclePlate: string;
    vehicleModel: string;
    vehicleBrand: string;
}

export default function OrdensPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState<'list' | 'kanban'>('list');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/service-orders/list');
            const data = await response.json();

            if (data.success) {
                setOrders(data.orders);
            } else {
                toast.error('Erro ao carregar ordens de serviço');
            }
        } catch (error) {
            toast.error('Erro ao conectar com o servidor');
            console.error('Erro ao buscar ordens:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order =>
        order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.number.toString().includes(searchTerm)
    );

    const statusCounts = {
        open: orders.filter(o => o.status === 'OPEN').length,
        inProgress: orders.filter(o => o.status === 'IN_PROGRESS').length,
        waitingParts: orders.filter(o => o.status === 'WAITING_PARTS').length,
        completed: orders.filter(o => o.status === 'COMPLETED').length,
    };

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
            'OPEN': { label: 'Aberta', variant: 'outline', className: 'border-blue-200 bg-blue-50 text-blue-700' },
            'IN_PROGRESS': { label: 'Em Execução', variant: 'default', className: 'bg-yellow-500' },
            'WAITING_PARTS': { label: 'Aguardando Peças', variant: 'secondary', className: 'bg-orange-500 text-white' },
            'COMPLETED': { label: 'Finalizada', variant: 'outline', className: 'border-green-200 bg-green-50 text-green-700' },
            'APPROVED': { label: 'Aprovada', variant: 'default', className: 'bg-green-600' },
            'QUOTATION': { label: 'Orçamento', variant: 'outline', className: 'border-purple-200 bg-purple-50 text-purple-700' },
        };
        return configs[status] || { label: status, variant: 'outline' as const, className: '' };
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <ClipboardList className="w-6 h-6" />
                        </div>
                        Ordens de Serviço
                    </h1>
                    <p className="text-muted-foreground">Gerencie todas as ordens de serviço da oficina</p>
                </div>
                <div className="flex gap-3">
                    <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'kanban')} className="w-auto">
                        <TabsList className="h-11 rounded-xl">
                            <TabsTrigger value="list" className="rounded-lg gap-2">
                                <ClipboardList className="w-4 h-4" /> Lista
                            </TabsTrigger>
                            <TabsTrigger value="kanban" className="rounded-lg gap-2">
                                <Kanban className="w-4 h-4" /> Kanban
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button className="gap-2 rounded-xl bg-primary shadow-lg shadow-primary/20" onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="w-4 h-4" /> Abrir Nova O.S.
                    </Button>
                </div>
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-4 gap-4">
                <Card className="border-none shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                                <ClipboardList className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{statusCounts.open}</div>
                                <div className="text-sm text-muted-foreground">Abertas</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-yellow-50 text-yellow-600">
                                <Wrench className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{statusCounts.inProgress}</div>
                                <div className="text-sm text-muted-foreground">Em Execução</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{statusCounts.waitingParts}</div>
                                <div className="text-sm text-muted-foreground">Aguardando Peças</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-green-50 text-green-600">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{statusCounts.completed}</div>
                                <div className="text-sm text-muted-foreground">Finalizadas</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
            <Card className="border-none shadow-md">
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Buscar por cliente, veículo ou número da O.S..."
                                className="pl-10 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Orders List/Kanban */}
            {view === 'list' ? (
                <div className="space-y-3">
                    {loading ? (
                        <Card className="border-none shadow-md">
                            <CardContent className="p-12">
                                <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    <p>Carregando ordens de serviço...</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : filteredOrders.length === 0 ? (
                        <Card className="border-none shadow-md">
                            <CardContent className="p-12">
                                <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                    <ClipboardList className="w-12 h-12" />
                                    <div className="text-center">
                                        <p className="font-semibold text-lg">Nenhuma ordem de serviço encontrada</p>
                                        <p className="text-sm">Crie sua primeira ordem de serviço clicando no botão acima</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredOrders.map((order) => {
                            const statusConfig = getStatusConfig(order.status);
                            return (
                                <Card key={order.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6 flex-1">
                                                <div className="text-center">
                                                    <div className="text-xs text-muted-foreground mb-1">O.S.</div>
                                                    <div className="font-bold text-lg">{order.number}</div>
                                                </div>
                                                <div className="h-12 w-px bg-border" />
                                                <div className="flex-1 grid grid-cols-4 gap-6">
                                                    <div>
                                                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                            <User className="w-3 h-3" /> Cliente
                                                        </div>
                                                        <div className="font-medium">{order.clientName}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                            <Car className="w-3 h-3" /> Veículo
                                                        </div>
                                                        <div className="font-medium">{order.vehicleBrand} {order.vehicleModel}</div>
                                                        <div className="text-xs text-muted-foreground">{order.vehiclePlate}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                            <Wrench className="w-3 h-3" /> Técnico
                                                        </div>
                                                        <div className="font-medium">{order.mechanic || '-'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" /> Data
                                                        </div>
                                                        <div className="font-medium">{formatDate(order.entryDate)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant={statusConfig.variant} className={statusConfig.className}>
                                                    {statusConfig.label}
                                                </Badge>
                                                <Button variant="ghost" size="icon" className="rounded-xl">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            ) : (
                /* Kanban View */
                <Card className="border-none shadow-md">
                    <CardContent className="p-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground py-12">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <p>Carregando ordens de serviço...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <div className="flex gap-4 min-w-max pb-4">
                                    {[
                                        { id: 'OPEN', title: 'Abertas', statuses: ['OPEN'], color: 'bg-slate-100' },
                                        { id: 'QUOTATION', title: 'Orçamento', statuses: ['QUOTATION'], color: 'bg-purple-100' },
                                        { id: 'APPROVED', title: 'Aprovadas', statuses: ['APPROVED'], color: 'bg-green-100' },
                                        { id: 'IN_PROGRESS', title: 'Em Execução', statuses: ['IN_PROGRESS'], color: 'bg-blue-100' },
                                        { id: 'WAITING_PARTS', title: 'Aguardando Peças', statuses: ['WAITING_PARTS'], color: 'bg-amber-100' },
                                        { id: 'FINISHED', title: 'Finalizadas', statuses: ['FINISHED'], color: 'bg-emerald-100' },
                                    ].map((column) => {
                                        const columnOrders = filteredOrders.filter(o => column.statuses.includes(o.status));
                                        return (
                                            <div key={column.id} className="flex-shrink-0 w-[320px]">
                                                <div className={`${column.color} dark:bg-slate-800 rounded-xl p-4`}>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="font-bold text-sm uppercase tracking-wide">{column.title}</h3>
                                                        <Badge variant="secondary" className="rounded-full">
                                                            {columnOrders.length}
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                                        {columnOrders.map((order) => {
                                                            const statusConfig = getStatusConfig(order.status);
                                                            return (
                                                                <Card key={order.id} className="hover:shadow-md transition-shadow cursor-move bg-white dark:bg-slate-900">
                                                                    <CardContent className="p-4">
                                                                        <div className="flex items-center gap-2 mb-3">
                                                                            <Badge className="text-[9px] font-bold">#{order.number}</Badge>
                                                                            <Badge variant={statusConfig.variant} className={`${statusConfig.className} text-[9px]`}>
                                                                                {statusConfig.label}
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <div>
                                                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                                                    <User className="w-3 h-3" /> Cliente
                                                                                </div>
                                                                                <div className="font-semibold text-sm">{order.clientName}</div>
                                                                                <div className="text-xs text-muted-foreground">{order.clientPhone}</div>
                                                                            </div>
                                                                            <div>
                                                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                                                    <Car className="w-3 h-3" /> Veículo
                                                                                </div>
                                                                                <div className="font-semibold text-sm">{order.vehicleBrand} {order.vehicleModel}</div>
                                                                                <div className="text-xs text-muted-foreground">{order.vehiclePlate}</div>
                                                                            </div>
                                                                            <div>
                                                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                                                    <Wrench className="w-3 h-3" /> Técnico
                                                                                </div>
                                                                                <div className="font-medium text-sm">{order.mechanic || 'Não atribuído'}</div>
                                                                            </div>
                                                                            <div className="pt-2 border-t">
                                                                                <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                                                                    <Calendar className="w-3 h-3" /> {formatDate(order.entryDate)}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            );
                                                        })}
                                                        {columnOrders.length === 0 && (
                                                            <div className="text-center text-muted-foreground text-sm py-8">
                                                                Nenhuma ordem
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <CreateOrderDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={() => {
                    fetchOrders(); // Recarrega a lista após criar
                    toast.success('Ordem de serviço criada com sucesso!');
                }}
            />
        </div>
    );
}
