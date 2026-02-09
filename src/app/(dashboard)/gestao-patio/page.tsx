"use client";

import React from 'react';
import {
    Car,
    Wrench,
    Clock,
    AlertCircle,
    CheckCircle2,
    Search,
    Filter,
    ArrowUpRight,
    PackageSearch,
    Timer,
    History
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export default function GestaoPatioPage() {
    // Simulando dados que viriam do Prisma
    const patioData = [
        { id: '1', plate: 'BRA-2E19', model: 'Honda Civic G10', entry: '08/02 09:15', status: 'IN_PROGRESS', parts: 'OK', progress: 75, technician: 'Marcos Oliveira' },
        { id: '2', plate: 'KLA-4455', model: 'Toyota Corolla Hybrid', entry: '09/02 10:30', status: 'WAITING_PARTS', parts: 'MISSING', progress: 15, technician: 'Gabriel Andres' },
        { id: '3', plate: 'OJH-9088', model: 'VW Golf GTI', entry: '07/02 14:00', status: 'APPROVED', parts: 'ORDERED', progress: 5, technician: 'Pendante' },
        { id: '4', plate: 'NXX-1122', model: 'Jeep Compass', entry: '09/02 08:00', status: 'QUOTATION', parts: 'ANALYZING', progress: 0, technician: 'Ricardo' },
        { id: '5', plate: 'PLM-7711', model: 'BMW 320i', entry: '05/02 11:20', status: 'FINISHED', parts: 'OK', progress: 100, technician: 'Marcos Oliveira' },
    ];

    const stats = [
        { label: 'Total no Pátio', value: '14', sub: 'Veículos hoje', icon: Car, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Aguardando Peças', value: '4', sub: 'Pendência externa', icon: PackageSearch, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Em Execução', value: '6', sub: 'Produção ativa', icon: Wrench, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Tempo Médio', value: '2.4', sub: 'Dias por O.S.', icon: Timer, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
                        Gestão de Pátio <span className="text-primary not-italic">ANDRES</span>
                    </h1>
                    <p className="text-muted-foreground font-medium">Controle de fluxo de veículos, peças e produtividade.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 rounded-xl h-11 px-6 font-bold uppercase text-xs">
                        <History className="w-4 h-4" /> Histórico
                    </Button>
                    <Button className="gap-2 rounded-xl bg-primary h-11 px-6 font-bold uppercase text-xs shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4" /> Nova Entrada (Checklist)
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none dark:border transition-all hover:scale-[1.02] cursor-default">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <Badge variant="outline" className="text-[10px] font-bold border-slate-200">{stat.sub}</Badge>
                            </div>
                            <div className="mt-4">
                                <div className="text-3xl font-black">{stat.value}</div>
                                <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-[10px] mt-1">{stat.label}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-2xl overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-6 px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Car className="w-6 h-6 text-primary" />
                                Veículos em Circulação
                            </CardTitle>
                            <CardDescription>Acompanhe o status e a necessidade de peças de cada O.S.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input placeholder="Buscar placa..." className="pl-9 h-11 w-[250px] rounded-xl text-xs font-medium border-slate-200" />
                            </div>
                            <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl">
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 hover:bg-transparent">
                                <TableHead className="text-[10px] uppercase font-bold px-8 h-12">Veículo</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold h-12">Status de Peças</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold h-12">Etapa Técnica</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold h-12">Produção</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold text-right px-8 h-12">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patioData.map((v) => (
                                <TableRow key={v.id} className="group transition-all hover:bg-slate-50 dark:hover:bg-slate-800/80">
                                    <TableCell className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-center justify-center w-14 h-9 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                                                <div className="w-full bg-blue-600 h-1.5 rounded-t-sm" />
                                                <span className="text-[10px] font-black tracking-tighter leading-none mt-1">{v.plate}</span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-black">{v.model}</div>
                                                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">Entrada: {v.entry}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {v.parts === 'OK' ? (
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 rounded-lg text-[10px] py-1 font-bold">
                                                    <CheckCircle2 size={12} /> PEÇAS OK
                                                </Badge>
                                            ) : v.parts === 'MISSING' ? (
                                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 rounded-lg text-[10px] py-1 font-bold">
                                                    <AlertCircle size={12} /> AGUARDANDO PEÇAS
                                                </Badge>
                                            ) : v.parts === 'ORDERED' ? (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 rounded-lg text-[10px] py-1 font-bold">
                                                    <Clock size={12} /> EM PEDIDO
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 gap-1 rounded-lg text-[10px] py-1 font-bold uppercase">
                                                    Analisando
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`
                                            rounded-full text-[10px] font-bold py-1 px-3
                                            ${v.status === 'IN_PROGRESS' ? 'bg-blue-600' :
                                                v.status === 'WAITING_PARTS' ? 'bg-amber-500' :
                                                    v.status === 'FINISHED' ? 'bg-emerald-600' : 'bg-slate-500'}
                                        `}>
                                            {v.status}
                                        </Badge>
                                        <div className="text-[10px] text-muted-foreground mt-1 font-bold uppercase truncate max-w-[120px]">
                                            Técnico: {v.technician}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="w-32 space-y-1.5">
                                            <div className="flex justify-between text-[9px] font-black text-muted-foreground">
                                                <span>PRODUÇÃO</span>
                                                <span>{v.progress}%</span>
                                            </div>
                                            <Progress value={v.progress} className="h-1.5" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <Button variant="ghost" size="sm" className="rounded-xl font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all h-9">
                                            Detalhes <ArrowUpRight className="ml-1 w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function Plus(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
