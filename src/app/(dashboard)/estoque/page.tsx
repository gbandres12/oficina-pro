"use client";

import React from 'react';
import {
    Package,
    Search,
    Plus,
    ArrowDown,
    ArrowUp,
    AlertTriangle,
    FileDown,
    MoreHorizontal,
    Box,
    Tag,
    FileUp
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

export default function EstoquePage() {
    const parts = [
        { id: '1', name: 'Óleo Sintético 5W30', sku: 'OL-5W30-001', stock: 45, min: 10, unit: 'L', price: 65.00, status: 'OK' },
        { id: '2', name: 'Pastilha de Freio Dianteira', sku: 'PF-HD-022', stock: 4, min: 8, unit: 'Par', price: 180.00, status: 'LOW' },
        { id: '3', name: 'Filtro de Ar Condicionado', sku: 'FA-AC-105', stock: 12, min: 5, unit: 'Un', price: 45.00, status: 'OK' },
        { id: '4', name: 'Amortecedor Traseiro', sku: 'AM-TS-554', stock: 2, min: 4, unit: 'Un', price: 350.00, status: 'LOW' },
        { id: '5', name: 'Lâmpada LED H7', sku: 'LP-H7-99', stock: 0, min: 6, unit: 'Un', price: 25.00, status: 'OUT' },
    ];

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white text-balance">Estoque de Peças</h1>
                    <p className="text-muted-foreground font-medium">Controle de inventário, reposição e movimentações.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 rounded-xl h-11 px-6 font-bold uppercase text-xs">
                        <FileDown className="w-4 h-4" /> Exportar
                    </Button>
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            className="hidden"
                            accept=".xml"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
                                    loading: 'Processando XML da NF-e...',
                                    success: 'Produtos importados com sucesso!',
                                    error: 'Erro ao processar arquivo'
                                });
                            }}
                        />
                        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 text-primary h-11 px-6 font-bold uppercase text-xs hover:bg-primary/10 transition-colors">
                            <FileUp className="w-4 h-4" /> Importar XML
                        </div>
                    </label>
                    <Button className="gap-2 rounded-xl bg-primary h-11 px-6 font-bold uppercase text-xs shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4" /> Nova Peça
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-xl bg-slate-900 text-white">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="bg-white/10 p-4 rounded-2xl">
                            <Box className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <div className="text-3xl font-black">1.250</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total de Itens</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-2xl">
                            <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <div className="text-3xl font-black">15</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reposição Urgente</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-2xl">
                            <Tag className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <div className="text-3xl font-black">R$ 85k</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Valor em Estoque</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-xl">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg">Catálogo de Peças</CardTitle>
                            <CardDescription>Visualize e gerencie todos os itens do inventário</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input placeholder="Buscar por nome ou SKU..." className="pl-9 h-9 w-[280px] rounded-full text-xs" />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
                                <TableHead className="text-[10px] uppercase font-bold">Produto</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold">SKU</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold">Estoque</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold">Preço Unit.</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold">Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {parts.map((part) => (
                                <TableRow key={part.id} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                    <TableCell>
                                        <div className="text-sm font-bold">{part.name}</div>
                                        <div className="text-[10px] text-muted-foreground font-medium">Unidade: {part.unit}</div>
                                    </TableCell>
                                    <TableCell>
                                        <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-slate-500">
                                            {part.sku}
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-sm font-black">{part.stock}</div>
                                            <Progress value={(part.stock / (part.min * 2)) * 100} className="h-1 w-20" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm font-bold">
                                        R$ {part.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            part.status === 'OK' ? 'secondary' :
                                                part.status === 'LOW' ? 'outline' : 'destructive'
                                        } className={
                                            part.status === 'OK' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                part.status === 'LOW' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : ''
                                        }>
                                            {part.status === 'OK' ? 'Disponível' :
                                                part.status === 'LOW' ? 'Reposição' : 'Esgotado'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                            <MoreHorizontal className="w-4 h-4" />
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
