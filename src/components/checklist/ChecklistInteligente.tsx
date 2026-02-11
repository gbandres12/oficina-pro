"use client";

import React, { useMemo, useState } from 'react';
import {
    AlertCircle,
    Camera,
    CheckCircle2,
    ClipboardCheck,
    Droplets,
    Info,
    Save,
    ShieldAlert,
    Wrench,
    XCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import InteractiveCarDiagram, { Point } from './InteractiveCarDiagram';
import SignaturePad from './SignaturePad';
import VoiceInput from './VoiceInput';

interface ChecklistItem {
    id: string;
    name: string;
    section: 'visual' | 'mechanical';
    status: 'ok' | 'attention' | 'replace' | 'yes' | 'no' | 'none';
    observation?: string;
    isSafetyCritical?: boolean;
}

const INITIAL_ITEMS: ChecklistItem[] = [
    { id: 'v1', name: 'Lanternas', section: 'visual', status: 'none' },
    { id: 'v2', name: 'Retrovisor esquerdo', section: 'visual', status: 'none' },
    { id: 'v3', name: 'Retrovisor direito', section: 'visual', status: 'none' },
    { id: 'v4', name: 'Para-brisa', section: 'visual', status: 'none' },
    { id: 'v5', name: 'Faróis', section: 'visual', status: 'none' },
    { id: 'm1', name: 'Vazamento de óleo', section: 'mechanical', status: 'none' },
    { id: 'm2', name: 'Vazamento de água', section: 'mechanical', status: 'none' },
    { id: 'm3', name: 'Suspensão dianteira', section: 'mechanical', status: 'none' },
    { id: 'm4', name: 'Suspensão traseira', section: 'mechanical', status: 'none' },
    { id: 'm5', name: 'Freios', section: 'mechanical', status: 'none', isSafetyCritical: true },
];

export default function ChecklistInteligente() {
    const [items, setItems] = useState<ChecklistItem[]>(INITIAL_ITEMS);
    const [damagePoints, setDamagePoints] = useState<Point[]>([]);
    const [customerReport, setCustomerReport] = useState('');
    const [signature, setSignature] = useState<string | null>(null);

    const [ownerName, setOwnerName] = useState('');
    const [model, setModel] = useState('');
    const [km, setKm] = useState('');
    const [isNewCar, setIsNewCar] = useState(false);
    const [plateOrChassis, setPlateOrChassis] = useState('');

    const visualItems = useMemo(() => items.filter((item) => item.section === 'visual'), [items]);
    const mechanicalItems = useMemo(() => items.filter((item) => item.section === 'mechanical'), [items]);

    const updateItemStatus = (id: string, status: ChecklistItem['status']) => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    };

    const updateObservation = (id: string, observation: string) => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, observation } : item)));
    };

    const resetChecklist = () => {
        setItems(INITIAL_ITEMS);
        setDamagePoints([]);
        setCustomerReport('');
        setSignature(null);
        setOwnerName('');
        setModel('');
        setKm('');
        setIsNewCar(false);
        setPlateOrChassis('');
    };

    const handleFinish = () => {
        if (!ownerName || !model || !plateOrChassis.trim()) {
            toast.error('Preencha os dados principais do veículo e proprietário.');
            return;
        }

        if (!isNewCar && !/^[A-Z0-9-]{6,8}$/i.test(plateOrChassis.trim())) {
            toast.error('Informe uma placa válida para veículos usados.');
            return;
        }

        const safetyItemNotChecked = items.some((item) => item.isSafetyCritical && item.status === 'none');
        if (safetyItemNotChecked) {
            toast.error('Itens críticos precisam ser verificados antes de finalizar.');
            return;
        }

        const hasIncompleteItems = items.some((item) => item.status === 'none');
        if (hasIncompleteItems) {
            toast.warning('Checklist ainda possui itens sem avaliação.');
            return;
        }

        if (!signature) {
            toast.warning('Capture a assinatura antes de finalizar.');
            return;
        }

        toast.success('Checklist finalizado com sucesso!');
        resetChecklist();
    };

    return (
        <div className="space-y-5">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-xl">Checklist de entrada</CardTitle>
                    <p className="text-sm text-muted-foreground">Layout simplificado para execução rápida e sem poluição visual.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>Proprietário</Label>
                            <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Nome do cliente" />
                        </div>
                        <div className="space-y-2">
                            <Label>Modelo</Label>
                            <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Ex.: Corolla XEI" />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-3 items-end">
                        <div className="space-y-2 md:col-span-2">
                            <Label>{isNewCar ? 'Chassi (veículo novo)' : 'Placa'}</Label>
                            <Input
                                value={plateOrChassis}
                                onChange={(e) => setPlateOrChassis(e.target.value.toUpperCase())}
                                placeholder={isNewCar ? 'Número do chassi' : 'ABC1D23'}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>KM</Label>
                            <Input value={km} onChange={(e) => setKm(e.target.value)} placeholder="0" type="number" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-md border p-3">
                        <Checkbox checked={isNewCar} onCheckedChange={(checked) => setIsNewCar(Boolean(checked))} id="new-car" />
                        <Label htmlFor="new-car" className="cursor-pointer">Este é um carro novo (sem placa)</Label>
                    </div>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    <Accordion type="multiple" defaultValue={["visual", "mechanical"]} className="space-y-3">
                        <AccordionItem value="visual" className="border rounded-lg px-0 overflow-hidden">
                            <AccordionTrigger className="px-4 py-3 bg-muted/30 hover:no-underline">
                                <div className="flex items-center gap-2 font-medium">
                                    <ClipboardCheck className="w-4 h-4" /> Inspeção visual
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 space-y-3">
                                {visualItems.map((item) => (
                                    <div key={item.id} className="rounded-md border p-3 space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <Label className="font-medium">{item.name}</Label>
                                            <div className="flex gap-1">
                                                <Button size="sm" variant={item.status === 'ok' ? 'default' : 'outline'} onClick={() => updateItemStatus(item.id, 'ok')}>
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant={item.status === 'attention' ? 'default' : 'outline'} onClick={() => updateItemStatus(item.id, 'attention')}>
                                                    <AlertCircle className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant={item.status === 'replace' ? 'destructive' : 'outline'} onClick={() => updateItemStatus(item.id, 'replace')}>
                                                    <XCircle className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input value={item.observation ?? ''} onChange={(e) => updateObservation(item.id, e.target.value)} placeholder="Observações" />
                                            <Button size="icon" variant="outline" aria-label="Adicionar foto">
                                                <Camera className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        {(item.status === 'attention' || item.status === 'replace') && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-xs rounded bg-primary/10 text-primary px-2 py-1 inline-flex items-center gap-1"
                                            >
                                                <Wrench className="w-3 h-3" /> Recomendado incluir no orçamento
                                            </motion.p>
                                        )}
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="mechanical" className="border rounded-lg px-0 overflow-hidden">
                            <AccordionTrigger className="px-4 py-3 bg-muted/30 hover:no-underline">
                                <div className="flex items-center gap-2 font-medium">
                                    <Droplets className="w-4 h-4" /> Mecânica e fluidos
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 space-y-3">
                                {mechanicalItems.map((item) => (
                                    <div key={item.id} className="rounded-md border p-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <Label className="font-medium">{item.name}</Label>
                                                {item.isSafetyCritical && <Badge variant="destructive">Crítico</Badge>}
                                            </div>
                                            <div className="flex gap-1">
                                                <Button size="sm" variant={item.status === 'yes' ? 'destructive' : 'outline'} onClick={() => updateItemStatus(item.id, 'yes')}>Sim</Button>
                                                <Button size="sm" variant={item.status === 'no' ? 'default' : 'outline'} onClick={() => updateItemStatus(item.id, 'no')}>Não</Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-500" /> Avarias</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <InteractiveCarDiagram points={damagePoints} onAddPoint={(point) => setDamagePoints((prev) => [...prev, point])} />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Relato do cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-end">
                                <VoiceInput onResult={(text) => setCustomerReport((prev) => `${prev} ${text}`.trim())} label="Ditar" />
                            </div>
                            <textarea
                                className="w-full h-36 rounded-md border bg-background p-3 text-sm resize-none"
                                value={customerReport}
                                onChange={(e) => setCustomerReport(e.target.value)}
                                placeholder="Descreva o relato do cliente"
                            />
                            <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                                <Info className="w-3 h-3" /> O relato ajuda no diagnóstico inicial.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Assinatura</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <SignaturePad onSave={setSignature} />
                            {signature && <Badge className="bg-emerald-600">Assinatura capturada</Badge>}
                        </CardContent>
                    </Card>

                    <Button className="w-full gap-2" onClick={handleFinish}>
                        <Save className="w-4 h-4" /> Finalizar checklist
                    </Button>
                </div>
            </div>
        </div>
    );
}
