"use client";

import React from 'react';
import { Car, ClipboardList, Plus, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ChecklistInteligente from '@/components/checklist/ChecklistInteligente';

export default function DashboardPage() {
    const [view, setView] = React.useState<'dashboard' | 'checklist'>('dashboard');

    if (view === 'checklist') {
        return (
            <div className="p-4 md:p-6 space-y-4 max-w-6xl mx-auto">
                <Button variant="ghost" onClick={() => setView('dashboard')}>
                    ← Voltar ao Dashboard
                </Button>
                <ChecklistInteligente />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Ambiente limpo para iniciar seus testes e cadastros reais.</p>
                </div>
                <Button className="gap-2" onClick={() => setView('checklist')}>
                    <Plus className="w-4 h-4" /> Novo Checklist
                </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Veículos no pátio</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-bold">0</CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ordens em andamento</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-bold">0</CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Alertas</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-bold">0</CardContent>
                </Card>
            </div>

            <Card className="border-dashed">
                <CardContent className="py-10">
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className="flex items-center gap-2 text-primary">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-wide font-semibold">Sistema inicializado</span>
                        </div>
                        <h2 className="text-xl font-semibold">Sem dados carregados</h2>
                        <CardDescription className="max-w-xl">
                            O sistema foi limpo para facilitar seus testes de login, senha e fluxos de cadastro. Comece criando um checklist ou cadastrando clientes e veículos.
                        </CardDescription>
                        <div className="flex gap-2 pt-2">
                            <Button variant="outline" className="gap-2" onClick={() => setView('checklist')}>
                                <ClipboardList className="w-4 h-4" /> Iniciar checklist
                            </Button>
                            <Button variant="outline" className="gap-2" asChild>
                                <a href="/veiculos">
                                    <Car className="w-4 h-4" /> Cadastrar veículo
                                </a>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
