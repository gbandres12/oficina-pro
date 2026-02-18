"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    FileText,
    Plus,
    Search,
    Calendar,
    User,
    Car,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Printer,
    Clock,
    DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface Quotation {
    id: string;
    number: number;
    customerName: string;
    vehicleModel: string;
    vehiclePlate: string;
    total: number;
    createdAt: string;
    status: string;
    itemsCount: number;
}

export default function OrcamentosPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQuotations = async () => {
        setLoading(true);
        try {
            // Need to implement this API endpoint
            const response = await fetch('/api/quotations');
            const data = await response.json();
            if (data.success) {
                setQuotations(data.quotations);
            }
        } catch (error) {
            console.error('Error fetching quotations:', error);
            // Mock data for display while API is not ready
            setQuotations([
                {
                    id: '1',
                    number: 1001,
                    customerName: 'João da Silva',
                    vehicleModel: 'Honda Civic 2020',
                    vehiclePlate: 'ABC-1234',
                    total: 370.00,
                    createdAt: new Date().toISOString(),
                    status: 'PENDING',
                    itemsCount: 2
                },
                {
                    id: '2',
                    number: 1002,
                    customerName: 'Maria Oliveira',
                    vehicleModel: 'Toyota Corolla',
                    vehiclePlate: 'XYZ-9876',
                    total: 1250.50,
                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                    status: 'APPROVED',
                    itemsCount: 4
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotations();
    }, []);

    const filteredQuotations = quotations.filter(q =>
        q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.number.toString().includes(searchTerm)
    );

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Orçamentos</h1>
                    <p className="text-muted-foreground">Gerencie propostas e orçamentos de serviços.</p>
                </div>
                <Button
                    className="gap-2 bg-primary font-bold shadow-lg shadow-primary/20"
                    onClick={() => router.push('/orcamentos/novo')}
                >
                    <Plus className="w-4 h-4" /> Novo Orçamento
                </Button>
            </div>

            <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="pb-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg">Lista de Orçamentos</CardTitle>
                            <CardDescription>
                                {filteredQuotations.length} orçamentos encontrados
                            </CardDescription>
                        </div>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por cliente, veículo ou nº..."
                                className="pl-9 w-full md:w-[300px] bg-slate-50 dark:bg-slate-800 border-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 mt-6">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50/50">
                                <TableHead className="font-bold text-xs uppercase text-slate-500">Número</TableHead>
                                <TableHead className="font-bold text-xs uppercase text-slate-500">Cliente / Veículo</TableHead>
                                <TableHead className="font-bold text-xs uppercase text-slate-500">Data</TableHead>
                                <TableHead className="font-bold text-xs uppercase text-slate-500">Valor Total</TableHead>
                                <TableHead className="font-bold text-xs uppercase text-slate-500">Status</TableHead>
                                <TableHead className="font-bold text-xs uppercase text-slate-500 text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        Carregando...
                                    </TableCell>
                                </TableRow>
                            ) : filteredQuotations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        Nenhum orçamento encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredQuotations.map((q) => (
                                    <TableRow key={q.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => router.push(`/orcamentos/${q.id}`)}>
                                        <TableCell className="font-bold text-slate-700 dark:text-slate-300">
                                            #{q.number}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    <User className="w-3 h-3 text-muted-foreground" /> {q.customerName}
                                                </span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                                    <Car className="w-3 h-3" /> {q.vehicleModel} • {q.vehiclePlate}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(q.createdAt).toLocaleDateString('pt-BR')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-black text-slate-900 dark:text-white">
                                            R$ {q.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                q.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                    q.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-200' :
                                                        'bg-amber-50 text-amber-600 border-amber-200'
                                            }>
                                                {q.status === 'APPROVED' ? 'APROVADO' :
                                                    q.status === 'REJECTED' ? 'REJEITADO' : 'PENDENTE'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={(e) => { e.stopPropagation(); toast.info("Imprimir PDF") }}>
                                                    <Printer className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
