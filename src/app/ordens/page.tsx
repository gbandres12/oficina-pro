"use client";

import React from 'react';
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
    Kanban
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function OrdensPage() {
    const osList = [
        { id: '1', number: '2026-001', customer: 'João Silva', vehicle: 'Honda Civic (BRA-2E19)', status: 'IN_PROGRESS', technician: 'Wilson', date: '09/02', priority: 'HIGH' },
        { id: '2', number: '2026-002', customer: 'Maria Santos', vehicle: 'Toyota Corolla (XYZ-9876)', status: 'WAITING_PARTS', technician: 'Wilson', date: '08/02', priority: 'MEDIUM' },
        { id: '3', number: '2026-003', customer: 'Pedro Costa', vehicle: 'VW Golf (ABC-1234)', status: 'FINISHED', technician: 'Ricardo', date: '08/02', priority: 'LOW' },
        { id: '4', number: '2026-004', customer: 'Ana Oliveira', vehicle: 'Jeep Compass (KJM-4455)', status: 'OPEN', technician: '-', date: '09/02', priority: 'MEDIUM' },
    ];

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Ordens de Serviço</h1>
                    <p className="text-muted-foreground font-medium">Controle de fluxo de trabalho e produtividade da bancada.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 rounded-xl">
                        <Kanban className="w-4 h-4" /> Visualizar Kanban
                    </Button>
                    <Button className="gap-2 rounded-xl bg-primary shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4" /> Abrir Nova O.S.
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center">
                    <div className="text-2xl font-black">24</div>
                    <div className="text-[10px] font-bold uppercase text-muted-foreground">Abertas</div>
                </div>
                <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 flex flex-col items-center justify-center text-center">
                    <div className="text-2xl font-black text-blue-600">08</div>
                    <div className="text-[10px] font-bold uppercase text-blue-600">Em Execução</div>
                </div>
                <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 flex flex-col items-center justify-center text-center">
                    <div className="text-2xl font-black text-amber-600">03</div>
                    <div className="text-[10px] font-bold uppercase text-amber-600">Aguardando Peças</div>
                </div>
                <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 flex flex-col items-center justify-center text-center">
                    <div className="text-2xl font-black text-emerald-600">12</div>
                    <div className="text-[10px] font-bold uppercase text-emerald-600">Finalizadas (Hoje)</div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Buscar O.S., Cliente ou Placa..." className="pl-10 h-11 rounded-xl shadow-sm border-none bg-white dark:bg-slate-900" />
                    </div>
                    <Button variant="outline" className="h-11 rounded-xl px-6">Filtrar</Button>
                </div>

                <div className="grid gap-4">
                    {osList.map((os) => (
                        <Card key={os.id} className="group border-none shadow-xl hover:shadow-2xl transition-all overflow-hidden p-0">
                            <div className="flex flex-col md:flex-row items-stretch">
                                <div className={`w-2 md:w-3 ${os.priority === 'HIGH' ? 'bg-red-500' :
                                        os.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'
                                    }`} />
                                <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                            <Wrench className="w-6 h-6 text-slate-500" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-black tracking-tight">O.S. #{os.number}</span>
                                                <Badge variant="outline" className={`text-[10px] font-black ${os.status === 'FINISHED' ? 'bg-emerald-500/10 text-emerald-600' :
                                                        os.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-600' : 'bg-slate-100'
                                                    }`}>
                                                    {os.status === 'FINISHED' ? 'CONCLUÍDA' :
                                                        os.status === 'IN_PROGRESS' ? 'EXECUTANDO' :
                                                            os.status === 'WAITING_PARTS' ? 'PENDENTE PEÇAS' : 'ABERTA'}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-col md:flex-row md:items-center gap-x-6 gap-y-1 mt-2">
                                                <div className="flex items-center gap-1.5 text-sm font-medium">
                                                    <User className="w-3.5 h-3.5 text-muted-foreground" /> {os.customer}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-sm font-medium">
                                                    <Car className="w-3.5 h-3.5 text-muted-foreground" /> {os.vehicle}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Técnico</div>
                                            <div className="text-sm font-bold flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px]">
                                                    {os.technician.charAt(0)}
                                                </div>
                                                {os.technician}
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Entrada</div>
                                            <div className="text-sm font-bold flex items-center justify-end gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" /> {os.date}
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-10 w-10">
                                            <MoreVertical className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
