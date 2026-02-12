"use client";

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CreateClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateClientDialog({ open, onOpenChange, onSuccess }: CreateClientDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        cnpj: '',
        address: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/clients/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Erro ao criar cliente');
            }

            toast.success('Cliente criado com sucesso!');
            onSuccess();
            onOpenChange(false);
            setFormData({
                name: '',
                email: '',
                phone: '',
                cpf: '',
                cnpj: '',
                address: ''
            });
        } catch (error) {
            toast.error('Erro ao criar cliente. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Novo Cliente</DialogTitle>
                    <DialogDescription>
                        Preencha os dados do cliente. Campos com * são obrigatórios.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome *</Label>
                            <Input
                                id="name"
                                placeholder="Nome completo ou razão social"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Telefone *</Label>
                            <Input
                                id="phone"
                                placeholder="(11) 99999-9999"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="cliente@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="cpf">CPF</Label>
                                <Input
                                    id="cpf"
                                    placeholder="000.000.000-00"
                                    value={formData.cpf}
                                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cnpj">CNPJ</Label>
                                <Input
                                    id="cnpj"
                                    placeholder="00.000.000/0000-00"
                                    value={formData.cnpj}
                                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Endereço</Label>
                            <Input
                                id="address"
                                placeholder="Rua, número, bairro, cidade"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Criar Cliente
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
