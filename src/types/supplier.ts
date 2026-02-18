// Types for Supplier Management
// Tipos de fornecedores e interfaces relacionadas

export enum SupplierType {
    PARTS = 'PARTS',
    WORKSHOP = 'WORKSHOP',
    RECTIFICATION = 'RECTIFICATION',
    OTHER = 'OTHER'
}

export interface Supplier {
    id: string;
    name: string;
    tradeName?: string | null;
    document?: string | null;
    email?: string | null;
    phone: string;
    whatsapp?: string | null;
    type: SupplierType;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
    contactPerson?: string | null;
    notes?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSupplierInput {
    name: string;
    tradeName?: string;
    document?: string;
    email?: string;
    phone: string;
    whatsapp?: string;
    type: SupplierType;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    contactPerson?: string;
    notes?: string;
}

export interface UpdateSupplierInput extends Partial<CreateSupplierInput> {
    isActive?: boolean;
}

export interface SupplierStats {
    total: number;
    byType: Record<SupplierType, number>;
    active: number;
    inactive: number;
}

export const SUPPLIER_TYPE_LABELS: Record<SupplierType, string> = {
    PARTS: 'Peças',
    WORKSHOP: 'Oficina',
    RECTIFICATION: 'Retífica',
    OTHER: 'Outros'
};

export const SUPPLIER_TYPE_COLORS: Record<SupplierType, string> = {
    PARTS: 'blue',
    WORKSHOP: 'orange',
    RECTIFICATION: 'purple',
    OTHER: 'slate'
};

export const SUPPLIER_TYPE_DESCRIPTIONS: Record<SupplierType, string> = {
    PARTS: 'Fornecedor de autopeças e componentes',
    WORKSHOP: 'Oficina parceira para serviços externos',
    RECTIFICATION: 'Serviços de retífica de motores e componentes',
    OTHER: 'Outros serviços especializados'
};

// Estados brasileiros
export const BRAZILIAN_STATES = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' }
];
