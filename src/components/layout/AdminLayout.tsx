"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    FileText,
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
    X,
    ChevronLeft,
    Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import { CreateOrderDialog } from '@/components/orders/CreateOrderDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Input } from '@/components/ui/input';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
    const pathname = usePathname();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: Car, label: 'Gestão de Pátio', href: '/gestao-patio' },
        { icon: ClipboardList, label: 'Ordens de Serviço', href: '/ordens' },
        { icon: FileText, label: 'Orçamentos', href: '/orcamentos' },
        { icon: Car, label: 'Veículos', href: '/veiculos' },
        { icon: Users, label: 'Clientes', href: '/clientes' },
        { icon: Package, label: 'Estoque', href: '/estoque' },
        { icon: Building2, label: 'Fornecedores', href: '/fornecedores' },
        { icon: ShoppingCart, label: 'PDV', href: '/pdv' },
        { icon: BarChart3, label: 'Financeiro', href: '/financeiro' },
        { icon: Settings, label: 'Configurações', href: '/configuracoes' },
    ];

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {isSidebarOpen && (
                    <motion.aside
                        initial={{ x: -280, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -280, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col z-50 fixed inset-y-0 lg:relative shadow-2xl lg:shadow-none"
                    >
                        <div className="p-6 pb-2 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-slate-900 font-black text-xl shadow-lg shadow-slate-900/20">
                                    A
                                </div>
                                <div className="leading-tight">
                                    <div className="font-black text-lg tracking-tight text-slate-900 dark:text-white">Andres</div>
                                    <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Oficina Pro</div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-900">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="px-4 py-6">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Menu Principal</div>
                            <nav className="space-y-1">
                                {menuItems.map((item) => {
                                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-900/20'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                        >
                                            <item.icon className={`w-5 h-5 ${isActive ? 'text-white dark:text-slate-900' : 'text-slate-400 group-hover:text-primary transition-colors'}`} />
                                            <span className="font-bold text-sm">{item.label}</span>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute right-3 w-1.5 h-1.5 bg-white dark:bg-slate-900 rounded-full"
                                                />
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        <div className="mt-auto p-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-900 dark:text-white font-black text-xs shadow-sm border border-slate-100 dark:border-slate-600">
                                        {session?.user?.name?.[0] || 'U'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="text-xs font-black uppercase leading-none text-slate-900 dark:text-white truncate">
                                            {session?.user?.name || 'Usuário'}
                                        </div>
                                        <div className="text-[10px] text-slate-500 truncate mt-1">
                                            {(session?.user as any)?.email || 'admin@oficina.pro'}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    className="w-full text-xs font-bold h-9 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 justify-start px-2 rounded-lg"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                >
                                    <LogOut className="w-3.5 h-3.5 mr-2" /> Sair do Sistema
                                </Button>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300">
                {/* Header */}
                <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-6">
                        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                            {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>

                        <div className="hidden md:flex items-center relative group">
                            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                            <input
                                placeholder="Busca global (CRTL + K)"
                                className="bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/20 text-sm w-64 lg:w-96 h-11 rounded-xl pl-11 pr-4 outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            className="hidden sm:flex h-11 rounded-xl px-6 font-black bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 gap-2 transition-all active:scale-95"
                            onClick={() => setIsCreateOrderOpen(true)}
                        >
                            <Plus className="w-4 h-4" /> Nova O.S.
                        </Button>

                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2" />

                        <ThemeToggle />

                        <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl w-11 h-11">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                        </Button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 scroll-smooth">
                    {children}
                </div>

                <CreateOrderDialog
                    open={isCreateOrderOpen}
                    onOpenChange={setIsCreateOrderOpen}
                    onSuccess={() => {
                        // Global success handler if needed
                    }}
                />
            </main>
        </div>
    );
}
