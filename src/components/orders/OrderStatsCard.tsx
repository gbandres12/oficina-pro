"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface OrderStatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    iconColor?: string;
    iconBg?: string;
    className?: string;
}

export function OrderStatsCard({
    title,
    value,
    icon: Icon,
    iconColor = "text-blue-500",
    iconBg = "bg-blue-500/10",
    className = ""
}: OrderStatsCardProps) {
    return (
        <Card className={`border-none bg-slate-900 text-white shadow-xl overflow-hidden transition-all hover:scale-[1.02] ${className}`}>
            <CardContent className="p-6">
                <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl ${iconBg} ${iconColor} shadow-inner`}>
                        <Icon className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-4xl font-black tracking-tighter leading-none mb-1">
                            {value}
                        </div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            {title}
                        </div>
                    </div>
                </div>
            </CardContent>
            {/* Subtle gradient overlay for premium feel */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
        </Card>
    );
}
