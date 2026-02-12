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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CreatePartDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreatePartDialog({ open, onOpenChange, onSuccess }: CreatePartDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        price: '',
        stock: '',
        minStock: '',
        unit: 'Un',
        category: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/parts/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                    minStock: parseInt(formData.minStock)
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao criar peça');
            }

            toast.success('Peça criada com sucesso!');
            onSuccess();
            onOpenChange(false);
            setFormData({
                name: '',
                sku: '',
                price: '',
                stock: '',
                minStock: '',
                unit: 'Un',
                category: ''
            });
        } catch (error) {
            toast.error('Erro ao criar peça. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nova Peça</DialogTitle>
                    <DialogDescription>
                        Adicione uma nova peça ao estoque. Campos com * são obrigatórios.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome da Peça *</Label>
                            <Input
                                id="name"
                                placeholder="Ex: Filtro de Óleo Mann PH5548"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="sku">SKU *</Label>
                                <Input
                                    id="sku"
                                    placeholder="FIL-PH5548"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="category">Categoria</Label>
                                <Input
                                    id="category"
                                    placeholder="Ex: Filtros"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price">Preço (R$) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="unit">Unidade</Label>
                                <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                                    <SelectTrigger id="unit">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Un">Unidade</SelectItem>
                                        <SelectItem value="Par">Par</SelectItem>
                                        <SelectItem value="L">Litro</SelectItem>
                                        <SelectItem value="Kg">Quilograma</SelectItem>
                                        <SelectItem value="m">Metro</SelectItem>
                                        <SelectItem value="Cx">Caixa</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="stock">Estoque Inicial *</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    placeholder="0"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="minStock">Estoque Mínimo *</Label>
                                <Input
                                    id="minStock"
                                    type="number"
                                    placeholder="0"
                                    value={formData.minStock}
                                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                                    required
                                />
                            </div>
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
                            Criar Peça
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
