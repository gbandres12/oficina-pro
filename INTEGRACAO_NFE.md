# 📋 Guia de Integração - Emissão de Nota Fiscal (NF-e)

## 🎯 Objetivo
Integrar o sistema Andres Oficina Pro com uma API de emissão de Nota Fiscal Eletrônica para oficinas mecânicas.

---

## 📦 Pré-requisitos

### 1. Certificado Digital
- **Tipo**: Certificado A1 (arquivo .pfx)
- **Onde obter**: Certisign, Serasa, Valid, etc.
- **Custo**: ~R$ 150-300/ano
- **Necessário para**: Assinar digitalmente as notas

### 2. Inscrição Estadual
- Seu CNPJ precisa estar ativo na SEFAZ
- Configurar regime tributário (Simples Nacional, Lucro Presumido, etc.)

### 3. Provedor de API
- Escolher uma plataforma de homologação/produção
- **Recomendado**: FocusNFe ou NFe.io

---

## 🔧 Passo a Passo Técnico

### **Etapa 1: Cadastro no Provedor**

1. Acesse [FocusNFe](https://focusnfe.com.br/)
2. Crie uma conta de teste (gratuita)
3. Baixe seu **Certificado Digital A1**
4. Faça upload do certificado no painel do provedor
5. Copie sua **API Token** (chave secreta)

### **Etapa 2: Configuração do Projeto**

Adicione as variáveis de ambiente no arquivo `.env`:

```env
# API de Nota Fiscal
NFE_API_URL=https://api.focusnfe.com.br
NFE_API_TOKEN=seu_token_aqui
NFE_ENVIRONMENT=homologacao
```

### **Etapa 3: Instalação de Dependências**

```bash
npm install axios
```

### **Etapa 4: Estrutura de Dados**

#### Adicionar campos na tabela `ServiceOrder`:

```sql
ALTER TABLE "ServiceOrder" 
ADD COLUMN "nfeNumber" VARCHAR(50),
ADD COLUMN "nfeKey" VARCHAR(44),
ADD COLUMN "nfeStatus" VARCHAR(20),
ADD COLUMN "nfePdfUrl" TEXT,
ADD COLUMN "nfeXmlUrl" TEXT,
ADD COLUMN "nfeEmissionDate" TIMESTAMP;
```

#### Criar tabela de impostos:

```sql
CREATE TABLE "TaxConfiguration" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "serviceName" VARCHAR(255),
    "icmsRate" DECIMAL(5,2),
    "pisRate" DECIMAL(5,2),
    "cofinsRate" DECIMAL(5,2),
    "issRate" DECIMAL(5,2),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Etapa 5: Criar API Route de Emissão**

Arquivo: `src/app/api/nfe/emitir/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        const { serviceOrderId } = await request.json();
        
        // 1. Buscar dados da OS no banco
        const order = await getServiceOrder(serviceOrderId);
        
        // 2. Montar payload para a API
        const nfeData = {
            natureza_operacao: "PRESTACAO DE SERVICOS",
            data_emissao: new Date().toISOString(),
            tipo_documento: "1", // 1 = Saída
            finalidade_emissao: "1", // 1 = Normal
            cnpj_emitente: process.env.COMPANY_CNPJ,
            nome_emitente: process.env.COMPANY_NAME,
            
            // Dados do cliente
            cpf_destinatario: order.client.cpf,
            nome_destinatario: order.client.name,
            
            // Itens da nota
            items: order.items.map(item => ({
                numero_item: item.id,
                codigo_produto: item.sku,
                descricao: item.description,
                cfop: "5933", // Prestação de serviço
                unidade_comercial: "UN",
                quantidade_comercial: item.quantity,
                valor_unitario: item.price,
                valor_total: item.quantity * item.price,
                
                // Impostos
                icms_situacao_tributaria: "102",
                pis_situacao_tributaria: "07",
                cofins_situacao_tributaria: "07"
            }))
        };
        
        // 3. Enviar para a API do provedor
        const response = await axios.post(
            `${process.env.NFE_API_URL}/v2/nfe`,
            nfeData,
            {
                headers: {
                    'Authorization': `Basic ${Buffer.from(process.env.NFE_API_TOKEN + ':').toString('base64')}`
                }
            }
        );
        
        // 4. Salvar referência da NF-e no banco
        await updateServiceOrder(serviceOrderId, {
            nfeNumber: response.data.numero,
            nfeKey: response.data.chave_nfe,
            nfeStatus: 'PROCESSANDO',
            nfeEmissionDate: new Date()
        });
        
        return NextResponse.json({
            success: true,
            nfeNumber: response.data.numero,
            message: 'Nota fiscal em processamento'
        });
        
    } catch (error) {
        console.error('Erro ao emitir NF-e:', error);
        return NextResponse.json(
            { error: 'Erro ao emitir nota fiscal' },
            { status: 500 }
        );
    }
}
```

### **Etapa 6: Criar Webhook para Receber Status**

Arquivo: `src/app/api/nfe/webhook/route.ts`

```typescript
export async function POST(request: NextRequest) {
    const data = await request.json();
    
    // Quando a SEFAZ autorizar a nota
    if (data.status === 'autorizado') {
        await updateServiceOrder(data.serviceOrderId, {
            nfeStatus: 'AUTORIZADA',
            nfePdfUrl: data.caminho_danfe,
            nfeXmlUrl: data.caminho_xml_nota_fiscal
        });
        
        // Enviar e-mail ao cliente com a DANFE
        await sendEmailWithNFe(data.serviceOrderId);
    }
    
    return NextResponse.json({ received: true });
}
```

---

## 🧪 Testando em Homologação

1. **Certificado de Teste**: Use o certificado de homologação fornecido pelo provedor
2. **CNPJ de Teste**: Use CNPJs fictícios disponíveis na documentação
3. **Verificação**: Confira se o XML gerado está correto no painel do provedor

---

## 📊 Fluxo Completo

```
1. Cliente finaliza OS na oficina
   ↓
2. Sistema clica em "Emitir NF-e"
   ↓
3. API envia dados para FocusNFe
   ↓
4. FocusNFe envia para SEFAZ
   ↓
5. SEFAZ valida e autoriza
   ↓
6. Webhook atualiza status no sistema
   ↓
7. Cliente recebe PDF (DANFE) por e-mail
```

---

## 💰 Custos Estimados

- **Certificado Digital**: R$ 150-300/ano
- **API FocusNFe**: 
  - Grátis até 10 NF-e/mês
  - Plano básico: R$ 49/mês (até 100 NF-e)
  - Plano profissional: R$ 99/mês (ilimitado)

---

## 🔐 Segurança

- **NUNCA** commite o certificado .pfx no Git
- Use variáveis de ambiente para tokens
- Mantenha backups dos XMLs das notas (obrigatório por 5 anos)

---

## 📚 Documentação Oficial

- [FocusNFe - Documentação](https://focusnfe.com.br/documentacao/)
- [NFe.io - API Docs](https://nfe.io/docs)
- [SEFAZ - Manual NF-e](http://www.nfe.fazenda.gov.br/)

---

## 🎯 Próximos Passos

1. [ ] Criar conta no provedor de NF-e
2. [ ] Obter certificado digital A1
3. [ ] Adicionar campos de NF-e no banco de dados
4. [ ] Implementar rota de emissão
5. [ ] Configurar webhook para status
6. [ ] Testar em homologação
7. [ ] Migrar para produção
