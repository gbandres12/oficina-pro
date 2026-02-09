"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Shield,
    Mail,
    Lock,
    Trash2,
    CheckCircle2,
    ShieldAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

export default function UsuariosPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'EMPLOYEE'
    });

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Usuário criado com sucesso!');
                setFormData({ name: '', email: '', password: '', role: 'EMPLOYEE' });
                fetchUsers();
            } else {
                const error = await res.json();
                toast.error(error.error || 'Erro ao criar usuário');
            }
        } catch (error) {
            toast.error('Ocorreu um erro inesperado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">Acesso Master</h1>
                    <p className="text-muted-foreground font-medium">Gestão de acessos e permissões do sistema.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <Card className="border-none shadow-xl h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-primary" /> Novo Operador
                        </CardTitle>
                        <CardDescription>Cadastre um novo usuário para operar o sistema.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: Pedro Checklist"
                                    className="rounded-xl h-11"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail de Acesso</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="pedro@oficina.com"
                                        className="pl-10 rounded-xl h-11"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Nível de Acesso</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(val) => setFormData({ ...formData, role: val })}
                                >
                                    <SelectTrigger className="rounded-xl h-11">
                                        <SelectValue placeholder="Selecione o cargo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ADMIN">Administrador (Master)</SelectItem>
                                        <SelectItem value="EMPLOYEE">Checklist / Funcionário</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha Temporária</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 rounded-xl h-11"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <Button className="w-full h-12 rounded-xl font-bold uppercase text-xs tracking-widest gap-2 shadow-lg shadow-primary/20" disabled={loading}>
                                <CheckCircle2 className="w-4 h-4" /> Finalizar Cadastro
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* List Column */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <h2 className="font-bold text-slate-700 dark:text-slate-300">Operadores Ativos ({users.length})</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {users.map((user) => (
                            <Card key={user.id} className="border-none shadow-lg hover:shadow-xl transition-all border-l-4 overflow-hidden" style={{ borderLeftColor: user.role === 'ADMIN' ? '#3b82f6' : '#10b981' }}>
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm flex items-center gap-2">
                                                {user.name}
                                                {user.role === 'ADMIN' ? (
                                                    <Shield size={12} className="text-blue-500" />
                                                ) : (
                                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                                )}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground lowercase">{user.email}</div>
                                            <div className="mt-1">
                                                <Badge className={
                                                    user.role === 'ADMIN'
                                                        ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                                        : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                } variant="outline" style={{ fontSize: '8px' }}>
                                                    {user.role}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {users.length === 0 && (
                        <div className="text-center py-12 opacity-30 flex flex-col items-center">
                            <ShieldAlert size={48} className="mb-4" />
                            <p className="font-bold uppercase text-xs tracking-widest">Nenhum operador encontrado</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
