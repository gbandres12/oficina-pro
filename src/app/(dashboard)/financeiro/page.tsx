"use client";

import React from 'react';
import {
    DollarSign,
    ArrowDownCircle,
    ArrowUpCircle,
    Wallet,
    Download,
    Plus,
    PieChart as PieChartIcon,
    Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function FinanceiroPage() {
    const [selectedTab, setSelectedTab] = React.useState('all');
    const [dateFilter, setDateFilter] = React.useState(new Date().toLocaleDateString('pt-BR'));

    const stats = [
        { label: 'Saldo Atual', value: 'R$ 158.450,00', icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Receitas (Mês)', value: 'R$ 45.200,00', icon: ArrowUpCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Despesas (Mês)', value: 'R$ 12.800,00', icon: ArrowDownCircle, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Lucro Líquido', value: 'R$ 32.400,00', icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];

    const costCenters = [
        { name: 'Operacional', amount: 8500, total: 12000, color: 'bg-blue-500' },
        { name: 'Marketing', amount: 1200, total: 12000, color: 'bg-purple-500' },
        { name: 'RH / Pessoal', amount: 2500, total: 12000, color: 'bg-orange-500' },
        { name: 'Infraestrutura', amount: 600, total: 12000, color: 'bg-emerald-500' },
    ];

    const transactions = [
        { id: '1', date: '09/02/2026', desc: 'Troca de Óleo - Honda Civic', cat: 'Serviços', cc: 'Operacional', type: 'INCOME', val: 350.00, status: 'PAID' },
        { id: '2', date: '08/02/2026', desc: 'Compra de Filtros de Ar', cat: 'Peças', cc: 'Estoque', type: 'EXPENSE', val: 1200.00, status: 'PAID' },
        { id: '3', date: '08/02/2026', desc: 'Aluguel do Galpão', cat: 'Infra', cc: 'Fixo', type: 'EXPENSE', val: 4500.00, status: 'PENDING' },
        { id: '4', date: '07/02/2026', desc: 'Revisão Completa - Corolla', cat: 'Serviços', cc: 'Operacional', type: 'INCOME', val: 1850.00, status: 'PAID' },
        { id: '5', date: '06/02/2026', desc: 'Anúncios Instagram/Meta', cat: 'Marketing', cc: 'Marketing', type: 'EXPENSE', val: 500.00, status: 'PAID' },
    ];

    const filteredTransactions = transactions.filter(t => {
        const matchesTab = selectedTab === 'all' ||
            (selectedTab === 'receitas' && t.type === 'INCOME') ||
            (selectedTab === 'despesas' && t.type === 'EXPENSE') ||
            (selectedTab === 'pendentes' && t.status === 'PENDING');

        const matchesDate = !dateFilter || t.date === dateFilter;

        return matchesTab && matchesDate;
    });

    const handleExport = () => {
        toast.success('Exportação iniciada. O arquivo será disponibilizado em instantes.');
    };

    const handleNewEntry = () => {
        toast.info('Formulário de novo lançamento financeiro em desenvolvimento.');
    };

    const handleCostCenterDetails = () => {
        toast.message('Detalhamento de centros de custos será liberado na próxima versão.');
    };

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Gestão Financeira</h1>
                    <p className="text-muted-foreground font-medium">Fluxo de caixa, centros de custos e conciliação.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-border/50 shadow-sm">
                        <Input
                            type="text"
                            placeholder="DD/MM/AAAA"
                            className="h-8 w-32 border-none bg-transparent text-xs font-bold text-center"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-[10px] font-bold uppercase"
                            onClick={() => setDateFilter(new Date().toLocaleDateString('pt-BR'))}
                        >
                            Hoje
                        </Button>
                    </div>
                    <Button variant="outline" className="gap-2 rounded-xl h-11 px-6 font-bold uppercase text-xs" onClick={handleExport}>
                        <Download className="w-4 h-4" /> Exportar
                    </Button>
                    <Button className="gap-2 rounded-xl bg-primary h-11 px-6 font-bold uppercase text-xs shadow-lg shadow-primary/20" onClick={handleNewEntry}>
                        <Plus className="w-4 h-4" /> Novo Lançamento
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none dark:border transition-all">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="text-2xl font-black">{stat.value}</div>
                                <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-[10px] mt-1">{stat.label}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedTab}>
                <div className="flex items-center justify-between mb-4">
                    <TabsList className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-border/50 shadow-sm h-12">
                        <TabsTrigger value="all" className="rounded-lg font-bold text-xs uppercase px-6">Geral</TabsTrigger>
                        <TabsTrigger value="receitas" className="rounded-lg font-bold text-xs uppercase px-6">Receitas</TabsTrigger>
                        <TabsTrigger value="despesas" className="rounded-lg font-bold text-xs uppercase px-6">Despesas</TabsTrigger>
                        <TabsTrigger value="pendentes" className="rounded-lg font-bold text-xs uppercase px-6 text-amber-600">Pendentes</TabsTrigger>
                    </TabsList>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-1 border-none shadow-xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Centros de Custos</CardTitle>
                                    <CardDescription>Distribuição de gastos do mês</CardDescription>
                                </div>
                                <PieChartIcon className="w-5 h-5 text-primary/50" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {costCenters.map((cc) => (
                                <div key={cc.name} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold">{cc.name}</span>
                                        <span className="text-muted-foreground">R$ {cc.amount.toLocaleString('pt-BR')}</span>
                                    </div>
                                    <Progress value={(cc.amount / cc.total) * 100} className="h-2" />
                                    <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold">
                                        <span>{((cc.amount / cc.total) * 100).toFixed(1)}% do total</span>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full text-xs font-bold text-primary hover:bg-primary/5 uppercase tracking-widest" onClick={handleCostCenterDetails}>
                                Detalhar Centros de Custos →
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 border-none shadow-xl overflow-hidden">
                        <CardHeader className="pb-0">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-lg">Extrato Detalhado</CardTitle>
                                    <CardDescription>Lançamentos para {dateFilter || "todo o período"}</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <Input placeholder="Buscar transação..." className="pl-9 h-9 w-[200px] rounded-full text-xs" />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {filteredTransactions.length === 0 ? (
                                <div className="p-20 text-center opacity-20">
                                    <DollarSign className="w-12 h-12 mx-auto mb-4" />
                                    <p className="font-black uppercase tracking-widest">Nenhuma movimentação encontrada</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
                                            <TableHead className="text-[10px] uppercase font-bold px-6">Data</TableHead>
                                            <TableHead className="text-[10px] uppercase font-bold">Descrição</TableHead>
                                            <TableHead className="text-[10px] uppercase font-bold">C. Custo</TableHead>
                                            <TableHead className="text-[10px] uppercase font-bold text-right px-6">Valor</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTransactions.map((t) => (
                                            <TableRow key={t.id} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                                <TableCell className="text-xs px-6 font-medium">{t.date}</TableCell>
                                                <TableCell>
                                                    <div className="text-sm font-bold">{t.desc}</div>
                                                    <div className="text-[10px] text-muted-foreground uppercase font-bold">{t.cat}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-[10px] font-bold border-slate-200 bg-white dark:bg-slate-800">
                                                        {t.cc}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right px-6">
                                                    <div className={`text-sm font-black ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500'}`}>
                                                        {t.type === 'INCOME' ? '+' : '-'} R$ {t.val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground flex justify-end gap-1 items-center font-bold">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'PAID' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                        {t.status === 'PAID' ? 'PAGO' : 'PENDENTE'}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
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
