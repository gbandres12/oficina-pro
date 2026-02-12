"use client";

import React from 'react';
import {
    Car,
    TrendingUp,
    Clock,
    AlertTriangle,
    CheckCircle2,
    FileBox,
    Upload,
    Calendar,
    ChevronRight,
    Wrench,
    DollarSign
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ChecklistInteligente from '@/components/checklist/ChecklistInteligente';
import { CreateOrderDialog } from '@/components/orders/CreateOrderDialog';
import { toast } from 'sonner';

export default function DashboardPage() {
    const router = useRouter();
    const [view, setView] = React.useState<'dashboard' | 'checklist'>('dashboard');
    const [isCreateOrderOpen, setIsCreateOrderOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [stats, setStats] = React.useState({
        carsInShop: 0,
        monthlyRevenue: 0,
        pendingOrders: 0,
        stockAlerts: 0,
        waitingParts: 0
    });
    const [activeOrders, setActiveOrders] = React.useState<any[]>([]);
    const [nextAppointments, setNextAppointments] = React.useState<any[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/dashboard/stats');
            const data = await response.json();
            if (data.success) {
                setStats(data.stats);
                setActiveOrders(data.activeOrders);
                setNextAppointments(data.nextAppointments || []);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Erro ao carregar dados do dashboard');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    if (view === 'checklist') {
        return (
            <div className="p-6">
                <Button variant="ghost" onClick={() => setView('dashboard')} className="mb-4">
                    ← Voltar ao Dashboard
                </Button>
                <ChecklistInteligente />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Dashboard Central</h1>
                    <p className="text-muted-foreground">Bem-vindo, Gabriel. Veja o que está acontecendo hoje.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2" onClick={() => toast.info("Funcionalidade em desenvolvimento")}>
                        <Calendar className="w-4 h-4" /> Relatórios
                    </Button>
                    <Button className="gap-2 bg-primary" onClick={() => setIsCreateOrderOpen(true)}>
                        <Wrench className="w-4 h-4" /> Nova O.S.
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                                <Car className="w-5 h-5" />
                            </div>
                            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Ativos</Badge>
                        </div>
                        <div className="text-2xl font-bold mb-1">{loading ? '...' : stats.carsInShop}</div>
                        <div className="text-sm text-muted-foreground">Carros na Oficina</div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Mensal</Badge>
                        </div>
                        <div className="text-2xl font-bold mb-1">
                            {loading ? '...' : `R$ ${Number(stats.monthlyRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        </div>
                        <div className="text-sm text-muted-foreground">Faturamento Estimado</div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                                <Clock className="w-5 h-5" />
                            </div>
                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Pendente</Badge>
                        </div>
                        <div className="text-2xl font-bold mb-1">{loading ? '...' : stats.pendingOrders}</div>
                        <div className="text-sm text-muted-foreground">Novas Solicitações</div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-red-50 text-red-600">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Estoque</Badge>
                        </div>
                        <div className="text-2xl font-bold mb-1">{loading ? '...' : stats.stockAlerts}</div>
                        <div className="text-sm text-muted-foreground">Itens Críticos</div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-none shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="font-bold text-lg mb-1">Atenção ao Pátio</div>
                                    <div className="text-sm text-amber-50">
                                        {loading ? '...' : stats.waitingParts} veículos aguardando peças
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                className="text-white hover:bg-white/20 font-bold"
                                onClick={() => router.push('/gestao-patio')}
                            >
                                Gerenciar <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-primary to-blue-600 text-white border-none shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="font-bold text-lg mb-1">Resumo Financeiro</div>
                                    <div className="text-sm text-blue-50">
                                        {loading ? '...' : `R$ ${Number(stats.monthlyRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} (Faturamento)
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                className="text-white hover:bg-white/20 font-bold"
                                onClick={() => router.push('/financeiro')}
                            >
                                Ver Fluxo <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Orders - Takes 2 columns */}
                <Card className="lg:col-span-2 border-none shadow-lg">
                    <CardHeader className="border-b pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold">Operação em Tempo Real</CardTitle>
                                <CardDescription>Fluxo de veículos e status de peças</CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => router.push('/gestao-patio')}
                            >
                                Ver Todos <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            {loading ? (
                                <div className="text-center py-10 text-muted-foreground">Carregando operações...</div>
                            ) : activeOrders.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">Nenhuma ordem de serviço ativa no momento.</div>
                            ) : (
                                activeOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between p-4 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 transition-all hover:shadow-md cursor-pointer"
                                        onClick={() => router.push(`/ordens`)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-center justify-center w-14 h-10 border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg">
                                                <div className="w-full bg-blue-600 h-1 rounded-t" />
                                                <span className="text-[10px] font-bold mt-1 uppercase">{order.vehiclePlate}</span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white">{order.vehicleBrand} {order.vehicleModel}</div>
                                                <div className="text-xs text-muted-foreground">{order.customerName}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="hidden md:flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">Peças:</span>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${Number(order.missingParts) === 0
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                        : 'bg-red-50 text-red-600 border-red-200'
                                                        }`}
                                                >
                                                    {Number(order.missingParts) === 0 ? 'OK' : 'PENDENTE'}
                                                </Badge>
                                            </div>
                                            <Badge
                                                className={`text-xs ${order.status === 'IN_PROGRESS' ? 'bg-blue-600' :
                                                    order.status === 'WAITING_PARTS' ? 'bg-amber-500' :
                                                        'bg-emerald-600'
                                                    }`}
                                            >
                                                {order.status === 'IN_PROGRESS' ? 'EM EXECUÇÃO' :
                                                    order.status === 'WAITING_PARTS' ? 'AG. PEÇAS' :
                                                        order.status === 'APPROVED' ? 'APROVADO' : order.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar - Takes 1 column */}
                <div className="space-y-6">
                    {/* Próximos Agendamentos */}
                    <Card className="border-none shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold">Próximos Agendamentos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loading ? (
                                <div className="text-center text-muted-foreground py-4">Carregando...</div>
                            ) : nextAppointments.length === 0 ? (
                                <div className="text-center text-muted-foreground py-4">Nenhum agendamento próximo</div>
                            ) : (
                                nextAppointments.map((item, i) => {
                                    const date = new Date(item.entryDate);
                                    const day = date.getDate();
                                    const month = date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');

                                    return (
                                        <div key={i} className="flex gap-3 items-start">
                                            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-center min-w-[50px]">
                                                <div className="text-xs font-bold text-muted-foreground">{month}</div>
                                                <div className="text-lg font-black leading-none">{day}</div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold mb-1">{item.serviceType || 'Revisão'}</div>
                                                <div className="text-xs text-muted-foreground">{item.vehicleModel} • {item.customerName}</div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>

                    {/* Import XML */}
                    <Card className="border-none shadow-lg bg-slate-900 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 opacity-5">
                            <FileBox size={120} />
                        </div>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold">Importação de XML</CardTitle>
                            <CardDescription className="text-slate-400">Nota fiscal de peças</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center text-center space-y-3 bg-white/5">
                                <Upload className="w-10 h-10 text-primary" />
                                <div className="text-sm text-slate-300">Solte o arquivo XML aqui</div>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="bg-primary hover:bg-primary/90 w-full"
                                    onClick={() => toast.success("Processando XML...")}
                                >
                                    Selecionar Arquivo
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <CreateOrderDialog
                open={isCreateOrderOpen}
                onOpenChange={setIsCreateOrderOpen}
                onSuccess={() => {
                    toast.success('Ordem de serviço criada com sucesso!');
                    fetchData(); // Refresh data
                }}
            />
        </div>
    );
}
