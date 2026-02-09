"use client";

import React from 'react';
import {
    Car,
    Search,
    Plus,
    Settings,
    History,
    ShieldCheck,
    Fuel,
    Gauge,
    Calendar,
    MoreVertical,
    ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function VeiculosPage() {
    const vehicles = [
        { id: '1', plate: 'BRA-2E19', model: 'Honda Civic Touring', color: 'Branco', owner: 'João Silva', km: '45.000', status: 'IN_SERVICE' },
        { id: '2', plate: 'ABC-1234', model: 'VW Golf GTI', color: 'Preto', owner: 'Pedro Costa', km: '82.000', status: 'READY' },
        { id: '3', plate: 'XYZ-9876', model: 'Toyota Corolla Hybrid', color: 'Prata', owner: 'Maria Santos', km: '12.500', status: 'OUTSIDE' },
        { id: '4', plate: 'KJM-4455', model: 'Jeep Compass S', color: 'Azul', owner: 'Ana Oliveira', km: '31.000', status: 'IN_SERVICE' },
        { id: '5', plate: 'OFF-0000', model: 'Ford Ranger Raptor', color: 'Cinza', owner: 'Carlos Ferreira', km: '5.000', status: 'READY' },
    ];

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Gerenciamento de Veículos</h1>
                    <p className="text-muted-foreground font-medium">Frota ativa, histórico técnico e especificações por placa.</p>
                </div>
                <Button className="gap-2 rounded-xl bg-primary shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" /> Vincular Veículo
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-1 border-none shadow-xl bg-gradient-to-br from-slate-800 to-slate-950 text-white overflow-hidden relative">
                    <div className="absolute -right-8 -bottom-8 opacity-10">
                        <Car size={200} />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-lg">Filtro Rápido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Placa do Veículo</label>
                            <Input placeholder="Digitar placa..." className="bg-white/10 border-white/10 text-white placeholder:text-white/30" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Proprietário</label>
                            <Input placeholder="Nome do cliente..." className="bg-white/10 border-white/10 text-white placeholder:text-white/30" />
                        </div>
                        <Button className="w-full bg-white text-slate-950 hover:bg-slate-200 mt-2 font-bold uppercase text-[10px] tracking-widest">
                            Buscar Veículo
                        </Button>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-none shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-lg">Listagem de Frota</CardTitle>
                            <CardDescription>Veículos cadastrados no sistema</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
                                    <TableHead className="text-[10px] uppercase font-bold">Placa</TableHead>
                                    <TableHead className="text-[10px] uppercase font-bold">Veículo / Detalhes</TableHead>
                                    <TableHead className="text-[10px] uppercase font-bold">Proprietário</TableHead>
                                    <TableHead className="text-[10px] uppercase font-bold">Status</TableHead>
                                    <TableHead className="w-[100px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vehicles.map((v) => (
                                    <TableRow key={v.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                        <TableCell>
                                            <div className="w-20 h-8 border-2 border-slate-900 dark:border-white rounded-md flex items-center justify-center font-bold text-xs bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                                <div className="absolute top-0 w-full h-1.5 bg-blue-600" />
                                                {v.plate}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-black">{v.model}</div>
                                            <div className="flex gap-2 text-[10px] text-muted-foreground font-bold uppercase">
                                                <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {v.km} km</span>
                                                <span className="flex items-center gap-1"><Fuel className="w-3 h-3" /> {v.color}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium">{v.owner}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                v.status === 'IN_SERVICE' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                                                    v.status === 'READY' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'text-slate-400'
                                            }>
                                                {v.status === 'IN_SERVICE' ? 'Em Manutenção' :
                                                    v.status === 'READY' ? 'Pronto / Liberado' : 'Fora da Oficina'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <History className="w-4 h-4 text-slate-400" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <ExternalLink className="w-4 h-4 text-slate-400" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
