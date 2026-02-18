"use client";

import React, { useEffect, useState } from 'react';
import {
    Building2,
    Search,
    Plus,
    Phone,
    Mail,
    MapPin,
    Loader2,
    Package,
    Wrench,
    Settings,
    Building,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CreateSupplierDialog } from '@/components/suppliers/CreateSupplierDialog';
import {
    Supplier,
    SupplierType,
    SupplierStats,
    SUPPLIER_TYPE_LABELS,
    SUPPLIER_TYPE_COLORS
} from '@/types/supplier';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function FornecedoresPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [stats, setStats] = useState<SupplierStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('active');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (typeFilter !== 'all') params.append('type', typeFilter);
            if (statusFilter !== 'all') params.append('isActive', statusFilter === 'active' ? 'true' : 'false');
            if (searchTerm) params.append('search', searchTerm);

            const response = await fetch(`/api/suppliers?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                setSuppliers(data.suppliers);
                setStats(data.stats);
            } else {
                toast.error('Erro ao carregar fornecedores');
            }
        } catch (error) {
            toast.error('Erro ao conectar com o servidor');
            console.error('Error fetching suppliers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, [typeFilter, statusFilter]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== undefined) {
                fetchSuppliers();
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleToggleStatus = async (supplier: Supplier) => {
        try {
            const response = await fetch(`/api/suppliers/${supplier.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !supplier.isActive })
            });

            const data = await response.json();

            if (data.success) {
                toast.success(supplier.isActive ? 'Fornecedor desativado' : 'Fornecedor ativado');
                fetchSuppliers();
            } else {
                toast.error(data.error || 'Erro ao atualizar fornecedor');
            }
        } catch (error) {
            toast.error('Erro ao conectar com o servidor');
        }
    };

    const getTypeIcon = (type: SupplierType) => {
        switch (type) {
            case SupplierType.PARTS:
                return <Package className="w-4 h-4" />;
            case SupplierType.WORKSHOP:
                return <Wrench className="w-4 h-4" />;
            case SupplierType.RECTIFICATION:
                return <Settings className="w-4 h-4" />;
            case SupplierType.OTHER:
                return <Building className="w-4 h-4" />;
        }
    };

    const getTypeColor = (type: SupplierType) => {
        const colorMap = {
            blue: 'bg-blue-50 text-blue-600 border-blue-200',
            orange: 'bg-orange-50 text-orange-600 border-orange-200',
            purple: 'bg-purple-50 text-purple-600 border-purple-200',
            slate: 'bg-slate-50 text-slate-600 border-slate-200'
        };
        return colorMap[SUPPLIER_TYPE_COLORS[type] as keyof typeof colorMap];
    };

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <Building2 className="w-6 h-6" />
                        </div>
                        Fornecedores
                    </h1>
                    <p className="text-muted-foreground">
                        Gerencie fornecedores de peças, oficinas parceiras e serviços externos
                    </p>
                </div>
                <Button
                    className="gap-2 rounded-xl bg-primary shadow-lg shadow-primary/20"
                    onClick={() => setIsCreateDialogOpen(true)}
                >
                    <Plus className="w-4 h-4" /> Novo Fornecedor
                </Button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-4 gap-4">
                    <Card className="border-none shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{stats.total}</div>
                                    <div className="text-sm text-muted-foreground">Total</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{stats.byType.PARTS}</div>
                                    <div className="text-sm text-muted-foreground">Peças</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                                    <Wrench className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{stats.byType.WORKSHOP}</div>
                                    <div className="text-sm text-muted-foreground">Oficinas</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{stats.byType.RECTIFICATION}</div>
                                    <div className="text-sm text-muted-foreground">Retíficas</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card className="border-none shadow-md">
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Buscar por nome, documento ou cidade..."
                                className="pl-10 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-48 rounded-xl">
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Tipos</SelectItem>
                                <SelectItem value="PARTS">📦 Peças</SelectItem>
                                <SelectItem value="WORKSHOP">🔧 Oficinas</SelectItem>
                                <SelectItem value="RECTIFICATION">⚙️ Retíficas</SelectItem>
                                <SelectItem value="OTHER">🏢 Outros</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40 rounded-xl">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="active">Ativos</SelectItem>
                                <SelectItem value="inactive">Inativos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Suppliers List */}
            <div className="space-y-3">
                {loading ? (
                    <Card className="border-none shadow-md">
                        <CardContent className="p-12">
                            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <p>Carregando fornecedores...</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : suppliers.length === 0 ? (
                    <Card className="border-none shadow-md">
                        <CardContent className="p-12">
                            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                <Building2 className="w-12 h-12" />
                                <div className="text-center">
                                    <p className="font-semibold text-lg">Nenhum fornecedor encontrado</p>
                                    <p className="text-sm">Cadastre fornecedores para gerenciar suas compras e serviços</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    suppliers.map((supplier) => (
                        <Card
                            key={supplier.id}
                            className={`border-none shadow-md hover:shadow-lg transition-all ${!supplier.isActive ? 'opacity-60' : ''
                                }`}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className={`w-12 h-12 rounded-full ${getTypeColor(supplier.type)} flex items-center justify-center font-bold text-lg border-2`}>
                                            {getTypeIcon(supplier.type)}
                                        </div>
                                        <div className="flex-1 grid grid-cols-5 gap-6">
                                            <div className="col-span-2">
                                                <div className="text-xs text-muted-foreground mb-1">Nome</div>
                                                <div className="font-bold text-lg">{supplier.name}</div>
                                                {supplier.tradeName && (
                                                    <div className="text-sm text-muted-foreground">{supplier.tradeName}</div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                    <Phone className="w-3 h-3" /> Telefone
                                                </div>
                                                <div className="font-medium">{supplier.phone}</div>
                                                {supplier.whatsapp && supplier.whatsapp !== supplier.phone && (
                                                    <div className="text-xs text-muted-foreground">WhatsApp: {supplier.whatsapp}</div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> Localização
                                                </div>
                                                <div className="font-medium">
                                                    {supplier.city && supplier.state
                                                        ? `${supplier.city} - ${supplier.state}`
                                                        : supplier.city || supplier.state || 'Não informado'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">Tipo</div>
                                                <Badge className={`${getTypeColor(supplier.type)} gap-1`}>
                                                    {getTypeIcon(supplier.type)}
                                                    {SUPPLIER_TYPE_LABELS[supplier.type]}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {supplier.email && (
                                            <Badge variant="outline" className="gap-1">
                                                <Mail className="w-3 h-3" />
                                                {supplier.email}
                                            </Badge>
                                        )}
                                        {supplier.isActive ? (
                                            <Badge className="bg-green-50 text-green-600 border-green-200 gap-1">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Ativo
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-red-50 text-red-600 border-red-200 gap-1">
                                                <XCircle className="w-3 h-3" />
                                                Inativo
                                            </Badge>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="rounded-xl">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleToggleStatus(supplier)}>
                                                    {supplier.isActive ? (
                                                        <>
                                                            <XCircle className="w-4 h-4 mr-2" />
                                                            Desativar
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                                            Ativar
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                {supplier.notes && (
                                    <div className="mt-4 pt-4 border-t">
                                        <div className="text-xs text-muted-foreground mb-1">Observações</div>
                                        <div className="text-sm">{supplier.notes}</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <CreateSupplierDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={fetchSuppliers}
            />
        </div>
    );
}
