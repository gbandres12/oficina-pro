"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus,
    Trash2,
    Search,
    Package,
    Wrench,
    ShoppingCart,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"

interface OrderItemsManagerProps {
    orderId: string;
    services: any[];
    parts: any[];
    onItemsChange: () => void;
}

export function OrderItemsManager({ orderId, services, parts, onItemsChange }: OrderItemsManagerProps) {
    const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
    const [isAddPartOpen, setIsAddPartOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form states
    const [serviceDesc, setServiceDesc] = useState('');
    const [servicePrice, setServicePrice] = useState('');
    const [serviceQty, setServiceQty] = useState('1');

    const [partName, setPartName] = useState('');
    const [partPrice, setPartPrice] = useState('');
    const [partQty, setPartQty] = useState('1');
    const [partSku, setPartSku] = useState('');
    const [inventoryItemId, setInventoryItemId] = useState<string | null>(null);

    // Stock search state
    const [stockSearch, setStockSearch] = useState('');
    const [stockResults, setStockResults] = useState<any[]>([]);
    const [searchingStock, setSearchingStock] = useState(false);

    useEffect(() => {
        if (stockSearch.length > 2) {
            const timer = setTimeout(() => {
                searchStock();
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setStockResults([]);
        }
    }, [stockSearch]);

    const searchStock = async () => {
        setSearchingStock(true);
        try {
            const res = await fetch(`/api/stock?search=${stockSearch}`);
            if (res.ok) {
                const data = await res.json();
                setStockResults(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSearchingStock(false);
        }
    };

    const handleSelectStockItem = (item: any) => {
        setPartName(item.name);
        setPartPrice(item.price.toString());
        setPartSku(item.sku);
        setInventoryItemId(item.id);
        setStockSearch('');
        setStockResults([]);
    };

    const handleAddItem = async (type: 'SERVICE' | 'PART') => {
        setLoading(true);
        try {
            const data = type === 'SERVICE'
                ? { type, description: serviceDesc, price: Number(servicePrice), quantity: Number(serviceQty) }
                : { type, name: partName, price: Number(partPrice), quantity: Number(partQty), sku: partSku, inventoryItemId };

            const res = await fetch(`/api/service-orders/${orderId}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                toast.success(`${type === 'SERVICE' ? 'Serviço' : 'Peça'} adicionado com sucesso!`);
                if (type === 'SERVICE') {
                    setIsAddServiceOpen(false);
                    setServiceDesc(''); setServicePrice(''); setServiceQty('1');
                } else {
                    setIsAddPartOpen(false);
                    setPartName(''); setPartPrice(''); setPartQty('1'); setPartSku(''); setInventoryItemId(null);
                }
                onItemsChange();
            } else {
                toast.error('Erro ao adicionar item');
            }
        } catch (error) {
            toast.error('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveItem = async (itemId: string, type: 'SERVICE' | 'PART') => {
        if (!confirm('Deseja remover este item?')) return;

        try {
            const res = await fetch(`/api/service-orders/${orderId}/items?itemId=${itemId}&type=${type}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success('Item removido');
                onItemsChange();
            } else {
                toast.error('Erro ao remover item');
            }
        } catch (error) {
            toast.error('Erro de conexão');
        }
    };

    return (
        <Card className="shadow-sm border-none bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-slate-800/50 py-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-primary" /> Serviços e Peças
                </CardTitle>
                <div className="flex gap-2">
                    <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-2 bg-white dark:bg-slate-800">
                                <Plus className="w-4 h-4" /> Serviço
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Adicionar Serviço</DialogTitle>
                                <DialogDescription>Informe os detalhes do serviço realizado.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Descrição</label>
                                    <Input value={serviceDesc} onChange={(e) => setServiceDesc(e.target.value)} placeholder="Ex: Troca de Óleo" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Preço (R$)</label>
                                        <Input type="number" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} placeholder="0.00" />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Qtd</label>
                                        <Input type="number" value={serviceQty} onChange={(e) => setServiceQty(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => handleAddItem('SERVICE')} disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Adicionar
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isAddPartOpen} onOpenChange={setIsAddPartOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2 bg-primary">
                                <Plus className="w-4 h-4" /> Peça
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Adicionar Peça</DialogTitle>
                                <DialogDescription>Busque no estoque ou adicione manualmente.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2 relative">
                                    <label className="text-sm font-medium">Buscar no Estoque</label>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Nome ou SKU..."
                                            className="pl-8"
                                            value={stockSearch}
                                            onChange={(e) => setStockSearch(e.target.value)}
                                        />
                                    </div>
                                    {searchingStock && <div className="absolute right-3 top-9"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>}

                                    {stockResults.length > 0 && (
                                        <div className="absolute top-16 left-0 right-0 z-50 bg-white dark:bg-slate-800 border rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                            {stockResults.map(item => (
                                                <div
                                                    key={item.id}
                                                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b last:border-0"
                                                    onClick={() => handleSelectStockItem(item)}
                                                >
                                                    <div className="font-bold text-sm">{item.name}</div>
                                                    <div className="text-xs text-muted-foreground">SKU: {item.sku} • Est: {item.stock} • R$ {Number(item.price).toLocaleString()}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Nome da Peça</label>
                                    <Input value={partName} onChange={(e) => setPartName(e.target.value)} placeholder="Ex: Filtro de Óleo" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Preço (R$)</label>
                                        <Input type="number" value={partPrice} onChange={(e) => setPartPrice(e.target.value)} placeholder="0.00" />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Qtd</label>
                                        <Input type="number" value={partQty} onChange={(e) => setPartQty(e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-muted-foreground">SKU (Opcional)</label>
                                    <Input value={partSku} onChange={(e) => setPartSku(e.target.value)} placeholder="Cód. Peça" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => handleAddItem('PART')} disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Adicionar
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-slate-50/30 dark:bg-slate-900/30">
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Descrição / Item</TableHead>
                            <TableHead className="text-right">Preço Unit.</TableHead>
                            <TableHead className="text-right">Qtd</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* List Services */}
                        {services.map((s) => (
                            <TableRow key={s.id}>
                                <TableCell><Wrench className="w-4 h-4 text-blue-500" /></TableCell>
                                <TableCell className="font-medium">{s.description}</TableCell>
                                <TableCell className="text-right">R$ {Number(s.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                <TableCell className="text-right">{Number(s.quantity)}</TableCell>
                                <TableCell className="text-right font-bold">R$ {s.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleRemoveItem(s.id, 'SERVICE')}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}

                        {/* List Parts */}
                        {parts.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell><Package className="w-4 h-4 text-orange-500" /></TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{p.name}</span>
                                        {p.sku && <span className="text-[10px] text-muted-foreground uppercase">{p.sku}</span>}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">R$ {Number(p.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                <TableCell className="text-right">{Number(p.quantity)}</TableCell>
                                <TableCell className="text-right font-bold">R$ {p.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleRemoveItem(p.id, 'PART')}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}

                        {services.length === 0 && parts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Nenhum item adicionado a esta OS.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Total dos Itens</p>
                        <p className="text-2xl font-black text-primary">
                            R$ {(services.reduce((acc, s) => acc + s.total, 0) + parts.reduce((acc, p) => acc + p.total, 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
