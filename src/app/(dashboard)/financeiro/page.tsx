"use client";

import React, { useEffect, useState } from 'react';
import {
    DollarSign,
    ArrowDownCircle,
    ArrowUpCircle,
    Wallet,
    Filter,
    Download,
    Plus,
    PieChart as PieChartIcon,
    Search,
    MoreVertical,
    Loader2,
    AlertTriangle,
    ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface Transaction {
    id: string;
    date: string;
    description: string;
    category: string | null;
    costCenterName: string | null;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    status: 'PAID' | 'PENDING' | 'CANCELLED';
    clientName?: string;
    soNumber?: number;
}

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';

export default function FinanceiroPage() {
    const [selectedTab, setSelectedTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/finance/list');
            const data = await response.json();
            if (data.success) {
                setTransactions(data.transactions);
            } else {
                toast.error('Erro ao carregar transações');
            }
        } catch (error) {
            console.error('Erro ao buscar transações:', error);
            toast.error('Erro ao conectar com o servidor');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const isOverdue = (transaction: Transaction) => {
        if (transaction.status !== 'PENDING') return false;
        const dueDate = new Date(transaction.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dueDate < today;
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesTab = selectedTab === 'all' ||
            (selectedTab === 'receitas' && t.type === 'INCOME') ||
            (selectedTab === 'despesas' && t.type === 'EXPENSE') ||
            (selectedTab === 'pendentes' && t.status === 'PENDING') ||
            (selectedTab === 'vencidos' && isOverdue(t));

        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.clientName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (t.soNumber?.toString().includes(searchTerm));

        return matchesTab && matchesSearch;
    });

    const calculateStats = () => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalBalance = transactions
            .filter(t => t.status === 'PAID')
            .reduce((acc, t) => acc + (t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount)), 0);

        const monthlyIncome = transactions
            .filter(t => t.type === 'INCOME' && new Date(t.date) >= firstDayOfMonth)
            .reduce((acc, t) => acc + Number(t.amount), 0);

        const monthlyExpense = transactions
            .filter(t => t.type === 'EXPENSE' && new Date(t.date) >= firstDayOfMonth)
            .reduce((acc, t) => acc + Number(t.amount), 0);

        const totalOverdue = transactions
            .filter(t => isOverdue(t))
            .reduce((acc, t) => acc + Number(t.amount), 0);

        return {
            totalBalance,
            monthlyIncome,
            monthlyExpense,
            totalOverdue,
            profit: monthlyIncome - monthlyExpense
        };
    };

    const statsData = calculateStats();

    const stats = [
        { label: 'Saldo Atual', value: `R$ ${statsData.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Receitas (Mês)', value: `R$ ${statsData.monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: ArrowUpCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Despesas (Mês)', value: `R$ ${statsData.monthlyExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: ArrowDownCircle, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Total Vencido', value: `R$ ${statsData.totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    const getCostCentersData = () => {
        const centers: Record<string, number> = {};
        transactions
            .filter(t => t.type === 'EXPENSE')
            .forEach(t => {
                const name = t.costCenterName || 'Outros';
                centers[name] = (centers[name] || 0) + Number(t.amount);
            });

        const totalExpense = Object.values(centers).reduce((a, b) => a + b, 0);
        return Object.entries(centers).map(([name, amount]) => ({
            name,
            amount,
            total: totalExpense,
            color: 'bg-blue-500' // Simplified color
        }));
    };

    const costCenters = getCostCentersData();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const getChartData = () => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        return last7Days.map(date => {
            const dayTransactions = transactions.filter(t => t.date.startsWith(date));
            const income = dayTransactions
                .filter(t => t.type === 'INCOME' && t.status === 'PAID')
                .reduce((acc, t) => acc + Number(t.amount), 0);
            const expense = dayTransactions
                .filter(t => t.type === 'EXPENSE' && t.status === 'PAID')
                .reduce((acc, t) => acc + Number(t.amount), 0);

            return {
                name: new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' }),
                income,
                expense
            };
        });
    };

    const getDataHealth = () => {
        const total = transactions.length;
        if (total === 0) return 100;
        const incomplete = transactions.filter(t => !t.category && !t.costCenterName).length;
        return ((total - incomplete) / total) * 100;
    };

    const chartData = getChartData();
    const dataHealth = getDataHealth();

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Gestão Financeira</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Controle de fluxo de caixa, conciliação e relatórios.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 dark:border-slate-800 font-bold gap-2">
                        <Download className="w-4 h-4" /> Exportar Relatórios
                    </Button>
                    <Button className="h-12 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xl shadow-slate-900/10 gap-2">
                        <Plus className="w-4 h-4" /> Novo Lançamento
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} bg-opacity-20`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="lg:col-span-2 border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                    <CardHeader className="p-8 pb-0">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <CardTitle className="text-xl font-black text-slate-900 dark:text-white">Fluxo Semanal</CardTitle>
                                <CardDescription className="text-base">Entradas vs Saídas consolidado</CardDescription>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Entradas</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                    <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Saídas</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--emerald-500))" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="hsl(var(--emerald-500))" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--red-500))" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="hsl(var(--red-500))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.1)" />
                                <XAxis dataKey="name" hide />
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
                                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-none shadow-xl bg-slate-900 text-white rounded-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <PieChartIcon className="w-48 h-48" />
                    </div>
                    <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6 text-center md:text-left">
                            <div>
                                <h2 className="text-3xl font-black mb-2">Qualidade dos Dados</h2>
                                <p className="text-slate-400 font-medium text-lg">Transações devidamente categorizadas permitem relatórios mais precisos.</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-300">
                                    <span>Nível de Preenchimento</span>
                                    <span className={dataHealth > 80 ? 'text-emerald-400' : 'text-amber-400'}>{dataHealth.toFixed(1)}%</span>
                                </div>
                                <Progress value={dataHealth} className="h-4 bg-white/10 rounded-full" />
                            </div>
                        </div>
                        <div className="text-center p-8 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10 min-w-[200px]">
                            <div className="text-5xl font-black mb-2">{transactions.filter(t => !t.category).length}</div>
                            <div className="text-xs font-black uppercase tracking-widest text-slate-400">Sem Categoria</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 rounded-2xl p-8 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full -mr-4 -mt-4"></div>
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="text-xs font-black uppercase tracking-widest text-slate-400">Risco Financeiro</div>
                            <div className="text-3xl font-black text-slate-900 dark:text-white">R$ {statsData.totalOverdue.toLocaleString('pt-BR')}</div>
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed mb-4 relative z-10">
                        Você possui <strong className="text-slate-900 dark:text-white">{transactions.filter(t => isOverdue(t)).length} títulos vencidos</strong>. Acompanhe de perto para evitar impacto no caixa.
                    </p>
                    <Button variant="outline" className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 relative z-10 font-bold">
                        Ver Vencidos
                    </Button>
                </Card>
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedTab}>
                <div className="flex items-center justify-between mb-6">
                    <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 h-14 w-full md:w-auto overflow-x-auto justify-start">
                        <TabsTrigger value="all" className="rounded-lg font-bold text-xs uppercase px-6 h-11 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm transition-all">Geral</TabsTrigger>
                        <TabsTrigger value="receitas" className="rounded-lg font-bold text-xs uppercase px-6 h-11 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 transition-all">Receitas</TabsTrigger>
                        <TabsTrigger value="despesas" className="rounded-lg font-bold text-xs uppercase px-6 h-11 data-[state=active]:bg-red-50 data-[state=active]:text-red-700 transition-all">Despesas</TabsTrigger>
                        <TabsTrigger value="pendentes" className="rounded-lg font-bold text-xs uppercase px-6 h-11 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 transition-all">Pendentes</TabsTrigger>
                        <TabsTrigger value="vencidos" className="rounded-lg font-bold text-xs uppercase px-6 h-11 text-red-600 bg-red-50/50 hover:bg-red-100/50 data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all">
                            <AlertTriangle className="w-3.5 h-3.5 mr-2" /> Vencidos
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-1 border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                        <CardHeader className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-black text-slate-900 dark:text-white">Centros de Custos</CardTitle>
                                    <CardDescription>Gastos por área (Baseado em Despesas)</CardDescription>
                                </div>
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    <PieChartIcon className="w-5 h-5 text-slate-500" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6 pt-0">
                            {costCenters.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <PieChartIcon className="w-10 h-10 opacity-20 mb-3" />
                                    <p className="text-sm font-medium">Sem despesas registradas.</p>
                                </div>
                            ) : (
                                costCenters.map((cc) => (
                                    <div key={cc.name} className="space-y-2 group cursor-pointer">
                                        <div className="flex justify-between text-sm group-hover:text-primary transition-colors">
                                            <span className="font-ex-bold font-bold">{cc.name}</span>
                                            <span className="text-muted-foreground font-medium">R$ {cc.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <Progress value={(cc.amount / cc.total) * 100} className="h-2.5 rounded-lg bg-slate-100 dark:bg-slate-800" />
                                        <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-black tracking-wider">
                                            <span>{((cc.amount / cc.total) * 100).toFixed(1)}% do total</span>
                                        </div>
                                    </div>
                                ))
                            )}
                            <Button variant="ghost" className="w-full text-xs font-black text-primary hover:bg-primary/5 uppercase tracking-widest h-12 rounded-xl mt-4">
                                Detalhar Centros de Custos <ArrowRight className="w-3.5 h-3.5 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                        <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-xl font-black text-slate-900 dark:text-white">
                                        {selectedTab === 'vencidos' ? 'Débitos Passados / Notas Vencidas' : 'Extrato Detalhado'}
                                    </CardTitle>
                                    <CardDescription>
                                        {selectedTab === 'vencidos'
                                            ? 'Valores pendentes com data de vencimento ultrapassada.'
                                            : 'Todos os lançamentos do período atual.'}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            placeholder="Buscar transação..."
                                            className="pl-10 h-10 w-[240px] rounded-xl text-sm border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="p-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                    <p className="font-bold uppercase text-[10px] tracking-widest">Carregando...</p>
                                </div>
                            ) : filteredTransactions.length === 0 ? (
                                <div className="p-20 text-center flex flex-col items-center justify-center opacity-40">
                                    <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                                        <DollarSign className="w-12 h-12 text-slate-400" />
                                    </div>
                                    <p className="font-black uppercase tracking-widest text-slate-400">Nenhuma movimentação encontrada</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-50/80 border-b border-slate-100 dark:border-slate-800">
                                            <TableHead className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-6 h-12">Data</TableHead>
                                            <TableHead className="text-[10px] uppercase font-black text-slate-500 tracking-widest h-12">Descrição / Cliente</TableHead>
                                            <TableHead className="text-[10px] uppercase font-black text-slate-500 tracking-widest h-12">Categoria</TableHead>
                                            <TableHead className="text-[10px] uppercase font-black text-slate-500 tracking-widest text-right px-6 h-12">Valor</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTransactions.map((t) => {
                                            const overdue = isOverdue(t);
                                            return (
                                                <TableRow key={t.id} className={`group transition-all border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/40 ${overdue ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}>
                                                    <TableCell className="text-xs px-6 font-bold py-4 text-slate-600 dark:text-slate-400">
                                                        {formatDate(t.date)}
                                                        {overdue && (
                                                            <div className="text-[9px] text-red-600 font-black uppercase mt-1 flex items-center gap-1 bg-red-100 dark:bg-red-900/30 w-fit px-1.5 py-0.5 rounded">
                                                                VENCIDO
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="text-sm font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{t.description}</div>
                                                        <div className="text-[11px] text-muted-foreground uppercase font-bold flex gap-3 items-center">
                                                            {t.clientName && <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-slate-400"></span>{t.clientName}</span>}
                                                            {t.soNumber && <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">OS #{t.soNumber}</span>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <Badge variant="outline" className="text-[10px] font-bold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm">
                                                            {t.category || t.costCenterName || 'Geral'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right px-6 py-4">
                                                        <div className={`text-base font-black ${t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                            {t.type === 'INCOME' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </div>
                                                        <div className="text-[10px] font-black uppercase tracking-wider flex justify-end gap-1.5 items-center mt-1">
                                                            <div className={`w-2 h-2 rounded-full ${t.status === 'PAID' ? 'bg-emerald-500' : t.status === 'PENDING' ? (overdue ? 'bg-red-500 animate-pulse' : 'bg-amber-500') : 'bg-slate-300'}`} />
                                                            <span className={t.status === 'PAID' ? 'text-emerald-600' : t.status === 'PENDING' ? (overdue ? 'text-red-500' : 'text-amber-500') : 'text-slate-400'}>
                                                                {t.status === 'PAID' ? 'PAGO' : t.status === 'PENDING' ? (overdue ? 'VENCIDO' : 'PENDENTE') : 'CANCELADO'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </Tabs>
        </div>
    );
}
