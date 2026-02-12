import { ServiceOrderPrintData } from './print';

export interface TimelineEvent {
    id: string;
    serviceOrderId: string;
    status: string;
    description: string | null;
    userId: string | null;
    createdAt: string | Date;
}

export interface ServiceOrderDetails extends ServiceOrderPrintData {
    internalNotes: string | null;
    timeline: TimelineEvent[];
}

// Re-exportar tipos existentes para facilitar importação
export * from './print';
