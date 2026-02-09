"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Point {
  id: string;
  x: number;
  y: number;
  description?: string;
}

interface InteractiveCarDiagramProps {
  onAddPoint: (point: Point) => void;
  points: Point[];
}

export default function InteractiveCarDiagram({ onAddPoint, points }: InteractiveCarDiagramProps) {
  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const id = Math.random().toString(36).substr(2, 9);
    onAddPoint({ id, x, y });
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-[2/1] bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-border group">
      <div className="absolute top-4 left-4 z-10">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-background/80 backdrop-blur px-2 py-1 rounded border">
          Mapa de Avarias (Clique para marcar)
        </span>
      </div>
      
      <svg
        viewBox="0 0 800 400"
        className="w-full h-full cursor-crosshair transition-transform duration-500 group-hover:scale-[1.02]"
        onClick={handleClick}
      >
        {/* Simplified Car Top View SVG Body */}
        <g fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-600">
          {/* Main Body */}
          <path d="M200 100 Q150 100 150 150 L150 250 Q150 300 200 300 L600 300 Q650 300 650 250 L650 150 Q650 100 600 100 Z" />
          {/* Windshield */}
          <path d="M280 110 L280 290 Q350 290 350 200 Q350 110 280 110" />
          {/* Rear Window */}
          <path d="M520 110 L520 290 Q480 290 480 200 Q480 110 520 110" />
          {/* Roof */}
          <rect x="300" y="115" width="200" height="170" rx="10" />
          {/* Hood Lines */}
          <path d="M150 150 L250 150 M150 250 L250 250" />
          {/* Trunk Lines */}
          <path d="M650 150 L550 150 M650 250 L550 250" />
          {/* Lights */}
          <rect x="155" y="110" width="30" height="15" rx="2" className="fill-orange-400/20" />
          <rect x="155" y="275" width="30" height="15" rx="2" className="fill-orange-400/20" />
          <rect x="615" y="110" width="30" height="15" rx="2" className="fill-red-400/20" />
          <rect x="615" y="275" width="30" height="15" rx="2" className="fill-red-400/20" />
        </g>

        {/* Damage Points */}
        {points.map((point) => (
          <motion.g
            key={point.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="cursor-pointer"
          >
            <circle
              cx={`${point.x}%`}
              cy={`${point.y}%`}
              r="8"
              className="fill-red-500 stroke-white stroke-2 shadow-lg"
            />
            <circle
              cx={`${point.x}%`}
              cy={`${point.y}%`}
              r="12"
              className="fill-red-500/30 animate-ping"
            />
          </motion.g>
        ))}
      </svg>

      <div className="absolute bottom-4 right-4 flex gap-2">
        {points.length > 0 && (
          <span className="text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-200">
            {points.length} {points.length === 1 ? 'Avaria' : 'Avarias'} Detectadas
          </span>
        )}
      </div>
    </div>
  );
}
