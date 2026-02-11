"use client";

import React, { useEffect, useState } from 'react';
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
    History,
    Plus,
    Loader2,
    LayoutGrid,
    LayoutList
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { toast } from 'sonner';

interface PatioVehicle {
    id: string;
    number: number;
    vehiclePlate: string;
    vehicleModel: string;
    vehicleBrand: string;
    clientName: string;
    entryDate: string;
    status: string;
    progress: number;
    mechanic: string | null;
    partsStatus: string;
}

export default function GestaoPatioPage() {
    const [vehicles, setVehicles] = useState<PatioVehicle[]>([]);
    const [stats, setStats] = useState({
        totalPatio: 0,
        waitingParts: 0,
        inProgress: 0,
        avgDays: '0.0'
    });
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'kanban'>('list');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/patio/vehicles');
            const data = await response.json();

            if (data.success) {
                setVehicles(data.vehicles);
                setStats(data.stats);
            } else {
                toast.error('Erro ao carregar dados do pátio');
            }
        } catch (error) {
            toast.error('Erro ao conectar com o servidor');
            console.error('Erro ao buscar dados do pátio:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredVehicles = vehicles.filter(v =>
        v.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { label: string; className: string }> = {
            'OPEN': { label: 'ABERTA', className: 'bg-slate-500' },
            'QUOTATION': { label: 'ORÇAMENTO', className: 'bg-purple-500' },
            'APPROVED': { label: 'APROVADA', className: 'bg-green-600' },
            'IN_PROGRESS': { label: 'EM EXECUÇÃO', className: 'bg-blue-600' },
            'WAITING_PARTS': { label: 'AGUARDANDO PEÇAS', className: 'bg-amber-500' },
        };
        return configs[status] || { label: status, className: 'bg-slate-500' };
    };

    const getPartsStatusBadge = (partsStatus: string) => {
        switch (partsStatus) {
            case 'OK':
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 rounded-lg text-[10px] py-1 font-bold">
                    <CheckCircle2 size={12} /> PEÇAS OK
                </Badge>;
            case 'MISSING':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 rounded-lg text-[10px] py-1 font-bold">
                    <AlertCircle size={12} /> AGUARDANDO PEÇAS
                </Badge>;
            case 'ORDERED':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 rounded-lg text-[10px] py-1 font-bold">
                    <Clock size={12} /> EM PEDIDO
                </Badge>;
            default:
                return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 gap-1 rounded-lg text-[10px] py-1 font-bold uppercase">
                    ANALISANDO
                </Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    // Kanban columns
    const kanbanColumns = [
        { id: 'OPEN', title: 'Abertas', statuses: ['OPEN'] },
        { id: 'QUOTATION', title: 'Orçamento', statuses: ['QUOTATION'] },
        { id: 'APPROVED', title: 'Aprovadas', statuses: ['APPROVED'] },
        { id: 'IN_PROGRESS', title: 'Em Execução', statuses: ['IN_PROGRESS'] },
        { id: 'WAITING_PARTS', title: 'Aguardando Peças', statuses: ['WAITING_PARTS'] },
    ];

    const statsData = [
        { label: 'Total no Pátio', value: stats.totalPatio.toString(), sub: 'Veículos hoje', icon: Car, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Aguardando Peças', value: stats.waitingParts.toString(), sub: 'Pendência externa', icon: PackageSearch, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Em Execução', value: stats.inProgress.toString(), sub: 'Produção ativa', icon: Wrench, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Tempo Médio', value: stats.avgDays, sub: 'Dias por O.S.', icon: Timer, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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
                {statsData.map((stat) => (
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
                                <Input
                                    placeholder="Buscar placa..."
                                    className="pl-9 h-11 w-[250px] rounded-xl text-xs font-medium border-slate-200"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'kanban')} className="w-auto">
                                <TabsList className="h-11 rounded-xl">
                                    <TabsTrigger value="list" className="rounded-lg gap-2">
                                        <LayoutList className="w-4 h-4" /> Lista
                                    </TabsTrigger>
                                    <TabsTrigger value="kanban" className="rounded-lg gap-2">
                                        <LayoutGrid className="w-4 h-4" /> Kanban
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-12 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Carregando veículos...</p>
                        </div>
                    ) : view === 'list' ? (
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
                                {filteredVehicles.map((v) => {
                                    const statusConfig = getStatusConfig(v.status);
                                    return (
                                        <TableRow key={v.id} className="group transition-all hover:bg-slate-50 dark:hover:bg-slate-800/80">
                                            <TableCell className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col items-center justify-center w-14 h-9 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                                                        <div className="w-full bg-blue-600 h-1.5 rounded-t-sm" />
                                                        <span className="text-[10px] font-black tracking-tighter leading-none mt-1">{v.vehiclePlate}</span>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black">{v.vehicleBrand} {v.vehicleModel}</div>
                                                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">
                                                            Entrada: {formatDate(v.entryDate)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getPartsStatusBadge(v.partsStatus)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`rounded-full text-[10px] font-bold py-1 px-3 ${statusConfig.className}`}>
                                                    {statusConfig.label}
                                                </Badge>
                                                <div className="text-[10px] text-muted-foreground mt-1 font-bold uppercase truncate max-w-[120px]">
                                                    Técnico: {v.mechanic || 'Pendente'}
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
                                    );
                                })}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-6 overflow-x-auto">
                            <div className="flex gap-4 min-w-max">
                                {kanbanColumns.map((column) => {
                                    const columnVehicles = filteredVehicles.filter(v => column.statuses.includes(v.status));
                                    return (
                                        <div key={column.id} className="flex-shrink-0 w-[300px]">
                                            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-bold text-sm uppercase tracking-wide">{column.title}</h3>
                                                    <Badge variant="secondary" className="rounded-full">
                                                        {columnVehicles.length}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-3">
                                                    {columnVehicles.map((v) => (
                                                        <Card key={v.id} className="hover:shadow-md transition-shadow cursor-move">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <div className="flex flex-col items-center justify-center w-12 h-7 border border-slate-300 rounded text-[9px] font-black">
                                                                        {v.vehiclePlate}
                                                                    </div>
                                                                    <Badge className="text-[9px]">{v.number}</Badge>
                                                                </div>
                                                                <div className="text-sm font-bold mb-1">{v.vehicleBrand} {v.vehicleModel}</div>
                                                                <div className="text-xs text-muted-foreground mb-2">{v.clientName}</div>
                                                                {getPartsStatusBadge(v.partsStatus)}
                                                                <div className="mt-3">
                                                                    <Progress value={v.progress} className="h-1.5" />
                                                                    <div className="text-[9px] text-muted-foreground mt-1">
                                                                        {v.progress}% completo
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                    {columnVehicles.length === 0 && (
                                                        <div className="text-center text-muted-foreground text-sm py-8">
                                                            Nenhum veículo
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
