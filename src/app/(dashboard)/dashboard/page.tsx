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
    DollarSign,
    ArrowRight,
    History
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ChecklistInteligente from '@/components/checklist/ChecklistInteligente';
import { CreateOrderDialog } from '@/components/orders/CreateOrderDialog';
import { toast } from 'sonner';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    AreaChart,
    Area,
    Line,
    LineChart
} from 'recharts';

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
        waitingParts: 0,
        legacyPending: 0
    });
    const [activeOrders, setActiveOrders] = React.useState<any[]>([]);
    const [nextAppointments, setNextAppointments] = React.useState<any[]>([]);

    // Mock data for charts - to be replaced with real API data later
    const revenueData = [
        { name: 'Jan', value: 15000 },
        { name: 'Fev', value: 18500 },
        { name: 'Mar', value: 22000 },
        { name: 'Abr', value: 21000 },
        { name: 'Mai', value: 25000 },
        { name: 'Jun', value: 28000 },
    ];

    const servicesData = [
        { name: 'Revisão', value: 35, color: '#10b981' },
        { name: 'Mecânica', value: 45, color: '#3b82f6' },
        { name: 'Elétrica', value: 15, color: '#f59e0b' },
        { name: 'Outros', value: 5, color: '#64748b' },
    ];

    const budgetStatusData = [
        { name: 'Aprovados', value: 8, color: '#10b981' },
        { name: 'Pendentes', value: 5, color: '#f59e0b' },
        { name: 'Rejeitados', value: 2, color: '#ef4444' },
    ];

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
            <div className="p-6 max-w-[1600px] mx-auto">
                <Button variant="ghost" onClick={() => setView('dashboard')} className="mb-4">
                    ← Voltar ao Dashboard
                </Button>
                <ChecklistInteligente />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Dashboard Central</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Bem-vindo, Gabriel. Visão geral da sua oficina hoje.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 dark:border-slate-800 font-bold gap-2" onClick={() => toast.info("Funcionalidade em desenvolvimento")}>
                        <Calendar className="w-4 h-4" /> Relatórios
                    </Button>
                    <Button className="h-12 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xl shadow-slate-900/10 gap-2" onClick={() => setIsCreateOrderOpen(true)}>
                        <Wrench className="w-4 h-4" /> Nova O.S.
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card className="border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                <Car className="w-6 h-6" />
                            </div>
                            <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 rounded-lg px-2.5 py-0.5 font-bold">Ativos</Badge>
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{loading ? '...' : stats.carsInShop}</div>
                        <div className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Carros na Oficina</div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg px-2.5 py-0.5 font-bold">Mensal</Badge>
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                            {loading ? '...' : `R$ ${Number(stats.monthlyRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        </div>
                        <div className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Faturamento Estimado</div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                                <Clock className="w-6 h-6" />
                            </div>
                            <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 rounded-lg px-2.5 py-0.5 font-bold">Pendente</Badge>
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{loading ? '...' : stats.pendingOrders}</div>
                        <div className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Novas Solicitações</div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <Badge variant="outline" className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 rounded-lg px-2.5 py-0.5 font-bold">Estoque</Badge>
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{loading ? '...' : stats.stockAlerts}</div>
                        <div className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Itens Críticos</div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                <History className="w-6 h-6" />
                            </div>
                            <Badge variant="outline" className="text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg px-2.5 py-0.5 font-bold">Histórico</Badge>
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                            {loading ? '...' : `R$ ${Number(stats.legacyPending || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        </div>
                        <div className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Pendências Legado</div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-none shadow-xl rounded-2xl overflow-hidden relative group cursor-pointer hover:shadow-2xl transition-all" onClick={() => router.push('/gestao-patio')}>
                    <div className="absolute right-0 top-0 p-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all"></div>
                    <CardContent className="p-8 relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner text-white">
                                    <AlertTriangle className="w-8 h-8" />
                                </div>
                                <div>
                                    <div className="font-black text-2xl mb-1">Atenção ao Pátio</div>
                                    <div className="text-amber-100 font-medium text-lg">
                                        {loading ? '...' : stats.waitingParts} veículos aguardando peças
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors">
                                <ChevronRight className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none shadow-xl rounded-2xl overflow-hidden relative group cursor-pointer hover:shadow-2xl transition-all" onClick={() => router.push('/financeiro')}>
                    <div className="absolute right-0 top-0 p-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                    <CardContent className="p-8 relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm shadow-inner text-blue-400">
                                    <TrendingUp className="w-8 h-8" />
                                </div>
                                <div>
                                    <div className="font-black text-2xl mb-1">Resumo Financeiro</div>
                                    <div className="text-slate-300 font-medium text-lg">
                                        {loading ? '...' : `R$ ${Number(stats.monthlyRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} (Faturamento)
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors">
                                <ChevronRight className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Revenue Chart */}
                <Card className="lg:col-span-2 border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                    <CardHeader className="p-8 pb-0">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-xl font-black text-slate-900 dark:text-white">Faturamento Mensal</CardTitle>
                                <CardDescription className="text-base">Visão geral de receitas na linha do tempo</CardDescription>
                            </div>
                            <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 px-3 py-1 rounded-lg">
                                <TrendingUp className="w-3.5 h-3.5 mr-1" /> +12% Crescimento
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[300px] p-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.1)" />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13, fontWeight: 500 }}
                                    tickFormatter={(value) => `R$${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '12px',
                                        color: 'hsl(var(--card-foreground))',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        padding: '12px 16px',
                                        fontWeight: 'bold'
                                    }}
                                    itemStyle={{ color: 'hsl(var(--primary))' }}
                                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Services Pie Chart */}
                <Card className="border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                    <CardHeader className="p-8 pb-0">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-xl font-black text-slate-900 dark:text-white">Tipos de Serviço</CardTitle>
                                <CardDescription className="text-base">Distribuição dos atendimentos</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[300px] p-8 flex flex-col items-center justify-center">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={servicesData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {servicesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '12px',
                                        color: 'hsl(var(--card-foreground))',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                    }}
                                    itemStyle={{ color: 'hsl(var(--card-foreground))' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center gap-4 mt-6">
                            {servicesData.slice(0, 3).map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-xs uppercase font-bold text-slate-600 dark:text-slate-400">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Budget Status Chart */}
                <Card className="border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                    <CardHeader className="p-8 pb-0">
                        <CardTitle className="text-xl font-black text-slate-900 dark:text-white">Orçamentos</CardTitle>
                        <CardDescription className="text-base">Status atual das cotações</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] p-8 flex flex-col justify-center items-center">
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie
                                    data={budgetStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {budgetStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '12px',
                                        color: 'hsl(var(--card-foreground))',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                    }}
                                    itemStyle={{ color: 'hsl(var(--card-foreground))' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-1 gap-3 mt-6 w-full px-4">
                            {budgetStatusData.map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{item.name}</span>
                                    </div>
                                    <span className="font-black text-sm">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Active Orders - Takes 2 columns */}
                <Card className="lg:col-span-2 border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-6 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900 dark:text-white">Operação em Tempo Real</CardTitle>
                            <CardDescription className="text-base">Veículos em serviço e status de peças</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 rounded-xl text-xs font-bold uppercase tracking-widest border-slate-200"
                            onClick={() => router.push('/gestao-patio')}
                        >
                            Ver Todos <ArrowRight className="w-3 h-3" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-col">
                            {loading ? (
                                <div className="text-center py-20 text-muted-foreground font-medium">Carregando operações...</div>
                            ) : activeOrders.length === 0 ? (
                                <div className="text-center py-20 flex flex-col items-center gap-4 text-muted-foreground">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full">
                                        <Car className="w-8 h-8 opacity-50" />
                                    </div>
                                    <p className="font-bold">Nenhuma ordem de serviço ativa no momento.</p>
                                </div>
                            ) : (
                                activeOrders.map((order, index) => (
                                    <div
                                        key={order.id}
                                        className={`flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${index !== activeOrders.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
                                        onClick={() => router.push(`/ordens`)}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="flex flex-col items-center justify-center w-16 h-12 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-xl group-hover:border-primary/50 transition-colors">
                                                <div className="w-full bg-primary h-1.5 rounded-t" />
                                                <span className="text-[10px] font-black mt-1.5 uppercase text-slate-700 dark:text-slate-300">{order.vehiclePlate}</span>
                                            </div>
                                            <div>
                                                <div className="font-black text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors">{order.vehicleBrand} {order.vehicleModel}</div>
                                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                    {order.customerName}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="hidden md:flex flex-col items-end gap-1">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status de Peças</span>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${Number(order.missingParts) === 0
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                        : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400'
                                                        }`}
                                                >
                                                    {Number(order.missingParts) === 0 ? 'OK' : 'PENDENTE'}
                                                </Badge>
                                            </div>
                                            <Badge
                                                className={`text-xs px-4 py-1.5 rounded-lg font-bold shadow-sm ${order.status === 'IN_PROGRESS' ? 'bg-blue-600 hover:bg-blue-700' :
                                                    order.status === 'WAITING_PARTS' ? 'bg-amber-500 hover:bg-amber-600' :
                                                        'bg-emerald-600 hover:bg-emerald-700'
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
            </div>

            {/* Sidebar / Extra Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Próximos Agendamentos */}
                <Card className="lg:col-span-2 border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                    <CardHeader className="p-6 pb-2">
                        <CardTitle className="text-lg font-black text-slate-900 dark:text-white">Próximos Agendamentos</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        {loading ? (
                            <div className="text-center text-muted-foreground py-4 text-sm font-medium">Carregando...</div>
                        ) : nextAppointments.length === 0 ? (
                            <div className="text-center text-muted-foreground py-4 text-sm font-medium">Nenhum agendamento próximo</div>
                        ) : (
                            nextAppointments.map((item, i) => {
                                const date = new Date(item.entryDate);
                                const day = date.getDate();
                                const month = date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');

                                return (
                                    <div key={i} className="flex gap-4 items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer group">
                                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-center min-w-[60px] group-hover:bg-white group-hover:shadow-md transition-all">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{month}</div>
                                            <div className="text-xl font-black leading-none text-slate-900 dark:text-white mt-1">{day}</div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-black text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{item.serviceType || 'Revisão Geral'}</div>
                                            <div className="text-xs font-medium text-slate-500">{item.vehicleModel} • {item.customerName}</div>
                                        </div>
                                        <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>

                {/* Import XML */}
                <Card className="lg:col-span-2 border-none shadow-xl bg-slate-900 text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700">
                        <FileBox size={180} />
                    </div>
                    <CardHeader className="p-8 pb-4 relative z-10">
                        <CardTitle className="text-xl font-black">Importação de XML</CardTitle>
                        <CardDescription className="text-slate-400 font-medium">Importe notas fiscais de peças automaticamente</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 relative z-10">
                        <div className="border-2 border-dashed border-slate-700/50 hover:border-slate-600 bg-slate-950/30 rounded-2xl p-8 flex flex-col items-center text-center space-y-4 transition-colors cursor-pointer" onClick={() => toast.success("Processando XML...")}>
                            <div className="p-4 bg-primary/10 rounded-full text-primary ring-8 ring-primary/5">
                                <Upload className="w-8 h-8" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-200">Clique para selecionar o XML</div>
                                <div className="text-xs text-slate-500 mt-1">ou arraste o arquivo aqui</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
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
