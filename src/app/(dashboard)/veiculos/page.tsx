"use client";

import React, { useEffect, useState } from 'react';
import {
    Car,
    Search,
    Plus,
    User,
    Calendar,
    Gauge,
    Loader2,
    MoreVertical
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Vehicle {
    id: string;
    plate: string;
    vin: string | null;
    model: string;
    brand: string;
    year: number | null;
    ownerName: string;
    ownerId: string;
    currentStatus: string | null;
    lastKm: number | null;
    createdAt: string;
}

export default function VeiculosPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/vehicles/list');
            const data = await response.json();

            if (data.success) {
                setVehicles(data.vehicles);
            } else {
                toast.error('Erro ao carregar veículos');
            }
        } catch (error) {
            toast.error('Erro ao conectar com o servidor');
            console.error('Erro ao buscar veículos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const filteredVehicles = vehicles.filter(vehicle =>
        vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusConfig = (status: string | null) => {
        if (!status) return { label: 'Sem Ordem', variant: 'outline' as const, className: 'border-gray-200 bg-gray-50 text-gray-700' };

        const configs: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
            'OPEN': { label: 'Aberta', variant: 'outline', className: 'border-blue-200 bg-blue-50 text-blue-700' },
            'IN_PROGRESS': { label: 'Em Manutenção', variant: 'default', className: 'bg-yellow-500' },
            'WAITING_PARTS': { label: 'Aguardando Peças', variant: 'secondary', className: 'bg-orange-500 text-white' },
            'COMPLETED': { label: 'Finalizada', variant: 'outline', className: 'border-green-200 bg-green-50 text-green-700' },
            'APPROVED': { label: 'Aprovada', variant: 'default', className: 'bg-green-600' },
        };
        return configs[status] || { label: status, variant: 'outline' as const, className: '' };
    };

    const formatKm = (km: number | null) => {
        if (!km) return '-';
        return new Intl.NumberFormat('pt-BR').format(km) + ' km';
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                            <Car className="w-6 h-6" />
                        </div>
                        Veículos
                    </h1>
                    <p className="text-muted-foreground">Gerencie a frota de veículos cadastrados</p>
                </div>
                <Button className="gap-2 rounded-xl bg-primary shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" /> Vincular Veículo
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="border-none shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                                <Car className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{vehicles.length}</div>
                                <div className="text-sm text-muted-foreground">Total de Veículos</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-yellow-50 text-yellow-600">
                                <Gauge className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {vehicles.filter(v => v.currentStatus === 'IN_PROGRESS').length}
                                </div>
                                <div className="text-sm text-muted-foreground">Em Manutenção</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {new Set(vehicles.map(v => v.ownerId)).size}
                                </div>
                                <div className="text-sm text-muted-foreground">Proprietários</div>
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
                                placeholder="Buscar por placa, modelo, marca ou proprietário..."
                                className="pl-10 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Vehicles List */}
            <div className="space-y-3">
                {loading ? (
                    <Card className="border-none shadow-md">
                        <CardContent className="p-12">
                            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <p>Carregando veículos...</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : filteredVehicles.length === 0 ? (
                    <Card className="border-none shadow-md">
                        <CardContent className="p-12">
                            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                <Car className="w-12 h-12" />
                                <div className="text-center">
                                    <p className="font-semibold text-lg">Nenhum veículo encontrado</p>
                                    <p className="text-sm">Veículos serão cadastrados automaticamente ao criar ordens de serviço</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    filteredVehicles.map((vehicle) => {
                        const statusConfig = getStatusConfig(vehicle.currentStatus);
                        return (
                            <Card key={vehicle.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6 flex-1">
                                            <div className="text-center min-w-[100px]">
                                                <div className="text-xs text-muted-foreground mb-1">Placa</div>
                                                <div className="font-bold text-lg bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded">
                                                    {vehicle.plate}
                                                </div>
                                            </div>
                                            <div className="h-12 w-px bg-border" />
                                            <div className="flex-1 grid grid-cols-4 gap-6">
                                                <div>
                                                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                        <Car className="w-3 h-3" /> Veículo
                                                    </div>
                                                    <div className="font-bold">{vehicle.brand} {vehicle.model}</div>
                                                    {vehicle.year && (
                                                        <div className="text-xs text-muted-foreground">{vehicle.year}</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                        <User className="w-3 h-3" /> Proprietário
                                                    </div>
                                                    <div className="font-medium">{vehicle.ownerName}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                        <Gauge className="w-3 h-3" /> Última KM
                                                    </div>
                                                    <div className="font-medium">{formatKm(vehicle.lastKm)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-muted-foreground mb-1">Status Atual</div>
                                                    <Badge variant={statusConfig.variant} className={statusConfig.className}>
                                                        {statusConfig.label}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Button variant="ghost" size="icon" className="rounded-xl">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
