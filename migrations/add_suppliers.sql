-- Migration: Add Suppliers Table
-- Created: 2026-02-16
-- Description: Adiciona tabela de fornecedores para gerenciar oficinas parceiras, fornecedores de peças, retíficas, etc.

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "SupplierType" AS ENUM ('PARTS', 'WORKSHOP', 'RECTIFICATION', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tradeName" TEXT,
    "document" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "type" "SupplierType" NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "contactPerson" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Supplier_document_key" ON "Supplier"("document") WHERE "document" IS NOT NULL;

-- Insert sample data
INSERT INTO "Supplier" (
    "id", 
    "name", 
    "tradeName", 
    "document", 
    "email", 
    "phone", 
    "whatsapp",
    "type", 
    "address",
    "city", 
    "state", 
    "zipCode",
    "contactPerson",
    "notes",
    "isActive", 
    "updatedAt"
) VALUES 
(
    'sup_001', 
    'Auto Peças Silva Ltda', 
    'Silva Auto Parts', 
    '12.345.678/0001-90', 
    'contato@autopecassilva.com', 
    '(11) 98765-4321',
    '(11) 98765-4321',
    'PARTS', 
    'Rua das Flores, 123 - Centro',
    'São Paulo', 
    'SP', 
    '01234-567',
    'João Silva',
    'Fornecedor principal de peças originais. Entrega rápida.',
    true, 
    CURRENT_TIMESTAMP
),
(
    'sup_002', 
    'Oficina Mecânica JR Ltda', 
    'JR Mecânica Especializada', 
    '98.765.432/0001-10', 
    'contato@jrmecanica.com', 
    '(11) 91234-5678',
    '(11) 91234-5678',
    'WORKSHOP', 
    'Av. Industrial, 456 - Distrito Industrial',
    'Guarulhos', 
    'SP', 
    '07000-000',
    'Roberto Junior',
    'Oficina parceira para serviços de funilaria e pintura.',
    true, 
    CURRENT_TIMESTAMP
),
(
    'sup_003', 
    'Retífica Paulista Ltda', 
    'Retífica Paulista', 
    '11.222.333/0001-44', 
    'retifica@paulista.com', 
    '(11) 3456-7890',
    '(11) 99876-5432',
    'RECTIFICATION', 
    'Rua dos Motores, 789',
    'São Paulo', 
    'SP', 
    '03000-000',
    'Carlos Retífica',
    'Especializada em retífica de motores e cabeçotes.',
    true, 
    CURRENT_TIMESTAMP
),
(
    'sup_004', 
    'Distribuidora Nacional de Peças', 
    'DNP Distribuidora', 
    '22.333.444/0001-55', 
    'vendas@dnp.com.br', 
    '(11) 2222-3333',
    '(11) 98888-7777',
    'PARTS', 
    'Rod. Presidente Dutra, km 200',
    'São Paulo', 
    'SP', 
    '08000-000',
    'Maria Distribuidora',
    'Grande variedade de peças nacionais e importadas.',
    true, 
    CURRENT_TIMESTAMP
),
(
    'sup_005', 
    'Elétrica Automotiva Santos', 
    'Santos Elétrica', 
    '33.444.555/0001-66', 
    'eletrica@santos.com', 
    '(11) 3333-4444',
    '(11) 97777-6666',
    'OTHER', 
    'Rua da Eletricidade, 321',
    'Santo André', 
    'SP', 
    '09000-000',
    'Antonio Santos',
    'Especializada em sistemas elétricos automotivos.',
    true, 
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;
