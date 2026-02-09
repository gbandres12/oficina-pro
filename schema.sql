-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "OrderStatus" AS ENUM ('OPEN', 'QUOTATION', 'APPROVED', 'IN_PROGRESS', 'WAITING_PARTS', 'FINISHED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EMPLOYEE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "document" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "vin" TEXT,
    "model" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "year" INTEGER,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceOrder" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'OPEN',
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitDate" TIMESTAMP(3),
    "km" INTEGER NOT NULL,
    "fuelLevel" INTEGER,
    "mechanic" TEXT,
    "observations" TEXT,
    "clientReport" TEXT,
    "clientId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "signatureUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "observation" TEXT,
    "photoUrl" TEXT,
    "serviceOrderId" TEXT NOT NULL,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DamagePoint" (
    "id" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "serviceOrderId" TEXT NOT NULL,

    CONSTRAINT "DamagePoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceItem" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "serviceOrderId" TEXT NOT NULL,

    CONSTRAINT "ServiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "serviceOrderId" TEXT NOT NULL,

    CONSTRAINT "PartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "minQuantity" DECIMAL(65,30) NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostCenter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CostCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialTransaction" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PAID',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "costCenterId" TEXT,
    "serviceOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "discount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "paymentMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleItem" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "totalPrice" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_document_key" ON "Client"("document");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plate_key" ON "Vehicle"("plate");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceOrder_number_key" ON "ServiceOrder"("number");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_sku_key" ON "InventoryItem"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "CostCenter_name_key" ON "CostCenter"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_number_key" ON "Sale"("number");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceOrder" ADD CONSTRAINT "ServiceOrder_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceOrder" ADD CONSTRAINT "ServiceOrder_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_serviceOrderId_fkey" FOREIGN KEY ("serviceOrderId") REFERENCES "ServiceOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DamagePoint" ADD CONSTRAINT "DamagePoint_serviceOrderId_fkey" FOREIGN KEY ("serviceOrderId") REFERENCES "ServiceOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceItem" ADD CONSTRAINT "ServiceItem_serviceOrderId_fkey" FOREIGN KEY ("serviceOrderId") REFERENCES "ServiceOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartItem" ADD CONSTRAINT "PartItem_serviceOrderId_fkey" FOREIGN KEY ("serviceOrderId") REFERENCES "ServiceOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_serviceOrderId_fkey" FOREIGN KEY ("serviceOrderId") REFERENCES "ServiceOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Inserção dos Usuários Iniciais (Senhas já criptografadas)
-- Senha do Admin: admin123
-- Senha do Checklist: user123
INSERT INTO "User" ("id", "name", "email", "password", "role", "updatedAt")
VALUES 
('user_admin_01', 'Gabriel Admin', 'admin@andres.com', '$2b$10$YrHBMCEGqVq9sbO6vqTfnu4UXIcnxHwKocLofIfTgeCgMHXQ8kxHa', 'ADMIN', CURRENT_TIMESTAMP),
('user_checklist_01', 'Pedro Checklist', 'checklist@andres.com', '$2b$10$to10DPUkx74qHe3yWkMrNet3DrwF9EVNZHfBAhVkm9Z.iRvXLMqKK', 'EMPLOYEE', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;
