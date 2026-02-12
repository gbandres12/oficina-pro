/**
 * Schemas de validação com Zod para validação server-side
 * Garante integridade dos dados e segurança
 */

import { z } from 'zod';

// ==================== USUÁRIO / OPERADOR ====================

export const createUserSchema = z.object({
    name: z.string()
        .min(3, 'Nome deve ter no mínimo 3 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .transform(val => val.trim().replace(/\s+/g, ' ')), // Normalizar

    email: z.string()
        .email('E-mail inválido')
        .transform(val => val.trim().toLowerCase()), // Normalizar (case-insensitive)

    password: z.string()
        .min(8, 'Senha deve ter no mínimo 8 caracteres')
        .regex(/[a-zA-Z]/, 'Senha deve conter pelo menos 1 letra')
        .regex(/[0-9]/, 'Senha deve conter pelo menos 1 número'),

    role: z.enum(['ADMIN', 'EMPLOYEE'], {
        errorMap: () => ({ message: 'Nível de acesso inválido' })
    })
});

export const updateUserSchema = createUserSchema.partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ==================== CLIENTE ====================

export const createClientSchema = z.object({
    name: z.string()
        .min(3, 'Nome deve ter no mínimo 3 caracteres')
        .max(200, 'Nome deve ter no máximo 200 caracteres')
        .transform(val => val.trim().replace(/\s+/g, ' ')),

    email: z.string()
        .email('E-mail inválido')
        .transform(val => val.trim().toLowerCase())
        .optional()
        .or(z.literal('')),

    phone: z.string()
        .min(8, 'Telefone inválido')
        .transform(val => val.replace(/\D/g, '')), // Normalizar (apenas dígitos)

    cpf: z.string()
        .optional()
        .transform(val => val?.replace(/\D/g, '') || ''),

    cnpj: z.string()
        .optional()
        .transform(val => val?.replace(/\D/g, '') || ''),

    address: z.string()
        .max(500, 'Endereço muito longo')
        .optional()
});

export const updateClientSchema = createClientSchema.partial();

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;

// ==================== VEÍCULO ====================

export const createVehicleSchema = z.object({
    plate: z.string()
        .min(7, 'Placa inválida')
        .max(7, 'Placa inválida')
        .regex(/^[A-Z]{3}[0-9]{4}$|^[A-Z]{3}[0-9][A-Z][0-9]{2}$/, 'Formato de placa inválido')
        .transform(val => val.replace(/[-\s]/g, '').toUpperCase()), // Normalizar

    brand: z.string()
        .min(2, 'Marca deve ter no mínimo 2 caracteres')
        .max(50, 'Marca deve ter no máximo 50 caracteres')
        .transform(val => val.trim()),

    model: z.string()
        .min(1, 'Modelo é obrigatório')
        .max(100, 'Modelo deve ter no máximo 100 caracteres')
        .transform(val => val.trim()),

    year: z.number()
        .int('Ano deve ser um número inteiro')
        .min(1900, 'Ano inválido')
        .max(new Date().getFullYear() + 1, 'Ano inválido'),

    color: z.string()
        .max(30, 'Cor muito longa')
        .optional(),

    client_id: z.string()
        .uuid('ID de cliente inválido')
});

export const updateVehicleSchema = createVehicleSchema.partial();

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;

// ==================== PEÇA / PRODUTO ====================

export const createPartSchema = z.object({
    name: z.string()
        .min(3, 'Nome da peça deve ter no mínimo 3 caracteres')
        .max(200, 'Nome da peça muito longo')
        .transform(val => val.trim()),

    sku: z.string()
        .min(1, 'SKU é obrigatório')
        .max(50, 'SKU muito longo')
        .transform(val => val.trim().toUpperCase()), // Normalizar (uppercase)

    price: z.number()
        .positive('Preço deve ser maior que zero')
        .transform(val => Math.round(val * 100)), // Converter para centavos

    stock: z.number()
        .int('Estoque deve ser um número inteiro')
        .min(0, 'Estoque não pode ser negativo'),

    minStock: z.number()
        .int('Estoque mínimo deve ser um número inteiro')
        .min(0, 'Estoque mínimo não pode ser negativo'),

    unit: z.string()
        .max(10, 'Unidade muito longa')
        .default('Un'),

    category: z.string()
        .max(100, 'Categoria muito longa')
        .optional()
});

export const updatePartSchema = createPartSchema.partial();

export type CreatePartInput = z.infer<typeof createPartSchema>;
export type UpdatePartInput = z.infer<typeof updatePartSchema>;

// ==================== ORDEM DE SERVIÇO ====================

export const createServiceOrderSchema = z.object({
    vehicle_id: z.string()
        .uuid('ID de veículo inválido'),

    client_id: z.string()
        .uuid('ID de cliente inválido'),

    description: z.string()
        .min(10, 'Descrição deve ter no mínimo 10 caracteres')
        .max(5000, 'Descrição muito longa'),

    estimated_value: z.number()
        .positive('Valor estimado deve ser maior que zero')
        .transform(val => Math.round(val * 100)) // Converter para centavos
        .optional(),

    technician_id: z.string()
        .uuid('ID de técnico inválido')
        .optional()
});

export type CreateServiceOrderInput = z.infer<typeof createServiceOrderSchema>;
