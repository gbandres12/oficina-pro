"use client";

import React, { useEffect, useState } from 'react';
import {
    Users,
    Search,
    UserPlus,
    Phone,
    Mail,
    FileText,
    DollarSign,
    Loader2,
    MoreVertical
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ImportCSVDialog } from '@/components/clients/ImportCSVDialog';
import { CreateClientDialog } from '@/components/clients/CreateClientDialog';

interface Client {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    document: string | null;
    orderCount: number;
    totalSpent: number;
    createdAt: string;
}

export default function ClientesPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/clients');
            const data = await response.json();

            if (data.success) {
                setClients(data.clients);
            } else {
                toast.error('Erro ao carregar clientes');
            }
        } catch (error) {
            toast.error('Erro ao conectar com o servidor');
            console.error('Erro ao buscar clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                            <Users className="w-6 h-6" />
                        </div>
                        Clientes
                    </h1>
                    <p className="text-muted-foreground">Gerencie sua base de clientes e histórico</p>
                </div>
                <div className="flex gap-3">
                    <ImportCSVDialog onSuccess={fetchClients} />
                    <Button
                        className="gap-2 rounded-xl bg-primary shadow-lg shadow-primary/20"
                        onClick={() => setIsCreateDialogOpen(true)}
                    >
                        <UserPlus className="w-4 h-4" /> Novo Cliente
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="border-none shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{clients.length}</div>
                                <div className="text-sm text-muted-foreground">Total de Clientes</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-green-50 text-green-600">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(clients.reduce((sum, c) => sum + Number(c.totalSpent), 0))}
                                </div>
                                <div className="text-sm text-muted-foreground">Faturamento Total</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {clients.reduce((sum, c) => sum + Number(c.orderCount), 0)}
                                </div>
                                <div className="text-sm text-muted-foreground">Ordens de Serviço</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card className="border-none shadow-md">
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Buscar por nome, telefone ou e-mail..."
                                className="pl-10 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Clients List */}
            <div className="space-y-3">
                {loading ? (
                    <Card className="border-none shadow-md">
                        <CardContent className="p-12">
                            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <p>Carregando clientes...</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : filteredClients.length === 0 ? (
                    <Card className="border-none shadow-md">
                        <CardContent className="p-12">
                            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                <Users className="w-12 h-12" />
                                <div className="text-center">
                                    <p className="font-semibold text-lg">Nenhum cliente encontrado</p>
                                    <p className="text-sm">Clientes serão criados automaticamente ao criar ordens de serviço</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    filteredClients.map((client) => (
                        <Card key={client.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                            {client.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 grid grid-cols-5 gap-6">
                                            <div className="col-span-2">
                                                <div className="text-xs text-muted-foreground mb-1">Nome</div>
                                                <div className="font-bold text-lg">{client.name}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                    <Phone className="w-3 h-3" /> Telefone
                                                </div>
                                                <div className="font-medium">{client.phone}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                    <FileText className="w-3 h-3" /> Ordens
                                                </div>
                                                <div className="font-medium">{client.orderCount}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                    <DollarSign className="w-3 h-3" /> Total Gasto
                                                </div>
                                                <div className="font-medium">{formatCurrency(Number(client.totalSpent))}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {client.email && (
                                            <Badge variant="outline" className="gap-1">
                                                <Mail className="w-3 h-3" />
                                                {client.email}
                                            </Badge>
                                        )}
                                        <Button variant="ghost" size="icon" className="rounded-xl">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <CreateClientDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={fetchClients}
            />
        </div>
    );
}
