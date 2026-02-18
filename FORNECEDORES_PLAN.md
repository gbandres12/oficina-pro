# 📦 Plano de Implementação: Módulo de Fornecedores

## 🎯 Objetivo
Implementar um sistema completo de cadastro e gestão de fornecedores para a oficina, incluindo:
- Oficinas parceiras (serviços externos)
- Fornecedores de peças
- Retíficas
- Outros serviços especializados

## 🏗️ Arquitetura

### 1. Banco de Dados

#### Tabela: `Supplier`
```sql
CREATE TYPE "SupplierType" AS ENUM ('PARTS', 'WORKSHOP', 'RECTIFICATION', 'OTHER');

CREATE TABLE "Supplier" (
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

CREATE UNIQUE INDEX "Supplier_document_key" ON "Supplier"("document");
```

#### Relacionamentos Futuros (Fase 2)
- `PurchaseOrder` - Ordens de compra de peças
- `ExternalService` - Serviços externos contratados
- `SupplierTransaction` - Transações financeiras com fornecedores

### 2. API Routes

#### `/api/suppliers/route.ts`
```typescript
GET    /api/suppliers       - Listar todos os fornecedores
POST   /api/suppliers       - Criar novo fornecedor
```

**Query Parameters para GET:**
- `type` - Filtrar por tipo (PARTS, WORKSHOP, RECTIFICATION, OTHER)
- `isActive` - Filtrar por status (true/false)
- `search` - Buscar por nome, documento ou cidade

**Response Format:**
```json
{
  "success": true,
  "suppliers": [
    {
      "id": "sup_123",
      "name": "Auto Peças Silva",
      "tradeName": "Silva Auto Parts",
      "document": "12.345.678/0001-90",
      "email": "contato@silva.com",
      "phone": "(11) 98765-4321",
      "whatsapp": "(11) 98765-4321",
      "type": "PARTS",
      "address": "Rua das Flores, 123",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567",
      "contactPerson": "João Silva",
      "notes": "Fornecedor principal de peças originais",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "stats": {
    "total": 15,
    "byType": {
      "PARTS": 8,
      "WORKSHOP": 4,
      "RECTIFICATION": 2,
      "OTHER": 1
    },
    "active": 14,
    "inactive": 1
  }
}
```

#### `/api/suppliers/[id]/route.ts`
```typescript
GET    /api/suppliers/[id]  - Buscar fornecedor específico
PUT    /api/suppliers/[id]  - Atualizar fornecedor
DELETE /api/suppliers/[id]  - Desativar fornecedor (soft delete)
```

### 3. Interface do Usuário

#### Página: `/fornecedores/page.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🏢 Fornecedores                    [Importar] [+ Novo]      │
├─────────────────────────────────────────────────────────────┤
│ [📊 Total: 15] [📦 Peças: 8] [🔧 Oficinas: 4] [⚙️ Retíficas: 2] │
├─────────────────────────────────────────────────────────────┤
│ [🔍 Buscar...] [Tipo ▼] [Status ▼]                         │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🏢 Auto Peças Silva                    [Editar] [...]   │ │
│ │ CNPJ: 12.345.678/0001-90  📦 Peças                      │ │
│ │ 📞 (11) 98765-4321  📧 contato@silva.com               │ │
│ │ 📍 São Paulo - SP                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔧 Oficina Mecânica JR                [Editar] [...]   │ │
│ │ CNPJ: 98.765.432/0001-10  🔧 Oficina                   │ │
│ │ 📞 (11) 91234-5678  📧 jr@oficina.com                  │ │
│ │ 📍 Guarulhos - SP                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Componentes:**

1. **CreateSupplierDialog.tsx**
   - Form com validação
   - Campos organizados em seções
   - Máscara para CNPJ/CPF, telefone, CEP
   - Seleção de tipo com ícones
   - Integração com API ViaCEP para buscar endereço

2. **EditSupplierDialog.tsx**
   - Similar ao Create, mas com dados pré-preenchidos
   - Opção de desativar fornecedor

3. **SupplierCard.tsx**
   - Card reutilizável para exibir fornecedor
   - Badge colorido por tipo
   - Ações rápidas (editar, desativar, contato)

4. **SupplierFilters.tsx**
   - Filtros por tipo
   - Filtro por status (ativo/inativo)
   - Busca em tempo real

### 4. Tipos TypeScript

```typescript
// types/supplier.ts
export enum SupplierType {
  PARTS = 'PARTS',
  WORKSHOP = 'WORKSHOP',
  RECTIFICATION = 'RECTIFICATION',
  OTHER = 'OTHER'
}

export interface Supplier {
  id: string;
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const SUPPLIER_TYPE_LABELS: Record<SupplierType, string> = {
  PARTS: 'Peças',
  WORKSHOP: 'Oficina',
  RECTIFICATION: 'Retífica',
  OTHER: 'Outros'
};

export const SUPPLIER_TYPE_ICONS: Record<SupplierType, string> = {
  PARTS: '📦',
  WORKSHOP: '🔧',
  RECTIFICATION: '⚙️',
  OTHER: '🏢'
};
```

### 5. Menu Lateral

Adicionar item no `AdminLayout.tsx`:
```typescript
{
  icon: Building2,
  label: 'Fornecedores',
  href: '/fornecedores'
}
```

**Posição sugerida:** Entre "Estoque" e "PDV"

### 6. Validações

- **Nome:** Obrigatório, mínimo 3 caracteres
- **Telefone:** Obrigatório, formato brasileiro
- **CNPJ/CPF:** Opcional, validação com algoritmo
- **E-mail:** Opcional, formato válido
- **CEP:** Opcional, formato 00000-000
- **Tipo:** Obrigatório, um dos enums

### 7. Features Adicionais

#### Fase 1 (Implementação Inicial)
- ✅ CRUD completo de fornecedores
- ✅ Filtros e busca
- ✅ Estatísticas básicas
- ✅ Importação CSV
- ✅ Validação de CNPJ/CPF

#### Fase 2 (Futuro)
- 📋 Histórico de compras por fornecedor
- 💰 Contas a pagar vinculadas
- 📊 Relatório de performance
- 🔔 Alertas de vencimento de pagamentos
- 📱 Integração WhatsApp para contato rápido
- 📄 Upload de documentos (contratos, notas)

## 🎨 Design System

### Cores por Tipo
- **Peças:** Azul (`blue-500`)
- **Oficina:** Laranja (`orange-500`)
- **Retífica:** Roxo (`purple-500`)
- **Outros:** Cinza (`slate-500`)

### Ícones (Lucide React)
- Menu: `Building2`
- Peças: `Package`
- Oficina: `Wrench`
- Retífica: `Settings`
- Outros: `Building`

## 📝 Checklist de Implementação

### Database
- [ ] Criar migration com tabela Supplier
- [ ] Criar enum SupplierType
- [ ] Adicionar índices necessários

### Backend
- [ ] Criar `/api/suppliers/route.ts` (GET, POST)
- [ ] Criar `/api/suppliers/[id]/route.ts` (GET, PUT, DELETE)
- [ ] Implementar validações
- [ ] Adicionar tratamento de erros

### Frontend - Estrutura
- [ ] Criar `/app/(dashboard)/fornecedores/page.tsx`
- [ ] Criar types em `/types/supplier.ts`
- [ ] Adicionar item no menu lateral

### Frontend - Componentes
- [ ] Criar `CreateSupplierDialog.tsx`
- [ ] Criar `EditSupplierDialog.tsx`
- [ ] Criar `SupplierCard.tsx` (opcional)
- [ ] Criar `ImportSuppliersCSV.tsx`

### Frontend - Features
- [ ] Implementar listagem com cards
- [ ] Implementar busca em tempo real
- [ ] Implementar filtros por tipo e status
- [ ] Implementar estatísticas no topo
- [ ] Adicionar máscaras de input
- [ ] Integrar ViaCEP para busca de endereço

### Testes
- [ ] Testar criação de fornecedor
- [ ] Testar edição de fornecedor
- [ ] Testar desativação de fornecedor
- [ ] Testar filtros e busca
- [ ] Testar importação CSV
- [ ] Validar responsividade

## 🚀 Ordem de Implementação

1. **Database** - Criar migration e executar
2. **Types** - Definir interfaces TypeScript
3. **API** - Implementar endpoints
4. **Components** - Criar dialogs e componentes
5. **Page** - Montar página principal
6. **Menu** - Adicionar ao layout
7. **Test** - Testar todas as funcionalidades

## 📊 Exemplo de Dados Iniciais

```sql
INSERT INTO "Supplier" (
  "id", "name", "tradeName", "document", "email", "phone", 
  "type", "city", "state", "isActive", "updatedAt"
) VALUES 
(
  'sup_001', 
  'Auto Peças Silva Ltda', 
  'Silva Auto Parts', 
  '12.345.678/0001-90', 
  'contato@silva.com', 
  '(11) 98765-4321',
  'PARTS', 
  'São Paulo', 
  'SP', 
  true, 
  CURRENT_TIMESTAMP
),
(
  'sup_002', 
  'Oficina Mecânica JR', 
  'JR Mecânica', 
  '98.765.432/0001-10', 
  'jr@oficina.com', 
  '(11) 91234-5678',
  'WORKSHOP', 
  'Guarulhos', 
  'SP', 
  true, 
  CURRENT_TIMESTAMP
);
```

## 🎯 Benefícios

1. **Organização** - Centralizar informações de todos os fornecedores
2. **Rastreabilidade** - Saber de onde vêm as peças e serviços
3. **Eficiência** - Contato rápido com fornecedores
4. **Controle** - Gerenciar fornecedores ativos/inativos
5. **Escalabilidade** - Base para módulo de compras futuro

---

**Pronto para implementar!** 🚀
