"use client";

import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { RotateCcw, Check } from 'lucide-react';

interface SignaturePadProps {
    onSave: (dataUrl: string) => void;
}

export default function SignaturePad({ onSave }: SignaturePadProps) {
    const sigCanvas = useRef<SignatureCanvas>(null);

    const clear = () => {
        sigCanvas.current?.clear();
    };

    const save = () => {
        if (sigCanvas.current?.isEmpty()) return;
        const dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png') || '';
        onSave(dataUrl);
    };

    return (
        <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl bg-muted/30 overflow-hidden h-48 relative">
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="currentColor"
                    canvasProps={{
                        className: "w-full h-full cursor-pencil text-foreground",
                        style: { width: '100%', height: '100%' }
                    }}
                />
                <div className="absolute top-2 right-2 flex gap-2">
                    <Button variant="ghost" size="icon" onClick={clear} className="h-8 w-8 rounded-full bg-background/50 backdrop-blur">
                        <RotateCcw className="h-4 h-4" />
                    </Button>
                </div>
            </div>
            <Button onClick={save} className="w-full gap-2">
                <Check className="h-4 w-4" /> Fixar Assinatura Digital
            </Button>
        </div>
    );
}
