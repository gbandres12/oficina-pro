"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateLegacyOrderDialog({ open, onOpenChange, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        legacyNumber: '',
        entryDate: new Date().toISOString().substring(0, 10),
        clientName: '',
        vehiclePlate: '',
        totalValue: '',
        paidValue: '',
        status: 'FINISHED',
        observations: ''
    });

    const pendingValue = (Number(formData.totalValue) || 0) - (Number(formData.paidValue) || 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.legacyNumber || !formData.clientName || !formData.vehiclePlate) {
            return toast.error('Preencha todos os campos obrigatórios.');
        }

        setLoading(true);
        try {
            const res = await fetch('/api/service-orders/legacy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    legacyNumber: formData.legacyNumber,
                    entryDate: new Date(formData.entryDate).toISOString(),
                    clientName: formData.clientName,
                    vehiclePlate: formData.vehiclePlate,
                    totalValue: Number(formData.totalValue) || 0,
                    paidValue: Number(formData.paidValue) || 0,
                    status: formData.status,
                    observations: formData.observations
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.success('O.S. Legada cadastrada com sucesso!');
                onSuccess();
                onOpenChange(false);
                setFormData({
                    legacyNumber: '',
                    entryDate: new Date().toISOString().substring(0, 10),
                    clientName: '',
                    vehiclePlate: '',
                    totalValue: '',
                    paidValue: '',
                    status: 'FINISHED',
                    observations: ''
                });
            } else {
                toast.error(data.error || 'Erro ao cadastrar OS Legada');
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro de conexão ao salvar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] rounded-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nova O.S. Histórica</DialogTitle>
                    <DialogDescription>Cadastre manualmente uma ordem de serviço do sistema antigo.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Nº da O.S. (Antigo)</label>
                            <Input
                                required
                                value={formData.legacyNumber}
                                onChange={(e) => setFormData({ ...formData, legacyNumber: e.target.value })}
                                placeholder="Ex: 1005"
                                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Data (Abertura/Fechamento)</label>
                            <Input
                                type="date"
                                required
                                value={formData.entryDate}
                                onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Nome do Cliente</label>
                            <Input
                                required
                                value={formData.clientName}
                                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                placeholder="João Silva"
                                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Placa do Veículo (Opcional)</label>
                            <Input
                                value={formData.vehiclePlate}
                                onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                                placeholder="ABC1234"
                                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 uppercase"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Valor Total (R$)</label>
                            <Input
                                type="number"
                                step="any"
                                required
                                value={formData.totalValue}
                                onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                                placeholder="0.00"
                                className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Valor Pago (R$)</label>
                            <Input
                                type="number"
                                step="any"
                                required
                                value={formData.paidValue}
                                onChange={(e) => setFormData({ ...formData, paidValue: e.target.value })}
                                placeholder="0.00"
                                className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold opacity-70">Pendente (Calc)</label>
                            <div className={`flex items-center h-11 px-3 rounded-xl font-bold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 ${pendingValue > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                R$ {pendingValue.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold">Status do Sistema Antigo</label>
                        <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                            <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="OPEN">Aberta / Pendente</SelectItem>
                                <SelectItem value="QUOTATION">Orçamento</SelectItem>
                                <SelectItem value="FINISHED">Finalizada / Entregue</SelectItem>
                                <SelectItem value="CANCELLED">Cancelada</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold">Observações</label>
                        <Textarea
                            value={formData.observations}
                            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                            placeholder="Anotações gerais..."
                            className="min-h-[100px] rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-11 px-6">Cancelar</Button>
                        <Button type="submit" disabled={loading} className="rounded-xl h-11 px-8 font-bold bg-slate-900 text-white border-b-4 border-slate-950">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Salvar OS Legada
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
