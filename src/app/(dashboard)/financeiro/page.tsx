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
    AlertTriangle
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
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Gestão Financeira</h1>
                    <p className="text-muted-foreground font-medium">Fluxo de caixa, valores em aberto e conciliação.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 rounded-xl h-11 px-6 font-bold uppercase text-xs">
                        <Download className="w-4 h-4" /> Exportar
                    </Button>
                    <Button className="gap-2 rounded-xl bg-primary h-11 px-6 font-bold uppercase text-xs shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4" /> Novo Lançamento
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden group">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-black">{stat.value}</div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="lg:col-span-2 border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                    <CardContent className="p-6 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Fluxo Semanal</h3>
                                <p className="text-xs text-muted-foreground">Entradas vs Saídas (Pagos)</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-bold uppercase">Entradas</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <span className="text-[10px] font-bold uppercase">Saídas</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 min-h-[120px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                                    <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-none shadow-md bg-slate-900 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <PieChartIcon className="w-32 h-32" />
                    </div>
                    <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">Qualidade dos Dados</h2>
                                <p className="text-slate-400 font-medium">Transações com Categoria e Centro de Custo atribuídos.</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                    <span>Alimentação do Sistema</span>
                                    <span className={dataHealth > 80 ? 'text-emerald-400' : 'text-amber-400'}>{dataHealth.toFixed(1)}%</span>
                                </div>
                                <Progress value={dataHealth} className="h-3 bg-white/10" />
                            </div>
                        </div>
                        <div className="text-center p-6 bg-white/5 rounded-3xl backdrop-blur-sm border border-white/10">
                            <div className="text-4xl font-black">{transactions.filter(t => !t.category).length}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Pendentes de<br />Classificação</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white dark:bg-slate-900 p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm font-black uppercase tracking-widest text-slate-400">Risco de Inadimplência</div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">R$ {statsData.totalOverdue.toLocaleString('pt-BR')}</div>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Você possui <strong>{transactions.filter(t => isOverdue(t)).length}</strong> títulos vencidos que precisam de atenção imediata para manter a saúde do caixa.
                    </p>
                </Card>
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedTab}>
                <div className="flex items-center justify-between mb-4">
                    <TabsList className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-border/50 shadow-sm h-12">
                        <TabsTrigger value="all" className="rounded-lg font-bold text-xs uppercase px-6">Geral</TabsTrigger>
                        <TabsTrigger value="receitas" className="rounded-lg font-bold text-xs uppercase px-6">Receitas</TabsTrigger>
                        <TabsTrigger value="despesas" className="rounded-lg font-bold text-xs uppercase px-6">Despesas</TabsTrigger>
                        <TabsTrigger value="pendentes" className="rounded-lg font-bold text-xs uppercase px-6">Pendentes</TabsTrigger>
                        <TabsTrigger value="vencidos" className="rounded-lg font-bold text-xs uppercase px-6 text-red-600 bg-red-50/50">Vencidos</TabsTrigger>
                    </TabsList>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-1 border-none shadow-xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Centros de Custos</CardTitle>
                                    <CardDescription>Gastos por área (Baseado em Despesas)</CardDescription>
                                </div>
                                <PieChartIcon className="w-5 h-5 text-primary/50" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {costCenters.length === 0 ? (
                                <p className="text-center py-10 text-muted-foreground text-sm">Sem despesas registradas.</p>
                            ) : (
                                costCenters.map((cc) => (
                                    <div key={cc.name} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-bold">{cc.name}</span>
                                            <span className="text-muted-foreground">R$ {cc.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <Progress value={(cc.amount / cc.total) * 100} className="h-2" />
                                        <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold">
                                            <span>{((cc.amount / cc.total) * 100).toFixed(1)}% do total</span>
                                        </div>
                                    </div>
                                ))
                            )}
                            <Button variant="ghost" className="w-full text-xs font-bold text-primary hover:bg-primary/5 uppercase tracking-widest">
                                Detalhar Centros de Custos →
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 border-none shadow-xl overflow-hidden">
                        <CardHeader className="pb-0">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-lg">
                                        {selectedTab === 'vencidos' ? 'Débitos Passados / Notas Vencidas' : 'Extrato Detalhado'}
                                    </CardTitle>
                                    <CardDescription>
                                        {selectedTab === 'vencidos'
                                            ? 'Valores pendentes com data de vencimento ultrapassada.'
                                            : 'Todos os lançamentos do período.'}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar transação..."
                                            className="pl-9 h-9 w-[200px] rounded-full text-xs"
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
                                    <Loader2 className="w-10 h-10 animate-spin" />
                                    <p className="font-bold uppercase text-[10px] tracking-widest">Carregando...</p>
                                </div>
                            ) : filteredTransactions.length === 0 ? (
                                <div className="p-20 text-center opacity-20">
                                    <DollarSign className="w-12 h-12 mx-auto mb-4" />
                                    <p className="font-black uppercase tracking-widest">Nenhuma movimentação encontrada</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
                                            <TableHead className="text-[10px] uppercase font-bold px-6">Data</TableHead>
                                            <TableHead className="text-[10px] uppercase font-bold">Descrição / Cliente</TableHead>
                                            <TableHead className="text-[10px] uppercase font-bold">Categoria</TableHead>
                                            <TableHead className="text-[10px] uppercase font-bold text-right px-6">Valor</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTransactions.map((t) => {
                                            const overdue = isOverdue(t);
                                            return (
                                                <TableRow key={t.id} className={`group transition-colors ${overdue ? 'bg-red-50/30' : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/50'}`}>
                                                    <TableCell className="text-xs px-6 font-medium">
                                                        {formatDate(t.date)}
                                                        {overdue && (
                                                            <div className="text-[8px] text-red-600 font-bold uppercase mt-1 flex items-center gap-1">
                                                                <AlertTriangle className="w-2 h-2" /> VENCIDO
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm font-bold">{t.description}</div>
                                                        <div className="text-[10px] text-muted-foreground uppercase font-bold flex gap-2">
                                                            {t.clientName && <span>Cliente: {t.clientName}</span>}
                                                            {t.soNumber && <span>O.S. #{t.soNumber}</span>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-[10px] font-bold border-slate-200 bg-white dark:bg-slate-800">
                                                            {t.category || t.costCenterName || 'Geral'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right px-6">
                                                        <div className={`text-sm font-black ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500'}`}>
                                                            {t.type === 'INCOME' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground flex justify-end gap-1 items-center font-bold">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'PAID' ? 'bg-emerald-500' : t.status === 'PENDING' ? (overdue ? 'bg-red-500 animate-pulse' : 'bg-amber-500') : 'bg-slate-300'}`} />
                                                            {t.status === 'PAID' ? 'PAGO' : t.status === 'PENDING' ? (overdue ? 'VENCIDO' : 'PENDENTE') : 'CANCELADO'}
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
