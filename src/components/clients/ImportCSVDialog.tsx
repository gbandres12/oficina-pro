"use client";

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ImportCSVDialogProps {
    onSuccess?: () => void;
}

export function ImportCSVDialog({ onSuccess }: ImportCSVDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.csv')) {
                toast.error('Por favor, selecione um arquivo CSV');
                return;
            }
            setFile(selectedFile);
            setResult(null);
        }
    };

    const handleImport = async () => {
        if (!file) {
            toast.error('Selecione um arquivo CSV');
            return;
        }

        setImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/clients/import', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setResult(data);
                toast.success(`${data.total} clientes processados com sucesso!`);
                onSuccess?.();
            } else {
                toast.error(data.error || 'Erro ao importar clientes');
            }
        } catch (error) {
            console.error('Erro ao importar:', error);
            toast.error('Erro ao conectar com o servidor');
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = () => {
        const csvContent = 'nome,email,telefone,cpf,cnpj\nJoão Silva,joao@email.com,11999998888,12345678900,\nEmpresa ABC,contato@abc.com,1133334444,,12345678000190';
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'modelo-importacao-clientes.csv';
        link.click();
        toast.success('Modelo baixado com sucesso!');
    };

    const resetDialog = () => {
        setFile(null);
        setResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) resetDialog();
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 rounded-xl">
                    <Upload className="w-4 h-4" /> Importar CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Importar Clientes via CSV</DialogTitle>
                    <DialogDescription>
                        Faça upload de um arquivo CSV para importar ou atualizar clientes em massa
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Template Download */}
                    <Card className="border-dashed">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-8 h-8 text-muted-foreground" />
                                    <div>
                                        <div className="font-semibold">Modelo de Importação</div>
                                        <div className="text-sm text-muted-foreground">Baixe o arquivo de exemplo</div>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
                                    <Download className="w-4 h-4" /> Baixar Modelo
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* File Upload */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="csv-upload" className="text-sm font-medium">
                                Selecione o arquivo CSV
                            </label>
                            <div className="mt-2">
                                <input
                                    ref={fileInputRef}
                                    id="csv-upload"
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-slate-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-xl file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-primary file:text-primary-foreground
                                        hover:file:bg-primary/90
                                        file:cursor-pointer cursor-pointer"
                                />
                            </div>
                            {file && (
                                <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    Arquivo selecionado: {file.name}
                                </div>
                            )}
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-xl">
                            <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                                Formato do CSV:
                            </div>
                            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1 font-mono">
                                <div>• nome (obrigatório)</div>
                                <div>• email (opcional)</div>
                                <div>• telefone (obrigatório)</div>
                                <div>• cpf (opcional)</div>
                                <div>• cnpj (opcional)</div>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    {result && (
                        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                    <div className="space-y-2">
                                        <div className="font-semibold text-green-900 dark:text-green-100">
                                            Importação concluída com sucesso!
                                        </div>
                                        <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                                            <div>✓ {result.imported} novos clientes importados</div>
                                            <div>✓ {result.updated} clientes atualizados</div>
                                            <div>✓ Total: {result.total} registros processados</div>
                                        </div>
                                        {result.errors && result.errors.length > 0 && (
                                            <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                                                <div className="font-semibold mb-1">Avisos:</div>
                                                {result.errors.slice(0, 3).map((error: string, idx: number) => (
                                                    <div key={idx}>• {error}</div>
                                                ))}
                                                {result.errors.length > 3 && (
                                                    <div>... e mais {result.errors.length - 3} avisos</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={!file || importing}
                            className="rounded-xl gap-2"
                        >
                            {importing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Importando...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Importar Clientes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
