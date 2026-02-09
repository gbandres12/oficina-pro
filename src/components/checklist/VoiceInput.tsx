"use client";

import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceInputProps {
    onResult: (text: string) => void;
    label?: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}

export default function VoiceInput({ onResult, label }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.interimResults = false;
            rec.lang = 'pt-BR';

            rec.onresult = (event: any) => {
                const text = event.results[0][0].transcript;
                onResult(text);
                setIsListening(false);
            };

            rec.onerror = () => {
                setIsListening(false);
            };

            rec.onend = () => {
                setIsListening(false);
            };

            setRecognition(rec);
        }
    }, [onResult]);

    const toggleListening = () => {
        if (isListening) {
            recognition?.stop();
        } else {
            recognition?.start();
            setIsListening(true);
        }
    };

    if (!recognition) return null;

    return (
        <Button
            type="button"
            variant={isListening ? "destructive" : "secondary"}
            size="sm"
            onClick={toggleListening}
            className="flex items-center gap-2"
        >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isListening ? 'Ouvindo...' : label || 'Ditár'}
        </Button>
    );
}
