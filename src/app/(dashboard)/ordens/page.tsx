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
    Printer,
    Eye,
    FileUp,
    Filter,
    History,
    Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CreateOrderDialog } from '@/components/orders/CreateOrderDialog';
import { ServiceOrderPrintDialog } from '@/components/orders/ServiceOrderPrintDialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { OrderStatsCard } from '@/components/orders/OrderStatsCard';
import { LegacyOrderList } from '@/components/orders/LegacyOrderList';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

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
    const router = useRouter();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
    const [isPrintDialogOpen, setIsPrintDialogOpen] = React.useState(false);
    const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null);
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState<'list' | 'kanban'>('list');
    const [activeTab, setActiveTab] = useState<'current' | 'legacy'>('current');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/service-orders');
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
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-950/20">
                            <ClipboardList className="w-8 h-8" />
                        </div>
                        Ordens de Serviço
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">Controle total da operação e fluxo da oficina</p>
                </div>
                <div className="flex flex-col gap-4 items-end">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'current' | 'legacy')} className="w-auto self-start lg:self-end mb-2">
                        <TabsList className="h-12 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl">
                            <TabsTrigger value="current" className="rounded-lg gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-none">
                                <ClipboardList className="w-4 h-4" /> Atuais
                            </TabsTrigger>
                            <TabsTrigger value="legacy" className="rounded-lg gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-none">
                                <History className="w-4 h-4" /> Histórico (Legado)
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {activeTab === 'current' && (
                        <div className="flex flex-wrap items-center gap-3">
                            <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'kanban')} className="w-auto">
                                <TabsList className="h-12 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl">
                                    <TabsTrigger value="list" className="rounded-lg gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-none">
                                        <ClipboardList className="w-4 h-4" /> Lista
                                    </TabsTrigger>
                                    <TabsTrigger value="kanban" className="rounded-lg gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-none">
                                        <Kanban className="w-4 h-4" /> Kanban
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    className="h-12 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-6 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 gap-2 transition-all"
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = '.csv';
                                        input.onchange = async (e) => {
                                            const file = (e.target as HTMLInputElement).files?.[0];
                                            if (file) {
                                                toast.loading("Importando arquivo...");
                                                // TODO: Chamar API de importação
                                                toast.dismiss();
                                                toast.success("Arquivo selecionado para importação");
                                            }
                                        };
                                        input.click();
                                    }}
                                >
                                    <FileUp className="w-4 h-4" /> Importar CSV
                                </Button>
                                <Button
                                    className="h-12 rounded-xl px-8 font-black bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 gap-2 transition-all active:scale-95 border-b-4 border-slate-950"
                                    onClick={() => setIsCreateDialogOpen(true)}
                                >
                                    <Plus className="w-5 h-5" /> Nova O.S.
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {activeTab === 'current' ? (
                <>
                    {/* Stats Summary Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <OrderStatsCard
                            title="Em Aberto"
                            value={statusCounts.open}
                            icon={ClipboardList}
                            iconColor="text-blue-500"
                            iconBg="bg-blue-500/10"
                        />
                        <OrderStatsCard
                            title="Em Execução"
                            value={statusCounts.inProgress}
                            icon={Wrench}
                            iconColor="text-yellow-500"
                            iconBg="bg-yellow-500/10"
                        />
                        <OrderStatsCard
                            title="Aguardando"
                            value={statusCounts.waitingParts}
                            icon={Clock}
                            iconColor="text-orange-500"
                            iconBg="bg-orange-500/10"
                        />
                        <OrderStatsCard
                            title="Finalizadas"
                            value={statusCounts.completed}
                            icon={CheckCircle2}
                            iconColor="text-emerald-500"
                            iconBg="bg-emerald-500/10"
                        />
                    </div>

                    {/* Search and Filters Section */}
                    <Card className="shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1 group">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
                                    <Input
                                        placeholder="Buscar por cliente, placa (ABC1234), modelo ou número da O.S..."
                                        className="pl-12 h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 focus:ring-2 focus:ring-slate-400 font-medium"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" className="h-14 px-6 rounded-xl border-slate-200 dark:border-slate-800 gap-2 font-bold">
                                    <Filter className="w-4 h-4" /> Filtros Avançados
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Orders List/Kanban Content */}
                    {view === 'list' ? (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground py-24 bg-white dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                    <p className="font-bold uppercase tracking-widest text-xs">Sincronizando Ordens...</p>
                                </div>
                            ) : filteredOrders.length === 0 ? (
                                <Card className="shadow-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <CardContent className="p-20 flex flex-col items-center justify-center gap-6 text-muted-foreground">
                                        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-full">
                                            <ClipboardList className="w-16 h-16 opacity-20" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="font-black text-2xl text-slate-900 dark:text-white mt-4">Nenhuma O.S. ativa</p>
                                            <p className="text-sm font-medium">Inicie uma nova ordem de serviço para começar a operar.</p>
                                        </div>
                                        <Button className="mt-4 gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 h-12 border-b-4 border-slate-950" onClick={() => setIsCreateDialogOpen(true)}>
                                            <Plus className="w-5 h-5" /> Abrir Primeira O.S.
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                filteredOrders.map((order) => {
                                    const statusConfig = getStatusConfig(order.status);
                                    return (
                                        <Card key={order.id} className="shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 group">
                                            <CardContent className="p-0">
                                                <div className="flex flex-col md:flex-row items-stretch">
                                                    {/* O.S. Number Column */}
                                                    <div className="bg-slate-900 text-white p-6 flex flex-col items-center justify-center min-w-[120px] border-r border-slate-800">
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">CÓDIGO</div>
                                                        <div className="text-3xl font-black">#{order.number}</div>
                                                    </div>

                                                    {/* Main Info */}
                                                    <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
                                                        <div className="space-y-1">
                                                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] flex items-center gap-2">
                                                                <User className="w-3.5 h-3.5" /> Cliente
                                                            </div>
                                                            <div className="font-bold text-lg text-slate-900 dark:text-white truncate">{order.clientName}</div>
                                                            <div className="text-xs text-muted-foreground">{order.clientPhone}</div>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] flex items-center gap-2">
                                                                <Car className="w-3.5 h-3.5" /> Veículo
                                                            </div>
                                                            <div className="font-bold text-slate-900 dark:text-white">{order.vehicleBrand} {order.vehicleModel}</div>
                                                            <div className="text-xs font-mono font-black text-blue-600 bg-blue-50 dark:bg-blue-900/40 dark:text-blue-400 px-3 py-1 rounded-lg inline-block border border-blue-100 dark:border-blue-800 mt-1">
                                                                {order.vehiclePlate}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] flex items-center gap-2">
                                                                <Wrench className="w-3.5 h-3.5" /> Técnico
                                                            </div>
                                                            <div className="font-bold text-slate-900 dark:text-white">
                                                                {order.mechanic || <span className="text-slate-400 font-normal italic">Pendente</span>}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] flex items-center gap-2">
                                                                <Calendar className="w-3.5 h-3.5" /> Entrada
                                                            </div>
                                                            <div className="font-bold text-slate-900 dark:text-white">{formatDate(order.entryDate)}</div>
                                                        </div>
                                                    </div>

                                                    {/* Actions & Status */}
                                                    <div className="p-6 bg-slate-50 dark:bg-slate-950/50 flex flex-row md:flex-col items-center justify-center gap-5 min-w-[180px] border-l border-slate-100 dark:border-slate-800">
                                                        <Badge className={`${statusConfig.className} px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 shadow-sm`}>
                                                            {statusConfig.label}
                                                        </Badge>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-10 w-10 p-0 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedOrderId(order.id);
                                                                    setIsPrintDialogOpen(true);
                                                                }}
                                                            >
                                                                <Printer className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-10 w-10 p-0 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    router.push(`/ordens/${order.id}`);
                                                                }}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-10 w-10 p-0 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <MoreVertical className="w-4 h-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                                                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => router.push(`/ordens/${order.id}`)}>
                                                                        <Eye className="w-4 h-4" /> Visualizar Detalhes
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => {
                                                                        setSelectedOrderId(order.id);
                                                                        setIsPrintDialogOpen(true);
                                                                    }}>
                                                                        <Printer className="w-4 h-4" /> Imprimir O.S.
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem className="gap-2 text-blue-600 focus:text-blue-600 cursor-pointer" onClick={() => router.push(`/ordens/${order.id}`)}>
                                                                        <Wrench className="w-4 h-4" /> Gerenciar Fluxo
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
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
                        <div className="overflow-x-auto pb-6 custom-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground py-24 bg-white dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                    <p className="font-bold uppercase tracking-widest text-xs">Mapeando Pátio...</p>
                                </div>
                            ) : (
                                <div className="flex gap-6 min-w-max">
                                    {[
                                        { id: 'OPEN', title: 'Abertas', statuses: ['OPEN'], color: 'bg-slate-900', textColor: 'text-white' },
                                        { id: 'QUOTATION', title: 'Orçamento', statuses: ['QUOTATION'], color: 'bg-purple-900', textColor: 'text-purple-100' },
                                        { id: 'APPROVED', title: 'Aprovadas', statuses: ['APPROVED'], color: 'bg-green-900', textColor: 'text-green-100' },
                                        { id: 'IN_PROGRESS', title: 'Execução', statuses: ['IN_PROGRESS'], color: 'bg-blue-900', textColor: 'text-blue-100' },
                                        { id: 'WAITING_PARTS', title: 'Peças', statuses: ['WAITING_PARTS'], color: 'bg-amber-900', textColor: 'text-amber-100' },
                                        { id: 'FINISHED', title: 'Finais', statuses: ['FINISHED', 'COMPLETED'], color: 'bg-emerald-900', textColor: 'text-emerald-100' },
                                    ].map((column) => {
                                        const columnOrders = filteredOrders.filter(o => column.statuses.includes(o.status));
                                        return (
                                            <div key={column.id} className="flex-shrink-0 w-[360px]">
                                                <div className={`${column.color} rounded-[2rem] p-6 shadow-2xl border border-white/5 h-full flex flex-col`}>
                                                    <div className="flex items-center justify-between mb-8 px-2">
                                                        <h3 className={`font-black text-[11px] uppercase tracking-[0.25em] ${column.textColor}`}>{column.title}</h3>
                                                        <Badge className="bg-white/10 text-white border border-white/10 rounded-full px-3 py-1 font-black text-[10px]">
                                                            {columnOrders.length}
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-4 flex-1 max-h-[1000px] overflow-y-auto pr-3 custom-scrollbar">
                                                        {columnOrders.map((order) => (
                                                            <Card
                                                                key={order.id}
                                                                className="group hover:shadow-2xl transition-all cursor-pointer bg-slate-800/40 border border-white/10 backdrop-blur-md hover:bg-slate-800 hover:-translate-y-1 rounded-2xl overflow-hidden"
                                                                onClick={() => router.push(`/ordens/${order.id}`)}
                                                            >
                                                                <CardContent className="p-5">
                                                                    <div className="flex items-center justify-between mb-5">
                                                                        <Badge className="bg-white text-slate-900 font-black text-[10px] px-2.5 py-1 rounded-lg shadow-xl">#{order.number}</Badge>
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger asChild>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-7 w-7 text-slate-400 hover:text-white rounded-lg"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                >
                                                                                    <MoreVertical className="w-4 h-4" />
                                                                                </Button>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent align="end" className="w-48 rounded-xl bg-slate-900 text-white border-slate-800">
                                                                                <DropdownMenuItem className="gap-2 focus:bg-slate-800 focus:text-white cursor-pointer" onClick={() => router.push(`/ordens/${order.id}`)}>
                                                                                    <Eye className="w-4 h-4" /> Visualizar
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem className="gap-2 focus:bg-slate-800 focus:text-white cursor-pointer" onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setSelectedOrderId(order.id);
                                                                                    setIsPrintDialogOpen(true);
                                                                                }}>
                                                                                    <Printer className="w-4 h-4" /> Imprimir
                                                                                </DropdownMenuItem>
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                    </div>
                                                                    <div className="space-y-5">
                                                                        <div>
                                                                            <div className="font-black text-white text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                                                                                {order.clientName}
                                                                            </div>
                                                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CLIENTE</div>
                                                                        </div>

                                                                        <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 group-hover:bg-slate-950 transition-colors">
                                                                            <div className="font-bold text-slate-100 text-sm mb-2">
                                                                                {order.vehicleBrand} {order.vehicleModel}
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="text-[10px] font-mono font-black text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">
                                                                                    {order.vehiclePlate}
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-8 h-8 rounded-xl bg-slate-700/50 border border-white/10 flex items-center justify-center text-[11px] font-black text-white shadow-inner">
                                                                                    {order.mechanic?.[0] || '?'}
                                                                                </div>
                                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{order.mechanic || <span className="italic opacity-50 font-normal">S/ Técnico</span>}</span>
                                                                            </div>
                                                                            <div className="text-[10px] font-black text-slate-500 bg-slate-900/40 px-2 py-1 rounded-lg">{formatDate(order.entryDate)}</div>
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                        {columnOrders.length === 0 && (
                                                            <div className="text-center text-slate-500 font-bold text-[10px] uppercase tracking-widest py-16 border-2 border-dashed border-white/5 rounded-[2rem] bg-white/5 backdrop-blur-sm">
                                                                Coluna Vazia
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                </>
            ) : (
                <LegacyOrderList />
            )}

            <CreateOrderDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={() => {
                    fetchOrders();
                    toast.success('Ordem de serviço criada com sucesso!');
                }}
            />

            {selectedOrderId && (
                <ServiceOrderPrintDialog
                    orderId={selectedOrderId}
                    open={isPrintDialogOpen}
                    onOpenChange={setIsPrintDialogOpen}
                />
            )}
        </div>
    );
}
