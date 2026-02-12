"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Loader2, X } from 'lucide-react';
import { ServiceOrderPrint } from './ServiceOrderPrint';
import { ServiceOrderPrintData, CompanyInfo } from '@/lib/types/print';
import { toast } from 'sonner';

interface ServiceOrderPrintDialogProps {
    orderId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ServiceOrderPrintDialog({
    orderId,
    open,
    onOpenChange,
}: ServiceOrderPrintDialogProps) {
    const [loading, setLoading] = useState(false);
    const [printData, setPrintData] = useState<ServiceOrderPrintData | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // Informações da empresa (podem vir de configuração futuramente)
    const companyInfo: CompanyInfo = {
        name: 'WILMAZINHO AUTO SERVICE',
        cnpj: '15.579.504/0001-85',
        address: 'W.F. LIMA FILHO LTDA - SANTARÉM - PA',
        city: 'SANTARÉM - PA',
        phone: '9399212345482',
        email: 'WILMAZIINHOAUTOSERVICE@CARNABOR.COM.COM',
        logo: '/logo-wilmarzinho.jpg',
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `OS-${printData?.number || 'XXXX'}`,
        onAfterPrint: () => {
            toast.success('Ordem de Serviço impressa com sucesso!');
        },
    });

    useEffect(() => {
        if (open && orderId) {
            fetchOrderData();
        }
    }, [open, orderId]);

    const fetchOrderData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/service-orders/${orderId}`);
            const result = await response.json();

            if (result.success) {
                setPrintData(result.data);
            } else {
                toast.error('Erro ao carregar dados da ordem de serviço');
                onOpenChange(false);
            }
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            toast.error('Erro ao conectar com o servidor');
            onOpenChange(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Visualizar Ordem de Serviço</span>
                        <div className="flex gap-2">
                            <Button
                                onClick={handlePrint}
                                disabled={loading || !printData}
                                className="gap-2"
                            >
                                <Printer className="w-4 h-4" />
                                Imprimir
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onOpenChange(false)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            <p className="text-muted-foreground">Carregando dados da ordem...</p>
                        </div>
                    ) : printData ? (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <ServiceOrderPrint
                                ref={printRef}
                                data={printData}
                                companyInfo={companyInfo}
                            />
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-12">
                            Nenhum dado disponível
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
