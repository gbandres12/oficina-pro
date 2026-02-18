"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Calendar,
    User,
    Car,
    Plus,
    Trash2,
    FileText,
    Check,
    X,
    Printer,
    Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function NewQuotationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [client, setClient] = useState('');
    const [vehicle, setVehicle] = useState('');
    const [validity, setValidity] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]); // +7 days default
    const [observation, setObservation] = useState('');

    // Items State
    const [items, setItems] = useState([
        { id: 1, description: '', quantity: 1, price: 0 }
    ]);

    const addItem = () => {
        setItems([...items, { id: Date.now(), description: '', quantity: 1, price: 0 }]);
    };

    const removeItem = (id: number) => {
        if (items.length === 1) return;
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: number, field: string, value: any) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const calculateTotal = () => {
        return items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.price)), 0);
    };

    const handleSave = async (status: 'OPEN' | 'APPROVED' | 'QUOTATION' = 'QUOTATION') => {
        if (!client || !vehicle) {
            toast.error('Por favor, selecione o cliente e o veículo.');
            return;
        }

        setLoading(true);
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            // In real implementation: POST to /api/quotations
            toast.success(status === 'APPROVED' ? 'Orçamento aprovado e O.S. criada!' : 'Orçamento salvo com sucesso!');
            router.push('/orcamentos');
        } catch (error) {
            toast.error('Erro ao salvar orçamento.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Novo Orçamento</h1>
                    <p className="text-muted-foreground">Crie um novo orçamento para serviços.</p>
                </div>
                <Button variant="outline" onClick={() => router.back()}>
                    Cancelar
                </Button>
            </div>

            <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
                <CardContent className="p-8 space-y-8">
                    {/* Header Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-bold uppercase text-slate-500">Cliente</Label>
                            <Select value={client} onValueChange={setClient}>
                                <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-800 border-none">
                                    <SelectValue placeholder="Selecione o Cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">João da Silva</SelectItem>
                                    <SelectItem value="2">Maria Oliveira</SelectItem>
                                    <SelectItem value="3">Carlos Santos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold uppercase text-slate-500">Veículo</Label>
                            <Input
                                placeholder="Ex: Honda Civic 2020"
                                className="h-11 bg-slate-50 dark:bg-slate-800 border-none"
                                value={vehicle}
                                onChange={(e) => setVehicle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold uppercase text-slate-500">Validade</Label>
                            <Input
                                type="date"
                                className="h-11 bg-slate-50 dark:bg-slate-800 border-none"
                                value={validity}
                                onChange={(e) => setValidity(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-800" />

                    {/* Items Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">Itens do Orçamento</h3>
                            <Button size="sm" onClick={addItem} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                                <Plus className="w-4 h-4" /> Adicionar Item
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item) => (
                                <div key={item.id} className="flex flex-col md:flex-row gap-4 items-end bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex-1 space-y-2 w-full">
                                        <Label className="text-xs font-bold uppercase text-slate-500">Serviço / Peça</Label>
                                        <Input
                                            placeholder="Descrição do item"
                                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                            value={item.description}
                                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-24 space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-500">Qtd.</Label>
                                        <Input
                                            type="number"
                                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-center"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                                            min={1}
                                        />
                                    </div>
                                    <div className="w-32 space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-500">Valor Unit.</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                                            <Input
                                                type="number"
                                                className="pl-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-right"
                                                value={item.price}
                                                onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                                min={0}
                                                step={0.01}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="mb-0.5 shrink-0"
                                        onClick={() => removeItem(item.id)}
                                        disabled={items.length === 1}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-800" />

                    {/* Observations & Total */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-2">
                            <Label className="text-sm font-bold uppercase text-slate-500">Observações</Label>
                            <Textarea
                                placeholder="Detalhes adicionais, condições de pagamento, etc."
                                className="min-h-[120px] bg-slate-50 dark:bg-slate-800 border-none resize-none"
                                value={observation}
                                onChange={(e) => setObservation(e.target.value)}
                            />
                        </div>
                        <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4">
                            <div className="flex justify-between items-center text-slate-400">
                                <span>Subtotal</span>
                                <span>R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400">
                                <span>Desconto</span>
                                <span>R$ 0,00</span>
                            </div>
                            <div className="h-px bg-white/10" />
                            <div className="flex justify-between items-center font-black text-2xl">
                                <span>Total</span>
                                <span className="text-emerald-400">R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col md:flex-row justify-end gap-3 rounded-b-xl border-t">
                    <Button
                        variant="ghost"
                        className="gap-2 text-slate-500 hover:text-slate-900"
                        onClick={() => handleSave('QUOTATION')}
                    >
                        <Save className="w-4 h-4" /> Salvar Rascunho
                    </Button>
                    <Button
                        variant="outline"
                        className="gap-2 border-slate-300 text-slate-700 bg-white"
                        onClick={() => toast.info('Gerando PDF...')}
                    >
                        <Printer className="w-4 h-4" /> Gerar PDF
                    </Button>
                    <Button
                        variant="destructive"
                        className="gap-2"
                        onClick={() => router.push('/orcamentos')}
                    >
                        <X className="w-4 h-4" /> Rejeitar
                    </Button>
                    <Button
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-lg shadow-emerald-600/20"
                        onClick={() => handleSave('APPROVED')}
                    >
                        <Check className="w-4 h-4" /> Aprovar Orçamento
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
