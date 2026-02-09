"use client";

import React from 'react';
import {
    Car,
    TrendingUp,
    Clock,
    AlertTriangle,
    CheckCircle2,
    ArrowUpRight,
    FileBox,
    Upload,
    Calendar,
    ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ChecklistInteligente from '@/components/checklist/ChecklistInteligente';
import { toast } from 'sonner';

export default function DashboardPage() {
    const [view, setView] = React.useState<'dashboard' | 'checklist'>('dashboard');

    const stats = [
        { label: 'Carros na Oficina', value: '12', icon: Car, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Faturamento Mês', value: 'R$ 45.200', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'O.S. Pendentes', value: '7', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Alertas Estoque', value: '3', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    ];

    const activeOrders = [
        { plate: 'ABC-1234', model: 'Honda Civic', customer: 'João Silva', status: 'IN_PROGRESS', progress: 65 },
        { plate: 'XYZ-9876', model: 'Toyota Corolla', customer: 'Maria Santos', status: 'WAITING_PARTS', progress: 30 },
        { plate: 'KJM-4455', model: 'VW Golf', customer: 'Pedro Costa', status: 'APPROVED', progress: 10 },
    ];

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
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Dashboard Central</h1>
                    <p className="text-muted-foreground font-medium">Bem-vindo, Gabriel. Veja o que está acontecendo hoje.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 rounded-xl" onClick={() => toast.info("Funcionalidade em desenvolvimento")}>
                        <Calendar className="w-4 h-4" /> Relatórios
                    </Button>
                    <Button className="gap-2 rounded-xl bg-primary shadow-lg shadow-primary/20" onClick={() => setView('checklist')}>
                        <Upload className="w-4 h-4" /> Novo Checklist
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none dark:border transition-all hover:scale-[1.02]">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 bg-emerald-50/50">+12%</Badge>
                            </div>
                            <div className="mt-4">
                                <div className="text-2xl font-black">{stat.value}</div>
                                <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-[10px] mt-1">{stat.label}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Orders List */}
                <Card className="lg:col-span-2 border-none shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Fluxo da Oficina</CardTitle>
                            <CardDescription>Monitoramento em tempo real de veículos</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="text-primary font-bold">Ver Todos <ChevronRight className="w-4 h-4" /></Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {activeOrders.map((order) => (
                                <div key={order.plate} className="flex items-center justify-between p-4 rounded-2xl border bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 transition-all border-transparent hover:border-slate-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center font-bold border shadow-sm">
                                            {order.plate.split('-')[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold">{order.model}</div>
                                            <div className="text-xs text-muted-foreground font-medium">{order.customer} • {order.plate}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="hidden md:block w-32 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${order.progress}%` }} />
                                        </div>
                                        <Badge className={
                                            order.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                                                order.status === 'WAITING_PARTS' ? 'bg-amber-500' : 'bg-emerald-500'
                                        }>
                                            {order.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Import XML & Quick Actions */}
                <div className="space-y-6">
                    <Card className="border-none shadow-xl bg-indigo-600 text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 text-white/10 group-hover:scale-150 transition-transform duration-700">
                            <FileBox size={120} />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-lg">Importar NF de Peças</CardTitle>
                            <CardDescription className="text-indigo-100">Atualize seu estoque enviando o XML do fornecedor</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border-2 border-dashed border-indigo-400/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 bg-indigo-500/20 backdrop-blur-sm">
                                <Upload className="w-10 h-10 text-indigo-200" />
                                <div className="text-sm font-medium">Arraste o XML aqui ou clique para selecionar</div>
                                <Button variant="secondary" className="w-full font-bold shadow-lg" onClick={() => toast.success("Processando XML do fornecedor...")}>
                                    Selecionar Arquivo
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-lg">Próximos Agendamentos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex gap-3 items-center">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-center min-w-[50px]">
                                        <div className="text-[10px] font-bold text-muted-foreground">FEV</div>
                                        <div className="text-lg font-black leading-none">10</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">Revisão de 50.000km</div>
                                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest text-[#94a3b8]">Corolla • Pedro H.</div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
