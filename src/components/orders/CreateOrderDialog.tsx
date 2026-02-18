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
import { toast } from "sonner";
import { Loader2, Car, User, Wrench, Search, ArrowRight, ChevronLeft, CheckCircle2 } from "lucide-react";

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
            onSuccess?.();
            onOpenChange(false);

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
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden p-0 gap-0 border-0 shadow-2xl rounded-3xl bg-slate-50 dark:bg-slate-950">
                <DialogHeader className="p-6 pb-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
                    <div className="flex items-center justify-between mb-2">
                        <DialogTitle className="text-xl font-black flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                <Wrench className="w-5 h-5" />
                            </div>
                            Nova Ordem de Serviço
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                            <div className={`h-2 w-12 rounded-full transition-colors ${step === 1 ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`} />
                            <div className={`h-2 w-12 rounded-full transition-colors ${step === 2 ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`} />
                        </div>
                    </div>
                    <DialogDescription className="text-base">
                        {step === 1 ? 'Identifique o cliente e o veículo para iniciar.' : 'Detalhamento inicial do serviço e estado do veículo.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 md:p-8">
                    {step === 1 ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Cliente Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2.5 mb-2">
                                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Dados do Cliente</h3>
                                </div>

                                <div className="relative group">
                                    <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        placeholder="Buscar cliente existente por nome, CPF ou telefone..."
                                        className="pl-11 h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20"
                                        value={searchQuery}
                                        onChange={(e) => handleSearchClient(e.target.value)}
                                    />
                                    {isSearching && (
                                        <Loader2 className="absolute right-4 top-3.5 h-4 w-4 animate-spin text-primary" />
                                    )}

                                    {showResults && searchResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-[240px] overflow-y-auto rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-2 animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
                                            {searchResults.map((client) => (
                                                <div
                                                    key={client.id}
                                                    className="cursor-pointer px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-between group/item"
                                                    onClick={() => selectClient(client)}
                                                >
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white group-hover/item:text-primary transition-colors">{client.name}</div>
                                                        <div className="text-xs font-medium text-slate-500 mt-0.5">
                                                            {client.document} • {client.phone}
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all text-primary" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2 space-y-1.5">
                                        <Label htmlFor="clientName" className="text-xs font-bold uppercase text-slate-500 ml-1">Nome Completo *</Label>
                                        <Input
                                            id="clientName"
                                            value={formData.clientName}
                                            onChange={(e) => handleInputChange('clientName', e.target.value)}
                                            placeholder="Ex: João da Silva"
                                            className="h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="clientPhone" className="text-xs font-bold uppercase text-slate-500 ml-1">Telefone / WhatsApp *</Label>
                                        <Input
                                            id="clientPhone"
                                            value={formData.clientPhone}
                                            onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                                            placeholder="(00) 00000-0000"
                                            className="h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="clientDocument" className="text-xs font-bold uppercase text-slate-500 ml-1">CPF/CNPJ</Label>
                                        <Input
                                            id="clientDocument"
                                            value={formData.clientDocument}
                                            onChange={(e) => handleInputChange('clientDocument', e.target.value)}
                                            placeholder="000.000.000-00"
                                            className="h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-slate-200 dark:bg-slate-800" />

                            {/* Veículo Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2.5 mb-2">
                                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                                        <Car className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Dados do Veículo</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="vehiclePlate" className="text-xs font-bold uppercase text-slate-500 ml-1">Placa *</Label>
                                        <Input
                                            id="vehiclePlate"
                                            value={formData.vehiclePlate}
                                            onChange={(e) => handleInputChange('vehiclePlate', e.target.value.toUpperCase())}
                                            placeholder="ABC-1234"
                                            className="h-11 rounded-xl uppercase font-mono font-bold tracking-wider bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                            maxLength={7}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <Label htmlFor="vehicleModel" className="text-xs font-bold uppercase text-slate-500 ml-1">Modelo *</Label>
                                        <Input
                                            id="vehicleModel"
                                            value={formData.vehicleModel}
                                            onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                                            placeholder="Ex: Civic Touring 1.5 Turbo"
                                            className="h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="vehicleBrand" className="text-xs font-bold uppercase text-slate-500 ml-1">Marca *</Label>
                                        <Input
                                            id="vehicleBrand"
                                            value={formData.vehicleBrand}
                                            onChange={(e) => handleInputChange('vehicleBrand', e.target.value)}
                                            placeholder="Ex: Honda"
                                            className="h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="vehicleYear" className="text-xs font-bold uppercase text-slate-500 ml-1">Ano</Label>
                                        <Input
                                            id="vehicleYear"
                                            type="number"
                                            value={formData.vehicleYear}
                                            onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                                            placeholder="2023"
                                            className="h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="vehicleVin" className="text-xs font-bold uppercase text-slate-500 ml-1">Chassi</Label>
                                        <Input
                                            id="vehicleVin"
                                            value={formData.vehicleVin}
                                            onChange={(e) => handleInputChange('vehicleVin', e.target.value.toUpperCase())}
                                            placeholder="VIN..."
                                            className="h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 uppercase"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Detalhes Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2.5 mb-2">
                                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                        <Wrench className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Detalhes do Serviço</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="km" className="text-xs font-bold uppercase text-slate-500 ml-1">Quilometragem (KM) *</Label>
                                        <Input
                                            id="km"
                                            type="number"
                                            value={formData.km}
                                            onChange={(e) => handleInputChange('km', e.target.value)}
                                            placeholder="0"
                                            className="h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="fuelLevel" className="text-xs font-bold uppercase text-slate-500 ml-1">Combustível (%)</Label>
                                        <div className="relative">
                                            <Input
                                                id="fuelLevel"
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={formData.fuelLevel}
                                                onChange={(e) => handleInputChange('fuelLevel', e.target.value)}
                                                className="h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 pr-12"
                                            />
                                            <span className="absolute right-4 top-3 text-sm font-bold text-slate-400">%</span>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <Label htmlFor="mechanic" className="text-xs font-bold uppercase text-slate-500 ml-1">Técnico Responsável</Label>
                                        <Input
                                            id="mechanic"
                                            value={formData.mechanic}
                                            onChange={(e) => handleInputChange('mechanic', e.target.value)}
                                            placeholder="Nome do mecânico (Opcional)"
                                            className="h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="clientReport" className="text-xs font-bold uppercase text-slate-500 ml-1">Relato do Cliente (Defeito/Solicitação) *</Label>
                                <Textarea
                                    id="clientReport"
                                    value={formData.clientReport}
                                    onChange={(e) => handleInputChange('clientReport', e.target.value)}
                                    placeholder="Descreva em detalhes o que o cliente relatou..."
                                    rows={4}
                                    className="resize-none rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4 leading-relaxed"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="observations" className="text-xs font-bold uppercase text-slate-500 ml-1">Observações Internas</Label>
                                <Textarea
                                    id="observations"
                                    value={formData.observations}
                                    onChange={(e) => handleInputChange('observations', e.target.value)}
                                    placeholder="Avarias pré-existentes, observações de checklist, etc..."
                                    rows={3}
                                    className="resize-none rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4 leading-relaxed"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 pt-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-3 sticky bottom-0 z-10">
                    {step === 2 ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep(1)}
                            disabled={loading}
                            className="h-12 rounded-xl px-6 border-slate-200 dark:border-slate-800 font-bold gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" /> Voltar
                        </Button>
                    ) : (
                        <div />
                    )}

                    {step === 1 ? (
                        <Button type="button" onClick={handleNext} className="h-12 rounded-xl px-8 font-black gap-2 bg-slate-900 hover:bg-slate-800 ml-auto">
                            Próximo <ArrowRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button type="button" onClick={handleSubmit} disabled={loading} className="h-12 rounded-xl px-8 font-black gap-2 bg-primary hover:bg-primary/90 ml-auto shadow-xl shadow-primary/20">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Criando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" /> Confirmar e Criar
                                </>
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
