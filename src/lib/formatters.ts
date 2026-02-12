/**
 * Utilitários de formatação e normalização de dados
 * Para uso em todo o sistema Oficina Pro
 */

// ==================== MOEDA (BRL) ====================

/**
 * Formata um valor numérico para o padrão brasileiro de moeda
 * @param value - Valor em centavos ou decimal
 * @param fromCents - Se true, converte de centavos para reais
 * @returns String formatada ex: "R$ 1.234,56"
 */
export function formatBRL(value: number, fromCents = false): string {
    const valueInReais = fromCents ? value / 100 : value;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(valueInReais);
}

/**
 * Converte valor em reais para centavos (para armazenar no banco)
 * @param value - Valor em reais
 * @returns Valor em centavos (inteiro)
 */
export function toBRLCents(value: number): number {
    return Math.round(value * 100);
}

/**
 * Converte valor em centavos para reais
 * @param cents - Valor em centavos
 * @returns Valor em reais
 */
export function fromBRLCents(cents: number): number {
    return cents / 100;
}

// ==================== PLACA DE VEÍCULO ====================

/**
 * Normaliza placa de veículo para armazenar no banco
 * Remove hífens, espaços e converte para uppercase
 * @param plate - Placa com ou sem formatação
 * @returns Placa normalizada ex: "ABC1234" ou "ABC1D23"
 */
export function normalizePlate(plate: string): string {
    return plate.replace(/[-\s]/g, '').toUpperCase().trim();
}

/**
 * Formata placa de veículo para exibição
 * Aceita formato antigo (ABC1234) e Mercosul (ABC1D23)
 * @param plate - Placa sem formatação
 * @returns Placa formatada ex: "ABC-1234" ou "ABC1D23"
 */
export function formatPlate(plate: string): string {
    const normalized = normalizePlate(plate);

    // Verifica se é formato Mercosul (ABC1D23) ou antigo (ABC1234)
    const isMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(normalized);
    const isOldFormat = /^[A-Z]{3}[0-9]{4}$/.test(normalized);

    if (isMercosul) {
        // Mercosul: ABC1D23 (sem hífen)
        return normalized;
    } else if (isOldFormat) {
        // Formato antigo: ABC-1234
        return `${normalized.slice(0, 3)}-${normalized.slice(3)}`;
    }

    // Retorna como está se não reconhecer o formato
    return normalized;
}

/**
 * Valida se a placa está em formato válido
 * @param plate - Placa a ser validada
 * @returns true se válida
 */
export function isValidPlate(plate: string): boolean {
    const normalized = normalizePlate(plate);
    const isMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(normalized);
    const isOldFormat = /^[A-Z]{3}[0-9]{4}$/.test(normalized);
    return isMercosul || isOldFormat;
}

// ==================== TELEFONE ====================

/**
 * Normaliza telefone para armazenar no banco
 * Remove todos os caracteres não numéricos
 * @param phone - Telefone com ou sem formatação
 * @returns Apenas dígitos ex: "5511999999999"
 */
export function normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
}

/**
 * Formata telefone brasileiro para exibição
 * Suporta: celular (11 dígitos), fixo (10 dígitos), com DDI (13 dígitos)
 * @param phone - Telefone apenas com dígitos
 * @returns Telefone formatado ex: "(11) 99999-9999"
 */
export function formatPhoneBR(phone: string): string {
    const normalized = normalizePhone(phone);
    const length = normalized.length;

    // com DDI: 55 11 99999-9999
    if (length === 13 && normalized.startsWith('55')) {
        const ddi = normalized.slice(0, 2);
        const ddd = normalized.slice(2, 4);
        const part1 = normalized.slice(4, 9);
        const part2 = normalized.slice(9);
        return `+${ddi} (${ddd}) ${part1}-${part2}`;
    }

    // Celular com DDD: (11) 99999-9999
    if (length === 11) {
        const ddd = normalized.slice(0, 2);
        const part1 = normalized.slice(2, 7);
        const part2 = normalized.slice(7);
        return `(${ddd}) ${part1}-${part2}`;
    }

    // Fixo com DDD: (11) 9999-9999
    if (length === 10) {
        const ddd = normalized.slice(0, 2);
        const part1 = normalized.slice(2, 6);
        const part2 = normalized.slice(6);
        return `(${ddd}) ${part1}-${part2}`;
    }

    // Sem DDD: 99999-9999 ou 9999-9999
    if (length === 9) {
        return `${normalized.slice(0, 5)}-${normalized.slice(5)}`;
    }
    if (length === 8) {
        return `${normalized.slice(0, 4)}-${normalized.slice(4)}`;
    }

    // Retorna como está se não reconhecer
    return normalized;
}

/**
 * Valida se o telefone brasileiro está em formato válido
 * @param phone - Telefone a ser validado
 * @returns true se válido
 */
export function isValidPhoneBR(phone: string): boolean {
    const normalized = normalizePhone(phone);
    const validLengths = [8, 9, 10, 11, 13]; // Permite diferentes formatos
    return validLengths.includes(normalized.length);
}

// ==================== EMAIL ====================

/**
 * Normaliza email para armazenar no banco
 * Trim e lowercase para evitar duplicatas
 * @param email - Email com qualquer formatação
 * @returns Email normalizado ex: "usuario@exemplo.com"
 */
export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

/**
 * Valida se email está em formato válido
 * @param email - Email a ser validado
 * @returns true se válido
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ==================== NOME / TEXTO ====================

/**
 * Normaliza nome/texto colapsando espaços múltiplos
 * @param text - Texto a ser normalizado
 * @returns Texto com espaços colapsados e trim
 */
export function normalizeText(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
}

/**
 * Capitaliza primeira letra de cada palavra
 * @param text - Texto a ser capitalizado
 * @returns Texto capitalizado ex: "João Da Silva"
 */
export function capitalizeName(text: string): string {
    return normalizeText(text)
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}
