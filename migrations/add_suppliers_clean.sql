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
