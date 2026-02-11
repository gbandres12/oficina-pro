"use client";

import React from 'react';
import {
    Activity,
    ArrowUpRight,
    Car,
    CheckCircle2,
    Clock3,
    FileStack,
    ShieldCheck,
    TrendingUp,
    Upload,
    Wrench,
} from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ChecklistInteligente from '@/components/checklist/ChecklistInteligente';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const faturamentoData = [
    { week: 'Sem 1', value: 18500 },
    { week: 'Sem 2', value: 22300 },
    { week: 'Sem 3', value: 19800 },
    { week: 'Sem 4', value: 25600 },
];

const statusData = [
    { status: 'Abertas', total: 12 },
    { status: 'Em execução', total: 8 },
    { status: 'Aguardando peças', total: 4 },
    { status: 'Finalizadas', total: 26 },
];

const slaData = [
    { label: '<24h', total: 14 },
    { label: '24-48h', total: 10 },
    { label: '>48h', total: 5 },
];

const chartConfig = {
    value: { label: 'Faturamento', color: '#111111' },
    total: { label: 'Ordens', color: '#262626' },
};

export default function DashboardPage() {
    const [view, setView] = React.useState<'dashboard' | 'checklist'>('dashboard');

    if (view === 'checklist') {
        return (
            <div className="p-6">
                <Button variant="outline" onClick={() => setView('dashboard')} className="mb-4">
                    Voltar ao painel
                </Button>
                <ChecklistInteligente />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <section className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row gap-6 justify-between">
                <div className="space-y-3">
                    <Badge variant="outline" className="rounded-full border-zinc-400">Operação em tempo real</Badge>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard avançada da oficina</h1>
                    <p className="text-zinc-600 dark:text-zinc-300 max-w-2xl">
                        Visão consolidada de performance, segurança operacional e importações de estoque em um fluxo único.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                        <Button className="rounded-xl bg-black hover:bg-zinc-800 text-white" onClick={() => setView('checklist')}>
                            <ShieldCheck className="w-4 h-4 mr-2" /> Checklist inteligente
                        </Button>
                        <Button variant="outline" className="rounded-xl" onClick={() => toast.info('Relatório avançado em geração')}>
                            <FileStack className="w-4 h-4 mr-2" /> Gerar relatório
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 min-w-[280px]">
                    <KpiCard icon={Car} label="Veículos ativos" value="29" delta="+8%" />
                    <KpiCard icon={Wrench} label="O.S. do dia" value="11" delta="+2" />
                    <KpiCard icon={TrendingUp} label="Ticket médio" value="R$ 1.140" delta="+12%" />
                    <KpiCard icon={Clock3} label="SLA cumprido" value="92%" delta="+4%" />
                </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="xl:col-span-2 border-zinc-300 dark:border-zinc-800 shadow-none">
                    <CardHeader>
                        <CardTitle>Evolução de faturamento mensal</CardTitle>
                        <CardDescription>Comparativo por semana (preto e branco para leitura rápida).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[260px] w-full">
                            <AreaChart data={faturamentoData} margin={{ left: 12, right: 12 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Area type="monotone" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.15} strokeWidth={2} />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="border-zinc-300 dark:border-zinc-800 shadow-none">
                    <CardHeader>
                        <CardTitle>Fila operacional</CardTitle>
                        <CardDescription>Prioridades para as próximas 6 horas.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { title: 'Corolla 2021', step: 'Aguardando validação de peças', priority: 'Alta' },
                            { title: 'Fiat Toro', step: 'Inspeção final de qualidade', priority: 'Média' },
                            { title: 'Civic Touring', step: 'Troca de conjunto de freio', priority: 'Alta' },
                        ].map((item) => (
                            <div key={item.title} className="rounded-xl border border-zinc-300 dark:border-zinc-700 p-3">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="font-semibold text-sm">{item.title}</p>
                                    <Badge variant="outline" className="text-[10px] uppercase">{item.priority}</Badge>
                                </div>
                                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">{item.step}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-zinc-300 dark:border-zinc-800 shadow-none">
                    <CardHeader>
                        <CardTitle>Status das ordens</CardTitle>
                        <CardDescription>Distribuição atual para planejamento da equipe.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[220px] w-full">
                            <BarChart data={statusData} margin={{ left: 8, right: 8 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="status" tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="total" fill="var(--color-total)" radius={6} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="border-zinc-300 dark:border-zinc-800 shadow-none">
                    <CardHeader>
                        <CardTitle>Segurança e qualidade</CardTitle>
                        <CardDescription>Checklist, SLA e importações monitoradas em tempo real.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {slaData.map((item) => (
                            <div key={item.label} className="flex items-center justify-between border border-zinc-300 dark:border-zinc-700 rounded-xl p-3">
                                <span className="text-sm font-medium">Tempo de execução {item.label}</span>
                                <span className="text-sm font-bold">{item.total} ordens</span>
                            </div>
                        ))}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Button variant="outline" className="rounded-xl" onClick={() => toast.success('Importador XML pronto para uso')}>
                                <Upload className="w-4 h-4 mr-2" /> Importar XML
                            </Button>
                            <Button variant="outline" className="rounded-xl" onClick={() => toast.info('Monitor de risco atualizado')}>
                                <Activity className="w-4 h-4 mr-2" /> Saúde da operação
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-zinc-300 dark:border-zinc-800 shadow-none">
                    <CardContent className="p-4 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold">Integridade de dados</p>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">Importações executadas em transação para evitar inconsistência.</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-zinc-300 dark:border-zinc-800 shadow-none">
                    <CardContent className="p-4 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold">Segurança ativa</p>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">Validação de payload, IDs robustos e diagnósticos restritos a admin.</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-zinc-300 dark:border-zinc-800 shadow-none">
                    <CardContent className="p-4 flex items-start gap-3">
                        <ArrowUpRight className="w-5 h-5 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold">Próximo passo</p>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">Automatizar previsões de demanda por histórico de OS e estoque.</p>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}

function KpiCard({
    icon: Icon,
    label,
    value,
    delta,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    delta: string;
}) {
    return (
        <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-300 dark:border-zinc-800">
            <div className="flex items-center justify-between">
                <Icon className="w-4 h-4 text-zinc-700 dark:text-zinc-200" />
                <span className="text-[10px] font-semibold text-zinc-500">{delta}</span>
            </div>
            <p className="text-xl font-black mt-3">{value}</p>
            <p className="text-[11px] text-zinc-500 mt-1">{label}</p>
        </div>
    );
}
