"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Building2, Package, Wrench, Settings, Building } from 'lucide-react';
import { SupplierType, SUPPLIER_TYPE_LABELS, SUPPLIER_TYPE_DESCRIPTIONS, BRAZILIAN_STATES } from '@/types/supplier';

interface CreateSupplierDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateSupplierDialog({ open, onOpenChange, onSuccess }: CreateSupplierDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        tradeName: '',
        document: '',
        email: '',
        phone: '',
        whatsapp: '',
        type: '' as SupplierType | '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        contactPerson: '',
        notes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.phone || !formData.type) {
            toast.error('Preencha os campos obrigatórios');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/suppliers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Fornecedor cadastrado com sucesso!');
                onSuccess();
                onOpenChange(false);
                resetForm();
            } else {
                toast.error(data.error || 'Erro ao cadastrar fornecedor');
            }
        } catch (error) {
            console.error('Error creating supplier:', error);
            toast.error('Erro ao conectar com o servidor');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            tradeName: '',
            document: '',
            email: '',
            phone: '',
            whatsapp: '',
            type: '' as SupplierType | '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            contactPerson: '',
            notes: ''
        });
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    };

    const formatDocument = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            // CPF
            return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        // CNPJ
        return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    };

    const formatZipCode = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
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
            default:
                return <Building2 className="w-4 h-4" />;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Building2 className="w-6 h-6" />
                        </div>
                        Novo Fornecedor
                    </DialogTitle>
                    <DialogDescription>
                        Cadastre fornecedores de peças, oficinas parceiras, retíficas e outros serviços
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tipo de Fornecedor */}
                    <div className="space-y-2">
                        <Label htmlFor="type" className="text-sm font-semibold">
                            Tipo de Fornecedor <span className="text-red-500">*</span>
                        </Label>
                        <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(SupplierType).map((type) => (
                                    <SelectItem key={type} value={type}>
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(type)}
                                            <div>
                                                <div className="font-medium">{SUPPLIER_TYPE_LABELS[type]}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {SUPPLIER_TYPE_DESCRIPTIONS[type]}
                                                </div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Informações Básicas */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Informações Básicas
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Razão Social / Nome <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="Ex: Auto Peças Silva Ltda"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tradeName">Nome Fantasia</Label>
                                <Input
                                    id="tradeName"
                                    value={formData.tradeName}
                                    onChange={(e) => handleChange('tradeName', e.target.value)}
                                    placeholder="Ex: Silva Auto Parts"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="document">CNPJ / CPF</Label>
                                <Input
                                    id="document"
                                    value={formData.document}
                                    onChange={(e) => handleChange('document', formatDocument(e.target.value))}
                                    placeholder="00.000.000/0000-00"
                                    maxLength={18}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactPerson">Pessoa de Contato</Label>
                                <Input
                                    id="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={(e) => handleChange('contactPerson', e.target.value)}
                                    placeholder="Ex: João Silva"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contato */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Contato
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">
                                    Telefone <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
                                    placeholder="(00) 00000-0000"
                                    maxLength={15}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp">WhatsApp</Label>
                                <Input
                                    id="whatsapp"
                                    value={formData.whatsapp}
                                    onChange={(e) => handleChange('whatsapp', formatPhone(e.target.value))}
                                    placeholder="(00) 00000-0000"
                                    maxLength={15}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder="contato@fornecedor.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Endereço */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Endereço
                        </h3>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-1 space-y-2">
                                <Label htmlFor="zipCode">CEP</Label>
                                <Input
                                    id="zipCode"
                                    value={formData.zipCode}
                                    onChange={(e) => handleChange('zipCode', formatZipCode(e.target.value))}
                                    placeholder="00000-000"
                                    maxLength={9}
                                />
                            </div>
                            <div className="col-span-3 space-y-2">
                                <Label htmlFor="address">Endereço Completo</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    placeholder="Rua, número, bairro"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="city">Cidade</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => handleChange('city', e.target.value)}
                                    placeholder="Ex: São Paulo"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">Estado</Label>
                                <Select value={formData.state} onValueChange={(value) => handleChange('state', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="UF" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BRAZILIAN_STATES.map((state) => (
                                            <SelectItem key={state.value} value={state.value}>
                                                {state.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Observações */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Informações adicionais sobre o fornecedor..."
                            rows={3}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="gap-2">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Cadastrar Fornecedor
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
