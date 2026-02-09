"use client";

import React from 'react';
import {
    Users,
    Search,
    Plus,
    Mail,
    Phone,
    MapPin,
    ExternalLink,
    ChevronRight,
    UserPlus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ClientesPage() {
    const [view, setView] = React.useState('all');

    const customers = [
        { id: '1', name: 'João Silva', email: 'joao.silva@email.com', phone: '(11) 98888-7777', orders: 4, spent: 4500.50, status: 'VIP', pending: false },
        { id: '2', name: 'Maria Santos', email: 'maria.santos@gmail.com', phone: '(11) 97777-6666', orders: 1, spent: 450.00, status: 'REGULAR', pending: true },
        { id: '3', name: 'Pedro Costa', email: 'p.costa@provedor.net', phone: '(11) 96666-5555', orders: 8, spent: 12800.00, status: 'VIP', pending: false },
        { id: '4', name: 'Ana Oliveira', email: 'oliveira.ana@outlook.com', phone: '(11) 95555-4444', orders: 2, spent: 1200.00, status: 'REGULAR', pending: true },
        { id: '5', name: 'Carlos Ferreira', email: 'carlos.f@empresa.com.br', phone: '(11) 94444-3333', orders: 0, spent: 0.00, status: 'NEW', pending: false },
    ];

    const filteredCustomers = view === 'pending'
        ? customers.filter(c => c.pending)
        : customers;

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">Gestão de Clientes</h1>
                    <p className="text-muted-foreground font-medium">Base de proprietários e histórico de serviços.</p>
                </div>
                <Button className="gap-2 rounded-xl bg-primary h-11 px-6 font-bold uppercase text-xs shadow-lg shadow-primary/20">
                    <UserPlus className="w-4 h-4" /> Novo Cliente
                </Button>
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={setView}>
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                    <TabsList className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-border/50 shadow-sm h-12">
                        <TabsTrigger value="all" className="rounded-lg font-bold text-xs uppercase px-6">Todos os Clientes</TabsTrigger>
                        <TabsTrigger value="pending" className="rounded-lg font-bold text-xs uppercase px-6 text-red-500">Pendentes de Pagamento</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-4 h-12 rounded-xl border border-border/50 shadow-sm flex-1 md:max-w-md">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Buscar por nome, placa ou CPF..." className="border-none bg-transparent shadow-none text-xs focus-visible:ring-0" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCustomers.map((customer) => (
                        <Card key={customer.id} className="group border-none shadow-xl hover:scale-[1.02] transition-all cursor-pointer overflow-hidden p-0 bg-white dark:bg-slate-900">
                            <div className={`h-1.5 w-full ${customer.pending ? 'bg-red-500' : 'bg-slate-100 dark:bg-slate-800'} group-hover:bg-primary transition-colors`} />
                            <CardHeader className="p-6 pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        {customer.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col gap-1 items-end">
                                        <Badge variant="outline" className={
                                            customer.status === 'VIP' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                                customer.status === 'NEW' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'text-slate-400'
                                        }>
                                            {customer.status}
                                        </Badge>
                                        {customer.pending && (
                                            <Badge className="bg-red-500 hover:bg-red-600 text-[9px] font-black tracking-widest uppercase py-0">PENDENTE</Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <CardTitle className="text-xl font-black">{customer.name}</CardTitle>
                                    <CardDescription className="flex flex-col gap-1 mt-1 font-medium">
                                        <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {customer.email}</span>
                                        <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {customer.phone}</span>
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="px-6 pb-6">
                                <div className="grid grid-cols-2 gap-4 py-4 border-y border-dashed mt-2">
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">O.S. Totais</div>
                                        <div className="text-lg font-black">{customer.orders}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Gasto</div>
                                        <div className="text-lg font-black text-emerald-600">R$ {customer.spent.toLocaleString('pt-BR')}</div>
                                    </div>
                                </div>
                                <Button variant="ghost" className="w-full mt-4 justify-between h-10 text-[10px] font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 hover:bg-primary hover:text-white rounded-xl transition-all">
                                    Ver Ficha Mecânica <ChevronRight className="w-4 h-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </Tabs>
        </div>
    );
}
