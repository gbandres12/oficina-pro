"use client";

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function ImportLegacyCSVDialog({ open, onOpenChange, onSuccess }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.csv')) {
                toast.error('Selecione um arquivo CSV.');
                return;
            }
            setFile(selectedFile);
            setResult(null);
        }
    };

    const handleImport = async () => {
        if (!file) return toast.error('Selecione um arquivo CSV.');

        setImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/service-orders/legacy/import', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                setResult(data);
                toast.success('Importação de OS Legadas concluída!');
                onSuccess();
            } else {
                toast.error(data.error || 'Erro importando OS Legadas.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro de conexão ao importar.');
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = () => {
        const csvContent = 'numero_os,data_abertura,cliente_nome,placa,valor_total,valor_pago,status,observacao\n' +
            '1001,2023-01-15,"João Silva",ABC1234,1500.50,1500.50,FINISHED,"Motor retificado"\n' +
            '1002,2023-02-20,"Maria Oliveira",XYZ9876,800.00,400.00,OPEN,"Pendente metade do pagamento"';
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'modelo-os-legado.csv';
        link.click();
    };

    const reset = () => {
        setFile(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <Dialog open={open} onOpenChange={(v) => {
            onOpenChange(v);
            if (!v) reset();
        }}>
            <DialogContent className="sm:max-w-[600px] rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Importar OS do Sistema Antigo</DialogTitle>
                    <DialogDescription>Importe sua planilha de histórico com csv estruturado.</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <Card className="border-dashed bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <CardContent className="pt-6 flex justify-between items-center">
                            <div className="flex gap-3 items-center text-sm font-medium">
                                <FileText className="text-blue-600 w-8 h-8" />
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">Baixe o modelo</div>
                                    <div className="text-muted-foreground text-xs">Exemplo estruturado</div>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={downloadTemplate} className="rounded-xl font-bold bg-white dark:bg-black">Baixar CSV Modelo</Button>
                        </CardContent>
                    </Card>

                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="block w-full text-sm font-semibold file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-900 file:text-white dark:file:bg-white dark:file:text-black cursor-pointer bg-slate-100 dark:bg-slate-800 rounded-xl"
                        />
                        {file && (
                            <p className="mt-2 text-sm text-green-600 font-bold flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> {file.name} pronto para envio.
                            </p>
                        )}
                    </div>

                    {result && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 p-4 rounded-xl text-sm border border-emerald-200 dark:border-emerald-800">
                            <strong>Resultados:</strong><br />
                            ✓ {result.imported} Importados<br />
                            ✓ {result.updated} Atualizados<br />
                            {result.skipped > 0 && <span>⚠ {result.skipped} Ignorados<br /></span>}
                            {result.errors?.length > 0 && (
                                <div className="mt-2 text-xs opacity-80 h-24 overflow-y-auto">
                                    {result.errors.map((e: string, i: number) => <div key={i}>• {e}</div>)}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Fechar</Button>
                        <Button onClick={handleImport} disabled={!file || importing} className="rounded-xl gap-2 font-bold bg-slate-900 text-white border-b-4 border-slate-950">
                            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            Processar Importação
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
