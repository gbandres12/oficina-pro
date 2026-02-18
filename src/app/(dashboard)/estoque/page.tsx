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
    FileUp,
    Filter
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { CreatePartDialog } from '@/components/parts/CreatePartDialog';

export default function EstoquePage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

    const [parts, setParts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');

    const fetchParts = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/stock');
            const data = await response.json();
            if (Array.isArray(data)) {
                setParts(data);
            }
        } catch (error) {
            console.error('Error fetching parts:', error);
            toast.error('Erro ao carregar estoque');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchParts();
    }, []);

    const filteredParts = parts.filter(part =>
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const lowStockCount = parts.filter(p => (Number(p.stock) <= Number(p.minStock) || Number(p.stock) === 0)).length;
    const totalValue = parts.reduce((acc, p) => acc + (Number(p.price) * Number(p.stock)), 0);
    const totalItems = parts.reduce((acc, part) => acc + Number(part.stock), 0);

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-950/20">
                            <Package className="w-8 h-8" />
                        </div>
                        Estoque de Peças
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">Controle de inventário, reposição e movimentações.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 dark:border-slate-800 font-bold gap-2">
                        <FileDown className="w-4 h-4" /> Exportar
                    </Button>
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            className="hidden"
                            accept=".xml,.json"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                const formData = new FormData();
                                formData.append('file', file);

                                toast.promise(async () => {
                                    // Se for JSON, usamos o endpoint de stock
                                    if (file.name.endsWith('.json')) {
                                        const text = await file.text();
                                        const items = JSON.parse(text);
                                        const res = await fetch('/api/stock/import', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ items }),
                                        });
                                        if (!res.ok) throw new Error('Falha na importação');
                                        return await res.json();
                                    } else {
                                        // Se for XML, usamos o endpoint de parts
                                        const res = await fetch('/api/parts/import', {
                                            method: 'POST',
                                            body: formData,
                                        });
                                        if (!res.ok) throw new Error('Falha no processamento do XML');
                                        return await res.json();
                                    }
                                }, {
                                    loading: 'Processando arquivo...',
                                    success: (data) => `Sucesso! Itens processados.`,
                                    error: (err) => err.message
                                });
                            }}
                        />
                        <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary h-12 px-6 font-bold uppercase text-xs hover:bg-primary/10 transition-colors cursor-pointer">
                            <FileUp className="w-4 h-4" /> Importar
                        </div>
                    </label>
                    <Button
                        className="h-12 rounded-xl px-8 font-black bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 gap-2 transition-all active:scale-95 border-b-4 border-slate-950"
                        onClick={() => setIsCreateDialogOpen(true)}
                    >
                        <Plus className="w-5 h-5" /> Nova Peça
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                    <CardContent className="p-6 flex items-center gap-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl text-blue-600 dark:text-blue-400">
                            <Box className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="text-4xl font-black text-slate-900 dark:text-white">{loading ? '...' : totalItems}</div>
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">
                                {loading ? '...' : parts.length} Produtos Cadastrados
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                    <CardContent className="p-6 flex items-center gap-6">
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="text-4xl font-black text-slate-900 dark:text-white">
                                {loading ? '...' : lowStockCount}
                            </div>
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">Reposição Urgente</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                    <CardContent className="p-6 flex items-center gap-6">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl text-emerald-600 dark:text-emerald-400">
                            <Tag className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="text-4xl font-black text-slate-900 dark:text-white">
                                {loading ? '...' : `R$ ${totalValue.toLocaleString('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })}`}
                            </div>
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">Valor em Estoque</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border border-slate-100 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900 dark:text-white">Catálogo de Peças</CardTitle>
                            <CardDescription className="text-base">Visualize e gerencie todos os itens do inventário</CardDescription>
                        </div>
                        <div className="flex gap-2 relative group">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
                            <Input
                                placeholder="Buscar por nome ou SKU..."
                                className="pl-12 h-12 w-[320px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-slate-400 font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-50/80 border-b border-slate-100 dark:border-slate-800">
                                <TableHead className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-6 h-12">Produto</TableHead>
                                <TableHead className="text-[10px] uppercase font-black text-slate-500 tracking-widest h-12">SKU</TableHead>
                                <TableHead className="text-[10px] uppercase font-black text-slate-500 tracking-widest h-12">Estoque</TableHead>
                                <TableHead className="text-[10px] uppercase font-black text-slate-500 tracking-widest h-12">Preço Unit.</TableHead>
                                <TableHead className="text-[10px] uppercase font-black text-slate-500 tracking-widest h-12">Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-24 text-muted-foreground font-medium">
                                        Carregando estoque...
                                    </TableCell>
                                </TableRow>
                            ) : filteredParts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-24 text-muted-foreground flex flex-col items-center gap-4">
                                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                                            <Package className="w-8 h-8 opacity-40" />
                                        </div>
                                        <p className="font-bold">Nenhum item encontrado.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredParts.map((part) => {
                                    const stock = Number(part.stock);
                                    const minStock = Number(part.minStock || 0);
                                    const status = stock === 0 ? 'OUT' : stock <= minStock ? 'LOW' : 'OK';

                                    return (
                                        <TableRow key={part.id} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-b border-slate-50 dark:border-slate-800/50">
                                            <TableCell className="px-6 py-4">
                                                <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{part.name}</div>
                                                <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">UN: {part.unit}</div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md font-bold text-slate-500 border border-slate-200 dark:border-slate-700">
                                                    {part.sku || 'S/ SKU'}
                                                </code>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col gap-1.5 w-24">
                                                    <div className="text-sm font-black">{stock}</div>
                                                    <Progress
                                                        value={minStock > 0 ? (stock / (minStock * 2)) * 100 : 100}
                                                        className={`h-1.5 rounded-full ${status === 'LOW' ? 'bg-amber-100' : status === 'OUT' ? 'bg-red-100' : 'bg-slate-100'}`}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm font-bold py-4 text-slate-700 dark:text-slate-300">
                                                R$ {Number(part.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="outline" className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${status === 'OK' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                                        status === 'LOW' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400' :
                                                            'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400'
                                                    }`}>
                                                    {status === 'OK' ? 'Disponível' :
                                                        status === 'LOW' ? 'Baixo Estoque' : 'Esgotado'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 pr-6 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <CreatePartDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={() => {
                    toast.success('Peça criada com sucesso!');
                    fetchParts();
                }}
            />
        </div>
    );
}
