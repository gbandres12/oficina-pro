// ==================== SERVICE ORDER PRINT TYPES ====================

export interface ServiceOrderPrintData {
    // Dados da OS
    id: string;
    number: number;
    entryDate: Date;
    exitDate: Date | null;
    status: string;
    km: number;
    mechanic: string;
    observations: string;
    clientReport: string;
    fuelLevel: number | null;

    // Cliente
    client: {
        name: string;
        phone: string;
        document: string;
        email: string;
    };

    // Veículo
    vehicle: {
        plate: string;
        brand: string;
        model: string;
        year: number;
        vin: string;
    };

    // Serviços
    services: Array<{
        id: string;
        description: string;
        quantity: number;
        price: number;
        discount: number;
        total: number;
    }>;

    // Peças
    parts: Array<{
        id: string;
        name: string;
        sku: string;
        quantity: number;
        price: number;
        discount: number;
        total: number;
    }>;

    // Totais
    totals: {
        subtotalServices: number;
        subtotalParts: number;
        discountServices: number;
        discountParts: number;
        totalGeneral: number;
        additionalServices: number;
        additionalParts: number;
        totalFinal: number;
    };
}

export interface CompanyInfo {
    name: string;
    cnpj: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    logo?: string;
}
