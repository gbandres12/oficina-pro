"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ClipboardList,
    Users,
    Car,
    Package,
    BarChart3,
    Settings,
    Search,
    Plus,
    Bell,
    LogOut,
    Menu,
    ShoppingCart,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const pathname = usePathname();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: Car, label: 'Gestão de Pátio', href: '/gestao-patio' },
        { icon: ClipboardList, label: 'Ordens de Serviço', href: '/ordens' },
        { icon: Car, label: 'Veículos', href: '/veiculos' },
        { icon: Users, label: 'Clientes', href: '/clientes' },
        { icon: Package, label: 'Estoque', href: '/estoque' },
        { icon: ShoppingCart, label: 'PDV', href: '/pdv' },
        { icon: BarChart3, label: 'Financeiro', href: '/financeiro' },
        { icon: Settings, label: 'Acesso Master', href: '/configuracoes/usuarios' },
    ];

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-foreground overflow-hidden">
            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {isSidebarOpen && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        className="w-72 bg-white dark:bg-slate-900 border-r border-border flex flex-col z-50 fixed inset-y-0 lg:relative"
                    >
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
                                    A
                                </div>
                                <div className="leading-tight">
                                    <div className="font-bold text-lg tracking-tight">Andres</div>
                                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Oficina Pro</div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <nav className="flex-1 px-4 py-4 space-y-1">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium text-sm">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-4 border-t border-border">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                        {session?.user?.name?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold font-montserrat uppercase leading-none">
                                            {(session?.user as any)?.role === 'ADMIN' ? 'Acesso Master' : 'Operador'}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                            {session?.user?.name || 'Carregando...'}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    className="w-full text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 justify-start px-2"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                >
                                    <LogOut className="w-3.5 h-3.5 mr-2" /> Encerrar Sessão
                                </Button>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Topbar */}
                <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        {!isSidebarOpen && (
                            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                                <Menu className="w-5 h-5" />
                            </Button>
                        )}
                        <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-1.5 w-64 lg:w-96 border border-border/50">
                            <Search className="w-4 h-4 text-muted-foreground mr-2" />
                            <input
                                placeholder="Buscar placa, cliente ou O.S..."
                                className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="hidden sm:flex gap-2 rounded-full border-primary/20 text-primary">
                            <Plus className="w-4 h-4" /> Nova O.S.
                        </Button>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                        </Button>
                        <div className="w-px h-6 bg-border mx-1" />
                        <div className="flex flex-col items-end mr-2 hidden sm:flex">
                            <span className="text-[10px] font-bold text-primary">STATUS DA OFICINA</span>
                            <span className="text-xs font-bold text-emerald-500">OPERANDO 100%</span>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
                    {children}
                </div>
            </main>
        </div>
    );
}

