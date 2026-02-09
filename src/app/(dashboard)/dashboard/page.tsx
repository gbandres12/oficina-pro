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
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ChecklistInteligente from '@/components/checklist/ChecklistInteligente';
import { toast } from 'sonner';

export default function DashboardPage() {
    const router = useRouter();
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
                {/* Dashboard Alerts / Call to Action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-amber-500 text-white border-none shadow-lg">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">Atenção ao Pátio</div>
                                    <div className="text-xs text-amber-50">4 veículos aguardando peças externas.</div>
                                </div>
                            </div>
                            <Button variant="ghost" className="text-white hover:bg-white/10 font-bold text-xs" onClick={() => router.push('/gestao-patio')}>
                                GERENCIAR <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="bg-primary text-white border-none shadow-lg">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">Resumo do Financeiro</div>
                                    <div className="text-xs text-primary-foreground/80">R$ 32.400 de lucro líquido este mês.</div>
                                </div>
                            </div>
                            <Button variant="ghost" className="text-white hover:bg-white/10 font-bold text-xs" onClick={() => router.push('/financeiro')}>
                                VER FLUXO <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Active Orders List */}
                <Card className="border-none shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-6">
                        <div>
                            <CardTitle className="text-xl font-black">OPERAÇÃO EM TEMPO REAL</CardTitle>
                            <CardDescription>Fluxo de veículos e gargalos de peças</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="font-bold border-primary text-primary rounded-xl" onClick={() => router.push('/gestao-patio')}>
                            GESTÃO DE PÁTIO INTEGRADA <ChevronRight className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {[
                                { plate: 'BRA-2E19', model: 'Honda Civic G10', customer: 'João Silva', status: 'IN_PROGRESS', progress: 75, parts: 'OK' },
                                { plate: 'KLA-4455', model: 'Toyota Corolla Hybrid', customer: 'Maria Santos', status: 'WAITING_PARTS', progress: 15, parts: 'FALTANDO' },
                                { plate: 'OJH-9088', model: 'VW Golf GTI', customer: 'Pedro Costa', status: 'APPROVED', progress: 5, parts: 'PEDIDO' },
                            ].map((order) => (
                                <div key={order.plate} className="flex items-center justify-between p-5 rounded-2xl border bg-slate-50/30 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 transition-all border-transparent hover:border-slate-200 hover:shadow-md">
                                    <div className="flex items-center gap-5">
                                        <div className="flex flex-col items-center justify-center w-14 h-9 border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg">
                                            <div className="w-full bg-blue-600 h-1 rounded-t-sm" />
                                            <span className="text-[10px] font-black tracking-tighter mt-1">{order.plate}</span>
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{order.model}</div>
                                            <div className="text-[10px] text-muted-foreground font-bold">{order.customer}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="hidden lg:flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Peças:</span>
                                                <Badge variant="outline" className={`text-[9px] font-black border-none py-0 px-2 h-5 flex items-center ${order.parts === 'OK' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                                    }`}>
                                                    {order.parts}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="hidden md:block w-32 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${order.progress}%` }} />
                                        </div>
                                        <Badge className={`
                                        rounded-lg text-[10px] font-black py-1 px-4
                                        ${order.status === 'IN_PROGRESS' ? 'bg-blue-600' :
                                                order.status === 'WAITING_PARTS' ? 'bg-amber-500' : 'bg-emerald-600'}
                                    `}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Import XML Section */}
                    <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:scale-150 transition-transform duration-700">
                            <FileBox size={140} />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-xl font-black italic">IMPORTAÇÃO DE XML <span className="text-primary not-italic">PEÇAS</span></CardTitle>
                            <CardDescription className="text-slate-400">Automatize a entrada de nota fiscal diretamente no seu estoque</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-4 bg-white/5 backdrop-blur-sm">
                                <Upload className="w-12 h-12 text-primary animate-bounce" />
                                <div className="text-sm font-bold text-slate-300">Solte o arquivo XML aqui</div>
                                <Button variant="default" className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-12 rounded-xl" onClick={() => toast.success("Processando XML...")}>
                                    SELECIONAR ARQUIVO
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
