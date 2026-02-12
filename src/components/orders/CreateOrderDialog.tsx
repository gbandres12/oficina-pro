"use client";

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Car, User, Wrench, Search } from "lucide-react";

interface CreateOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function CreateOrderDialog({ open, onOpenChange, onSuccess }: CreateOrderDialogProps) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);

    // Form state
    const [formData, setFormData] = useState({
        // Cliente e Veículo
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientDocument: '',
        vehiclePlate: '',
        vehicleModel: '',
        vehicleBrand: '',
        vehicleYear: '',
        vehicleVin: '',

        // Dados da OS
        km: '',
        fuelLevel: '50',
        mechanic: '',
        clientReport: '',
        observations: '',
    });

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const handleSearchClient = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`/api/clients/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            setSearchResults(data.clients || []);
            setShowResults(true);
        } catch (error) {
            console.error('Error searching clients:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const selectClient = (client: any) => {
        setFormData(prev => ({
            ...prev,
            clientName: client.name,
            clientEmail: client.email || '',
            clientPhone: client.phone || '',
            clientDocument: client.document || '',
        }));
        setSearchQuery('');
        setShowResults(false);
        toast.success("Cliente selecionado!");
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateStep1 = () => {
        if (!formData.clientName || !formData.clientPhone) {
            toast.error("Preencha nome e telefone do cliente");
            return false;
        }
        if (!formData.vehiclePlate || !formData.vehicleModel || !formData.vehicleBrand) {
            toast.error("Preencha placa, modelo e marca do veículo");
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.km) {
            toast.error("Preencha a quilometragem do veículo");
            return false;
        }
        if (!formData.clientReport) {
            toast.error("Preencha o relato do cliente");
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep2()) return;

        setLoading(true);
        try {
            const response = await fetch('/api/service-orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao criar ordem de serviço');
            }

            toast.success(`O.S. #${data.orderNumber} criada com sucesso!`);
            onOpenChange(false);
            onSuccess?.();

            // Reset form
            setFormData({
                clientName: '',
                clientEmail: '',
                clientPhone: '',
                clientDocument: '',
                vehiclePlate: '',
                vehicleModel: '',
                vehicleBrand: '',
                vehicleYear: '',
                vehicleVin: '',
                km: '',
                fuelLevel: '50',
                mechanic: '',
                clientReport: '',
                observations: '',
            });
            setStep(1);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Erro ao criar ordem de serviço');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Wrench className="w-6 h-6 text-primary" />
                        Nova Ordem de Serviço
                    </DialogTitle>
                    <DialogDescription>
                        {step === 1 ? 'Passo 1 de 2: Dados do Cliente e Veículo' : 'Passo 2 de 2: Dados da Ordem de Serviço'}
                    </DialogDescription>
                </DialogHeader>

                {step === 1 ? (
                    <div className="space-y-6 py-4">
                        {/* Cliente */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Dados do Cliente
                                </div>
                                <div className="text-xs font-normal text-muted-foreground">
                                    Busque por nome, CPF ou telefone
                                </div>
                            </div>

                            {/* Search Box */}
                            <div className="relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar cliente existente..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => handleSearchClient(e.target.value)}
                                    />
                                    {isSearching && (
                                        <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                                    )}
                                </div>

                                {showResults && searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[200px] overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                                        {searchResults.map((client) => (
                                            <div
                                                key={client.id}
                                                className="cursor-pointer px-4 py-2 hover:bg-muted text-sm"
                                                onClick={() => selectClient(client)}
                                            >
                                                <div className="font-bold">{client.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {client.document} • {client.phone}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label htmlFor="clientName">Nome Completo *</Label>
                                    <Input
                                        id="clientName"
                                        value={formData.clientName}
                                        onChange={(e) => handleInputChange('clientName', e.target.value)}
                                        placeholder="João Silva"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="clientPhone">Telefone *</Label>
                                    <Input
                                        id="clientPhone"
                                        value={formData.clientPhone}
                                        onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                                        placeholder="(11) 98888-7777"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="clientEmail">E-mail</Label>
                                    <Input
                                        id="clientEmail"
                                        type="email"
                                        value={formData.clientEmail}
                                        onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                                        placeholder="joao@email.com"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Label htmlFor="clientDocument">CPF/CNPJ</Label>
                                    <Input
                                        id="clientDocument"
                                        value={formData.clientDocument}
                                        onChange={(e) => handleInputChange('clientDocument', e.target.value)}
                                        placeholder="000.000.000-00"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Veículo */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                <Car className="w-4 h-4" />
                                Dados do Veículo
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="vehiclePlate">Placa *</Label>
                                    <Input
                                        id="vehiclePlate"
                                        value={formData.vehiclePlate}
                                        onChange={(e) => handleInputChange('vehiclePlate', e.target.value.toUpperCase())}
                                        placeholder="ABC-1234"
                                        className="uppercase"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="vehicleVin">Chassi</Label>
                                    <Input
                                        id="vehicleVin"
                                        value={formData.vehicleVin}
                                        onChange={(e) => handleInputChange('vehicleVin', e.target.value.toUpperCase())}
                                        placeholder="9BWZZZ377VT004251"
                                        className="uppercase"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Label htmlFor="vehicleModel">Modelo *</Label>
                                    <Input
                                        id="vehicleModel"
                                        value={formData.vehicleModel}
                                        onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                                        placeholder="Civic Touring"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="vehicleBrand">Marca *</Label>
                                    <Input
                                        id="vehicleBrand"
                                        value={formData.vehicleBrand}
                                        onChange={(e) => handleInputChange('vehicleBrand', e.target.value)}
                                        placeholder="Honda"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="vehicleYear">Ano</Label>
                                    <Input
                                        id="vehicleYear"
                                        type="number"
                                        value={formData.vehicleYear}
                                        onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                                        placeholder="2023"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="km">Quilometragem *</Label>
                                <Input
                                    id="km"
                                    type="number"
                                    value={formData.km}
                                    onChange={(e) => handleInputChange('km', e.target.value)}
                                    placeholder="45000"
                                />
                            </div>
                            <div>
                                <Label htmlFor="fuelLevel">Nível de Combustível (%)</Label>
                                <Input
                                    id="fuelLevel"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.fuelLevel}
                                    onChange={(e) => handleInputChange('fuelLevel', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="mechanic">Mecânico Responsável</Label>
                            <Input
                                id="mechanic"
                                value={formData.mechanic}
                                onChange={(e) => handleInputChange('mechanic', e.target.value)}
                                placeholder="Nome do mecânico"
                            />
                        </div>

                        <div>
                            <Label htmlFor="clientReport">Relato do Cliente *</Label>
                            <Textarea
                                id="clientReport"
                                value={formData.clientReport}
                                onChange={(e) => handleInputChange('clientReport', e.target.value)}
                                placeholder="Descreva o problema relatado pelo cliente..."
                                rows={4}
                            />
                        </div>

                        <div>
                            <Label htmlFor="observations">Observações Técnicas</Label>
                            <Textarea
                                id="observations"
                                value={formData.observations}
                                onChange={(e) => handleInputChange('observations', e.target.value)}
                                placeholder="Observações adicionais da vistoria..."
                                rows={3}
                            />
                        </div>
                    </div>
                )}

                <DialogFooter className="gap-2">
                    {step === 2 && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep(1)}
                            disabled={loading}
                        >
                            Voltar
                        </Button>
                    )}
                    {step === 1 ? (
                        <Button type="button" onClick={handleNext}>
                            Próximo
                        </Button>
                    ) : (
                        <Button type="button" onClick={handleSubmit} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Criando...
                                </>
                            ) : (
                                'Criar Ordem de Serviço'
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
