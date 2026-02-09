"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ClipboardCheck,
    Car,
    Wrench,
    Droplets,
    Camera,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Save,
    ShieldAlert,
    Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

import InteractiveCarDiagram, { Point } from './InteractiveCarDiagram';
import VoiceInput from './VoiceInput';
import SignaturePad from './SignaturePad';

interface ChecklistItem {
    id: string;
    name: string;
    section: string;
    status: 'ok' | 'attention' | 'replace' | 'yes' | 'no' | 'none';
    observation?: string;
    photo?: string;
    isSafetyCritical?: boolean;
}

export default function ChecklistInteligente() {
    const [activeStep, setActiveStep] = useState(0);
    const [customerReport, setCustomerReport] = useState('');
    const [damagePoints, setDamagePoints] = useState<Point[]>([]);
    const [signature, setSignature] = useState<string | null>(null);

    const [items, setItems] = useState<ChecklistItem[]>([
        // Visual Section
        { id: 'v1', name: 'Lanternas', section: 'visual', status: 'none' },
        { id: 'v2', name: 'Retrovisor Esquerdo', section: 'visual', status: 'none' },
        { id: 'v3', name: 'Retrovisor Direito', section: 'visual', status: 'none' },
        { id: 'v4', name: 'Para-brisa', section: 'visual', status: 'none' },
        { id: 'v5', name: 'Faróis', section: 'visual', status: 'none' },

        // Mechanical & Fluids
        { id: 'm1', name: 'Vazamento de Óleo', section: 'mechanical', status: 'none' },
        { id: 'm2', name: 'Vazamento de Água', section: 'mechanical', status: 'none' },
        { id: 'm3', name: 'Suspensão Dianteira', section: 'mechanical', status: 'none' },
        { id: 'm4', name: 'Suspensão Traseira', section: 'mechanical', status: 'none' },
        { id: 'm5', name: 'Freios', section: 'mechanical', status: 'none', isSafetyCritical: true },
        { id: 'm6', name: 'Óleo de Câmbio', section: 'mechanical', status: 'none' },
        { id: 'm7', name: 'Rolamentos', section: 'mechanical', status: 'none' },
        { id: 'm8', name: 'Correia Alternador', section: 'mechanical', status: 'none' },
        { id: 'm9', name: 'Correia Distribuição', section: 'mechanical', status: 'none' },
        { id: 'm10', name: 'Correia Ar Condicionado', section: 'mechanical', status: 'none' },
    ]);

    const updateItemStatus = (id: string, status: ChecklistItem['status']) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
    };

    const updateObservation = (id: string, observation: string) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, observation } : item));
    };

    const isStepComplete = (section: string) => {
        return items.filter(item => item.section === section).every(item => item.status !== 'none');
    };

    const handleFinish = () => {
        const safetyItemNotChecked = items.some(item => item.isSafetyCritical && item.status === 'none');
        if (safetyItemNotChecked) {
            toast.error("Erro de Segurança", {
                description: "Itens de segurança crítica (como Freios) devem ser verificados obrigatoriamente.",
            });
            return;
        }

        const incomplete = items.some(item => item.status === 'none');
        if (incomplete && !signature) {
            toast.warning("Checklist Incompleto", {
                description: "Por favor, preencha todos os itens e capture a assinatura.",
            });
            return;
        }

        toast.success("Checklist Finalizado!", {
            description: "Os dados foram salvos e o orçamento preliminar foi gerado.",
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            {/* Header Motivacional */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Checklist Inteligente</h1>
                    <p className="text-sm text-muted-foreground font-medium">Andres Oficina • Protocolo de Entrada</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-background">ID: #OS-2024-001</Badge>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        Sincronizado
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Dados do Veículo */}
                    <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-none dark:border">
                        <CardHeader className="bg-slate-50 dark:bg-slate-900/50">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Car className="w-5 h-5 text-primary" /> Dados do Recebimento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Data</Label>
                                <Input defaultValue="09/02/2026" readOnly className="bg-muted/30" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Mecânico</Label>
                                <Input placeholder="Nome do Mecânico" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Placa/KM</Label>
                                <Input placeholder="ABC-1234 / 85.000" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Combustível</Label>
                                <Input type="number" placeholder="%" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Checklist Interativo */}
                    <Accordion type="single" collapsible className="space-y-4">
                        {/* Inspeção Visual */}
                        <AccordionItem value="visual" className="border rounded-xl overflow-hidden shadow-sm px-0">
                            <AccordionTrigger className="hover:no-underline px-6 py-4 bg-slate-50 dark:bg-slate-900/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                        <ClipboardCheck className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold">Inspeção Visual</div>
                                        <div className="text-xs text-muted-foreground">Faróis, Lanternas, Cristais</div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-6 space-y-4">
                                <div className="grid gap-6">
                                    {items.filter(i => i.section === 'visual').map(item => (
                                        <div key={item.id} className="group flex flex-col gap-3 p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors">
                                            <div className="flex justify-between items-center">
                                                <Label className="font-semibold text-base">{item.name}</Label>
                                                <div className="flex gap-1.5">
                                                    <Button
                                                        variant={item.status === 'ok' ? 'default' : 'outline'}
                                                        size="sm"
                                                        className={item.status === 'ok' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                                                        onClick={() => updateItemStatus(item.id, 'ok')}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant={item.status === 'attention' ? 'default' : 'outline'}
                                                        size="sm"
                                                        className={item.status === 'attention' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                                                        onClick={() => updateItemStatus(item.id, 'attention')}
                                                    >
                                                        <AlertCircle className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant={item.status === 'replace' ? 'default' : 'outline'}
                                                        size="sm"
                                                        className={item.status === 'replace' ? 'bg-red-500 hover:bg-red-600' : ''}
                                                        onClick={() => updateItemStatus(item.id, 'replace')}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Observação rápida..."
                                                    className="h-9 text-sm"
                                                    value={item.observation || ''}
                                                    onChange={(e) => updateObservation(item.id, e.target.value)}
                                                />
                                                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                                                    <Camera className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            {(item.status === 'replace' || item.status === 'attention') && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                                    className="flex items-center gap-2 text-[11px] font-bold text-primary bg-primary/10 px-2 py-1 rounded w-fit"
                                                >
                                                    <Wrench className="w-3 h-3" /> Sugestão: Adicionar troca de {item.name} ao orçamento
                                                </motion.div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Mecânica e Fluidos */}
                        <AccordionItem value="mechanical" className="border rounded-xl overflow-hidden shadow-sm px-0">
                            <AccordionTrigger className="hover:no-underline px-6 py-4 bg-slate-50 dark:bg-slate-900/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                                        <Droplets className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold font-montserrat">Mecânica e Fluidos</div>
                                        <div className="text-xs text-muted-foreground">Vazamentos, Suspensão, Freios, Correias</div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-6 space-y-4">
                                <div className="space-y-4">
                                    {items.filter(i => i.section === 'mechanical').map(item => (
                                        <div key={item.id} className="flex flex-col gap-3 p-4 rounded-xl border bg-card/50">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <Label className="font-semibold">{item.name}</Label>
                                                    {item.isSafetyCritical && (
                                                        <Badge variant="destructive" className="text-[8px] h-4 px-1 animate-pulse">CRÍTICO</Badge>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant={item.status === 'yes' ? 'default' : 'outline'}
                                                        size="sm"
                                                        className={item.status === 'yes' ? 'bg-red-500' : ''}
                                                        onClick={() => updateItemStatus(item.id, 'yes')}
                                                    >
                                                        Sim
                                                    </Button>
                                                    <Button
                                                        variant={item.status === 'no' ? 'default' : 'outline'}
                                                        size="sm"
                                                        className={item.status === 'no' ? 'bg-emerald-500' : ''}
                                                        onClick={() => updateItemStatus(item.id, 'no')}
                                                    >
                                                        Não
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-medium">
                                                {item.name.includes('Vazamento') ? 'Apresenta vazamento visível?' : 'Apresenta folga ou ruído excessivo?'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    {/* Gráfico de Avarias Externas */}
                    <Card className="border-none shadow-xl overflow-hidden">
                        <CardHeader className="bg-slate-50 dark:bg-slate-900/50">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-red-500" /> Avarias de Funilaria
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <InteractiveCarDiagram
                                points={damagePoints}
                                onAddPoint={(p) => setDamagePoints([...damagePoints, p])}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Relato do Cliente - Voice powered */}
                    <Card className="sticky top-6">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-base text-primary/70 uppercase tracking-widest text-[11px] font-bold">Relato do Cliente</CardTitle>
                                <VoiceInput onResult={(text) => setCustomerReport(prev => prev + ' ' + text)} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <textarea
                                className="w-full h-40 bg-muted/20 rounded-lg p-4 text-sm resize-none border-none focus:ring-1 ring-primary/30"
                                placeholder="Descreva o problema relatado..."
                                value={customerReport}
                                onChange={(e) => setCustomerReport(e.target.value)}
                            />
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground p-2 bg-blue-50/50 dark:bg-blue-900/10 rounded">
                                <Info className="w-3 h-3 text-blue-500" />
                                Dica: Use o microfone para ditar enquanto inspeciona.
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assinatura Digital */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base text-primary/70 uppercase tracking-widest text-[11px] font-bold">Conformidade e Assinatura</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SignaturePad onSave={(url) => setSignature(url)} />
                            {signature && (
                                <div className="mt-4 p-2 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-md">
                                    <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold uppercase">
                                        <CheckCircle2 className="w-3 h-3" /> Assinatura Capturada
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Botão Finalizar */}
                    <Button
                        className="w-full h-16 text-lg font-bold shadow-2xl shadow-primary/20 group relative overflow-hidden"
                        size="lg"
                        onClick={handleFinish}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 transition-transform group-hover:scale-110" />
                        <span className="relative flex items-center gap-2">
                            <Save className="w-5 h-5" /> Finalizar Protocolo
                        </span>
                    </Button>
                </div>
            </div>

            {/* Footer Motivacional Fixo (Simulated as bottom static) */}
            <div className="pt-10 pb-6 text-center border-t border-dashed">
                <div className="inline-flex flex-col items-center gap-2 max-w-md">
                    <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground border-dashed">DIRETRIZES ANDRES OFICINA</Badge>
                    <p className="text-sm font-semibold italic text-slate-500 dark:text-slate-400">
                        &quot;A satisfação do cliente depende de você. Não esqueça que são vidas conduzindo esse veículo.&quot;
                    </p>
                </div>
            </div>
        </div>
    );
}
