"use client";

import React, { useState, useEffect } from 'react';
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
import { toast } from "sonner";
import { Loader2, Car, User, Search } from "lucide-react";

interface Client {
    id: string;
    name: string;
    phone: string;
}

interface CreateVehicleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function CreateVehicleDialog({ open, onOpenChange, onSuccess }: CreateVehicleDialogProps) {
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [clientSearch, setClientSearch] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isSearchingClients, setIsSearchingClients] = useState(false);

    const [formData, setFormData] = useState({
        plate: '',
        model: '',
        brand: '',
        year: '',
        vin: '',
    });

    useEffect(() => {
        if (clientSearch.length >= 3) {
            const delayDebounceFn = setTimeout(() => {
                searchClients(clientSearch);
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setClients([]);
        }
    }, [clientSearch]);

    const searchClients = async (query: string) => {
        setIsSearchingClients(true);
        try {
            const response = await fetch(`/api/clients?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data.success) {
                setClients(data.clients);
            }
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
        } finally {
            setIsSearchingClients(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!selectedClient) {
            toast.error("Selecione um proprietário para o veículo");
            return;
        }
        if (!formData.plate || !formData.model || !formData.brand) {
            toast.error("Preencha placa, modelo e marca");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/vehicles/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    clientId: selectedClient.id,
                    year: formData.year ? parseInt(formData.year) : null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao cadastrar veículo');
            }

            toast.success("Veículo vinculado com sucesso!");
            onOpenChange(false);
            onSuccess?.();

            // Reset
            setFormData({ plate: '', model: '', brand: '', year: '', vin: '' });
            setSelectedClient(null);
            setClientSearch('');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Erro ao cadastrar veículo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                        <Car className="w-6 h-6 text-orange-500" />
                        Vincular Veículo
                    </DialogTitle>
                    <DialogDescription>
                        Cadastre um novo veículo e vincule-o a um cliente existente.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Busca de Cliente */}
                    <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Proprietário</Label>
                        {selectedClient ? (
                            <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-800 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500 text-white rounded-lg">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">{selectedClient.name}</div>
                                        <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">{selectedClient.phone}</div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/40 font-bold text-xs"
                                    onClick={() => setSelectedClient(null)}
                                >
                                    Alterar
                                </Button>
                            </div>
                        ) : (
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                <Input
                                    placeholder="Buscar cliente (nome ou telefone)..."
                                    className="pl-11 h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 focus:ring-2 focus:ring-orange-500/20"
                                    value={clientSearch}
                                    onChange={(e) => setClientSearch(e.target.value)}
                                />
                                {isSearchingClients && (
                                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
                                )}

                                {clients.length > 0 && !selectedClient && (
                                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-[200px] overflow-y-auto">
                                        {clients.map(client => (
                                            <button
                                                key={client.id}
                                                className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b last:border-none border-slate-100 dark:border-slate-800"
                                                onClick={() => {
                                                    setSelectedClient(client);
                                                    setClients([]);
                                                }}
                                            >
                                                <div className="font-bold text-sm text-slate-900 dark:text-white">{client.name}</div>
                                                <div className="text-xs text-slate-500">{client.phone}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-800" />

                    {/* Dados do Veículo */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Placa *</Label>
                            <Input
                                value={formData.plate}
                                onChange={(e) => handleInputChange('plate', e.target.value.toUpperCase())}
                                placeholder="ABC-1234"
                                className="h-12 rounded-xl uppercase font-mono font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Chassi (VIN)</Label>
                            <Input
                                value={formData.vin}
                                onChange={(e) => handleInputChange('vin', e.target.value.toUpperCase())}
                                placeholder="Opcional"
                                className="h-12 rounded-xl uppercase font-mono text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Marca *</Label>
                            <Input
                                value={formData.brand}
                                onChange={(e) => handleInputChange('brand', e.target.value)}
                                placeholder="Ex: Honda"
                                className="h-12 rounded-xl font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Modelo *</Label>
                            <Input
                                value={formData.model}
                                onChange={(e) => handleInputChange('model', e.target.value)}
                                placeholder="Ex: Civic Touring"
                                className="h-12 rounded-xl font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Ano</Label>
                            <Input
                                type="number"
                                value={formData.year}
                                onChange={(e) => handleInputChange('year', e.target.value)}
                                placeholder="Ex: 2023"
                                className="h-12 rounded-xl font-bold"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        className="w-full h-12 rounded-xl font-black bg-orange-600 hover:bg-orange-700 text-white shadow-xl shadow-orange-900/10 gap-2 border-b-4 border-orange-800 transition-all active:scale-95 active:border-b-0"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar Vínculo"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
