"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Eye, FileUp, Plus, History, DollarSign, Archive, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// Componentes do Legado
import { CreateLegacyOrderDialog } from './CreateLegacyOrderDialog';
import { ImportLegacyCSVDialog } from './ImportLegacyCSVDialog';

interface LegacyOrder {
    id: string;
    number: string;
    status: string;
    entryDate: string;
    clientName: string;
    vehiclePlate: string;
    totalValue: string;
    paidValue: string;
    pendingValue: string;
    observations: string | null;
}

export function LegacyOrderList() {
    const [orders, setOrders] = useState<LegacyOrder[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [pendingFilter, setPendingFilter] = useState('ALL'); // ALL, YES, NO

    // Dialogs
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<LegacyOrder | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/service-orders/legacy');
            const data = await res.json();
            if (data.success) {
                setOrders(data.orders);
            } else {
                toast.error('Erro ao carregar histórico legado');
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro de conexão ao carregar histórico');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const formatCurrency = (val: string | number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    // Aplicar Filtros
    let filteredOrders = orders.filter(o => {
        if (searchTerm) {
            const l = searchTerm.toLowerCase();
            if (
                !(o.clientName?.toLowerCase().includes(l)) &&
                !(o.vehiclePlate?.toLowerCase().includes(l)) &&
                !(o.number?.toLowerCase().includes(l))
            ) return false;
        }

        if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;

        const isPending = Number(o.pendingValue) > 0;
        if (pendingFilter === 'YES' && !isPending) return false;
        if (pendingFilter === 'NO' && isPending) return false;

        return true;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'OPEN': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Aberta</Badge>;
            case 'IN_PROGRESS': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Em Execução</Badge>;
            case 'WAITING_PARTS': return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Aguardando Peças</Badge>;
            case 'FINISHED': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Finalizada</Badge>;
            case 'CANCELLED': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelada</Badge>;
            case 'QUOTATION': return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Orçamento</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <History className="w-6 h-6 text-slate-500" />
                        Histórico do Sistema Antigo
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Consulta de Ordens de Serviço migradas da planilha.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsImportOpen(true)} className="h-11 rounded-xl gap-2 font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <FileUp className="w-4 h-4" /> Importar CSV
                    </Button>
                    <Button onClick={() => setIsCreateOpen(true)} className="h-11 rounded-xl gap-2 font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-950/20 border-b-4 border-slate-950 active:scale-95 transition-all">
                        <Plus className="w-5 h-5" /> Nova O.S. Antiga
                    </Button>
                </div>
            </div>

            {/* Filtros */}
            <Card className="shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative group md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Buscar por placa, cliente ou número..."
                            className="pl-10 h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="ALL">Todos os status</SelectItem>
                            <SelectItem value="OPEN">Aberta</SelectItem>
                            <SelectItem value="FINISHED">Finalizada</SelectItem>
                            <SelectItem value="CANCELLED">Cancelada</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={pendingFilter} onValueChange={setPendingFilter}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                            <SelectValue placeholder="Pendente?" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="ALL">Todos os saldos</SelectItem>
                            <SelectItem value="YES">Com Pendência</SelectItem>
                            <SelectItem value="NO">Quitadas</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Lista */}
            <Card className="shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mb-4" />
                            <p className="font-medium text-sm">Buscando legado...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 text-muted-foreground">
                            <Archive className="w-12 h-12 opacity-20 mb-4" />
                            <p className="font-bold text-lg text-slate-800 dark:text-slate-200">Nenhum registro encontrado</p>
                            <p className="text-sm">Ajuste os filtros ou importe sua planilha de histórico.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Nº OS / Placa</th>
                                    <th className="px-6 py-4">Cliente</th>
                                    <th className="px-6 py-4">Data</th>
                                    <th className="px-6 py-4 text-right">Valor Total</th>
                                    <th className="px-6 py-4 text-right">Pendente</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredOrders.map(order => {
                                    const pendente = Number(order.pendingValue) > 0;
                                    return (
                                        <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 dark:text-white">#{order.number}</div>
                                                <Badge variant="secondary" className="mt-1 text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase tracking-widest">{order.vehiclePlate}</Badge>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                                                {order.clientName}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {formatDate(order.entryDate)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                                                {formatCurrency(order.totalValue)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {pendente ? (
                                                    <span className="font-bold text-red-600 block bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded inline-block">
                                                        {formatCurrency(order.pendingValue)}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 font-medium text-xs uppercase tracking-widest">Quitado</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 items-start">
                                                    {getStatusBadge(order.status)}
                                                    <Badge className="bg-slate-800 text-white text-[9px] uppercase tracking-widest px-1 py-0 shadow-none">Legado</Badge>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-bold">
                                                    Detalhes <Eye className="w-4 h-4 ml-2" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>

            {/* Modais */}
            <CreateLegacyOrderDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={fetchOrders} />
            <ImportLegacyCSVDialog open={isImportOpen} onOpenChange={setIsImportOpen} onSuccess={fetchOrders} />

            {/* Modal de Detalhes */}
            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="sm:max-w-[500px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black flex items-center gap-2">
                            Detalhes da OS Legada #{selectedOrder?.number}
                            <Badge className="bg-slate-800 shadow-none text-white text-xs ml-2">LEGADO</Badge>
                        </DialogTitle>
                        <DialogDescription>Dados migrados do sistema antigo.</DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Cliente</div>
                                    <div className="font-medium">{selectedOrder.clientName || 'N/I'}</div>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Veículo PLACA</div>
                                    <div className="font-medium bg-slate-200 dark:bg-slate-800 w-max px-2 py-0.5 rounded text-sm uppercase">{selectedOrder.vehiclePlate || 'N/I'}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Data</div>
                                    <div className="font-medium">{formatDate(selectedOrder.entryDate)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Total</div>
                                    <div className="font-bold">{formatCurrency(selectedOrder.totalValue)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Pendência</div>
                                    <div className={`font-bold ${Number(selectedOrder.pendingValue) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatCurrency(selectedOrder.pendingValue)}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl">
                                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-600 font-bold mb-2">
                                    <FileText className="w-4 h-4" /> Observações do Legado
                                </div>
                                <p className="text-sm text-yellow-900 dark:text-yellow-500 leading-relaxed whitespace-pre-wrap">
                                    {selectedOrder.observations || 'Nenhuma observação registrada.'}
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end pt-4">
                        <Button variant="outline" onClick={() => setSelectedOrder(null)} className="rounded-xl">Fechar Detalhes</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
