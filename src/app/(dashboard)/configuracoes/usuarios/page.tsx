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
    ShieldAlert,
    Database,
    Loader2
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
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        password: '',
        role: ''
    });
    const [touched, setTouched] = useState({
        name: false,
        email: false,
        password: false,
        role: false
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

    // Funções de validação
    const validateName = (name: string): string => {
        const trimmedName = name.trim();
        if (!trimmedName) return 'Nome é obrigatório';
        if (trimmedName.length < 3) return 'Nome deve ter no mínimo 3 caracteres';
        return '';
    };

    const validateEmail = (email: string): string => {
        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail) return 'E-mail é obrigatório';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) return 'E-mail inválido';
        return '';
    };

    const validatePassword = (password: string): string => {
        if (!password) return 'Senha é obrigatória';
        if (password.length < 8) return 'Senha deve ter no mínimo 8 caracteres';
        if (!/[a-zA-Z]/.test(password)) return 'Senha deve conter pelo menos 1 letra';
        if (!/[0-9]/.test(password)) return 'Senha deve conter pelo menos 1 número';
        return '';
    };

    const validateRole = (role: string): string => {
        if (!role) return 'Nível de acesso é obrigatório';
        return '';
    };

    // Validar campo individual
    const validateField = (field: string, value: string) => {
        let error = '';
        switch (field) {
            case 'name':
                error = validateName(value);
                break;
            case 'email':
                error = validateEmail(value);
                break;
            case 'password':
                error = validatePassword(value);
                break;
            case 'role':
                error = validateRole(value);
                break;
        }
        setErrors(prev => ({ ...prev, [field]: error }));
        return error === '';
    };

    // Validar todos os campos
    const validateForm = (): boolean => {
        const newErrors = {
            name: validateName(formData.name),
            email: validateEmail(formData.email),
            password: validatePassword(formData.password),
            role: validateRole(formData.role)
        };
        setErrors(newErrors);
        setTouched({ name: true, email: true, password: true, role: true });
        return !Object.values(newErrors).some(error => error !== '');
    };

    // Normalizar dados
    const normalizeFormData = () => {
        return {
            name: formData.name.trim().replace(/\s+/g, ' '), // Colapsar espaços
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            role: formData.role
        };
    };

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validateField(field, formData[field as keyof typeof formData]);
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (touched[field as keyof typeof touched]) {
            validateField(field, value);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar formulário
        if (!validateForm()) {
            toast.error('Por favor, corrija os erros no formulário');
            return;
        }

        setLoading(true);

        try {
            // Normalizar dados antes de enviar
            const normalizedData = normalizeFormData();

            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(normalizedData)
            });

            if (res.ok) {
                toast.success('Operador criado com sucesso! ✓', {
                    description: `${normalizedData.name} foi adicionado ao sistema.`,
                    duration: 4000
                });
                setFormData({ name: '', email: '', password: '', role: 'EMPLOYEE' });
                setErrors({ name: '', email: '', password: '', role: '' });
                setTouched({ name: false, email: false, password: false, role: false });
                fetchUsers();
            } else {
                const error = await res.json();
                if (error.error?.includes('email')) {
                    toast.error('E-mail já cadastrado', {
                        description: 'Este e-mail já está sendo usado por outro operador.'
                    });
                    setErrors(prev => ({ ...prev, email: 'E-mail já cadastrado' }));
                } else {
                    toast.error('Erro ao criar operador', {
                        description: error.error || 'Tente novamente em alguns instantes.'
                    });
                }
            }
        } catch (error) {
            toast.error('Erro de conexão', {
                description: 'Não foi possível conectar ao servidor. Verifique sua conexão.'
            });
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
                <Button
                    variant="destructive"
                    className="gap-2 rounded-xl h-11 px-6 font-bold uppercase text-xs shadow-lg"
                    onClick={() => {
                        if (confirm('Tem certeza que deseja limpar todos os dados em cache do navegador? Esta ação não pode ser desfeita.')) {
                            localStorage.clear();
                            sessionStorage.clear();
                            toast.success('Cache limpo com sucesso! Recarregue a página para aplicar as mudanças.');
                        }
                    }}
                >
                    <Database className="w-4 h-4" /> Limpar Cache
                </Button>
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
                                <Label htmlFor="name">Nome Completo *</Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: Pedro Checklist"
                                    className={`rounded-xl h-11 ${touched.name && errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    onBlur={() => handleBlur('name')}
                                    disabled={loading}
                                />
                                {touched.name && errors.name && (
                                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                        <span className="font-semibold">⚠</span> {errors.name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail de Acesso *</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="pedro@oficina.com"
                                        className={`pl-10 rounded-xl h-11 ${touched.email && errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        onBlur={() => handleBlur('email')}
                                        disabled={loading}
                                    />
                                </div>
                                {touched.email && errors.email && (
                                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                        <span className="font-semibold">⚠</span> {errors.email}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Nível de Acesso *</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(val) => handleChange('role', val)}
                                    disabled={loading}
                                >
                                    <SelectTrigger className={`rounded-xl h-11 ${touched.role && errors.role ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder="Selecione o nível de acesso" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ADMIN">
                                            <div className="flex flex-col items-start">
                                                <span className="font-semibold">Administrador</span>
                                                <span className="text-xs text-muted-foreground">Acesso completo ao sistema</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="EMPLOYEE">
                                            <div className="flex flex-col items-start">
                                                <span className="font-semibold">Funcionário</span>
                                                <span className="text-xs text-muted-foreground">Acesso limitado (checklist e ordens)</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {touched.role && errors.role && (
                                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                        <span className="font-semibold">⚠</span> {errors.role}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha Temporária *</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className={`pl-10 rounded-xl h-11 ${touched.password && errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        onBlur={() => handleBlur('password')}
                                        disabled={loading}
                                    />
                                </div>
                                {touched.password && errors.password && (
                                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                        <span className="font-semibold">⚠</span> {errors.password}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Mínimo 8 caracteres com pelo menos 1 letra e 1 número
                                </p>
                            </div>
                            <Button className="w-full h-12 rounded-xl font-bold uppercase text-xs tracking-widest gap-2 shadow-lg shadow-primary/20" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Criando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" /> Finalizar Cadastro
                                    </>
                                )}
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
