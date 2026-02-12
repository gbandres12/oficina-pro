# 📥 IMPORTAÇÃO FLEXÍVEL - DOCUMENTAÇÃO

## 🎯 **Mudanças Implementadas**

As APIs de importação foram **flexibilizadas** para aceitar dados parciais e permitir preenchimento posterior.

---

## ✅ **CLIENTES (`/api/clients/import`)**

### **Antes:**
- ❌ Obrigatório: `nome` + `telefone`
- ❌ Rejeita linhas sem telefone

### **Agora:**
- ✅ Obrigatório: **apenas `nome`**
- ✅ Aceita clientes sem telefone, email, documento ou endereço
- ✅ Pode preencher dados faltantes depois

### **Campos do CSV:**
| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| `nome` | ✅ SIM | Nome do cliente |
| `email` | ❌ Opcional | E-mail (normalizado para lowercase) |
| `telefone` | ❌ Opcional | Telefone (apenas números) |
| `cpf` | ❌ Opcional | CPF (apenas números) |
| `cnpj` | ❌ Opcional | CNPJ (apenas números) |
| `endereco` | ❌ Opcional | Endereço completo |

### **Exemplo de CSV válido:**
```csv
nome,email,telefone,cpf,cnpj,endereco
João Silva,joao@email.com,11999999999,12345678900,,Rua A 123
Maria Santos,,,,,
Pedro Oliveira,,11988888888,,,
Empresa XYZ,contato@xyz.com,,,,12345678000190,Av B 456
```

### **Normalização Automática:**
- Email: lowercase
- Telefone: apenas números (remove `()-` e espaços)
- CPF/CNPJ: apenas números
- Nome/Endereço: trim

### **Lógica de Duplicatas:**
1. Busca por telefone, documento ou email
2. Se não encontrar, busca por nome exato
3. Se existir: **atualiza** (preserva campos existentes se novo for vazio)
4. Se não existir: **cria novo**

---

## ✅ **PRODUTOS VIA NF-e XML (`/api/parts/import`)**

### **Antes:**
- ❌ Apenas extraia dados (não salvava no banco)
- ❌ Sem tratamento de campos vazios

### **Agora:**
- ✅ Obrigatório: **`nome` OU `SKU`**
- ✅ Salva automaticamente no banco de dados
- ✅ Soma estoque em updates
- ✅ Preço convertido para centavos

### **Campos Extraídos do XML (NF-e):**
| Campo XML | Campo BD | Obrigatório | Descrição |
|-----------|----------|-------------|-----------|
| `xProd` | `name` | ✅* | Nome do produto |
| `cProd` | `sku` | ✅* | Código do produto |
| `qCom` | `stock` | ❌ | Quantidade (padrão: 0) |
| `vUnCom` | `price` | ❌ | Preço unitário (centavos) |
| `NCM` | `ncm` | ❌ | Código NCM |

*Pelo menos um dos dois (nome OU SKU)

### **Comportamento:**
- **Novo produto:** Cria com estoque = quantidade da NF
- **Produto existente:** **SOMA** o estoque (não substitui)
- **Preço:** Atualiza apenas se novo preço > 0

---

## ✅ **PRODUTOS VIA JSON (`/api/stock/import`)**

### **Antes:**
- ❌ Esperava todos os campos

### **Agora:**
- ✅ Obrigatório: **`name` OU `sku`**
- ✅ Aceita campos vazios
- ✅ Gera SKU automático se não informado

### **Payload JSON:**
```json
{
  "items": [
    {
      "name": "Parafuso M8",
      "sku": "PAR-M8-001",
      "quantity": 100,
      "minQuantity": 10,
      "price": 1.50,
      "unit": "Un"
    },
    {
      "name": "Porca M8",
      "quantity": 50
      // SKU será gerado automaticamente
      // price padrão: 0
      // minQuantity padrão: 0
    },
    {
      "sku": "OLEO-5W30",
      "quantity": 20
      // name padrão: "Produto OLEO-5W30"
    }
  ]
}
```

### **Normalização Automática:**
- SKU: uppercase
- Preço: convertido para centavos (int)
- Quantity: convertido para int

### **GET Endpoint:**
```bash
GET /api/stock/import
```
Lista os 100 itens mais recentes do estoque

---

## 🔄 **LÓGICA DE UPSERT (INSERT + UPDATE)**

Todas as importações usam **upsert inteligente**:

### **INSERT (Novo registro):**
```sql
-- Cria novo registro com dados fornecidos
-- Campos vazios ficam como NULL
```

### **UPDATE (Registro existente):**
```sql
-- Usa COALESCE: mantém valor antigo se novo for NULL
-- Exemplo: COALESCE($novo_email, email_antigo)
```

**Resultado:** Você pode importar parcialmente várias vezes e complementar os dados!

---

## 📊 **RESPOSTA DAS APIs**

Todas retornam JSON estruturado:

```json
{
  "success": true,
  "imported": 15,      // Novos registros
  "updated": 5,        // Registros atualizados
  "total": 20,         // Total processado
  "errors": [          // Linhas com erro (opcional)
    "Linha ignorada: nome é obrigatório - {...}"
  ],
  "message": "✅ Importação concluída: 15 novos, 5 atualizados"
}
```

---

## 🧪 **TESTANDO**

### **1. Importar Clientes (CSV):**
```bash
curl -X POST http://localhost:3000/api/clients/import \
  -F "file=@clientes.csv"
```

### **2. Importar NF-e (XML):**
```bash
curl -X POST http://localhost:3000/api/parts/import \
  -F "file=@nota_fiscal.xml"
```

### **3. Importar Estoque (JSON):**
```bash
curl -X POST http://localhost:3000/api/stock/import \
  -H "Content-Type: application/json" \
  -d '{"items": [{"name": "Teste", "quantity": 10}]}'
```

### **4. Listar Estoque:**
```bash
curl http://localhost:3000/api/stock/import
```

---

## ⚠️ **REGRAS IMPORTANTES**

1. **Campos obrigatórios mínimos:**
   - Clientes: `nome`
   - Produtos: `nome` OU `sku`

2. **Normalização automática:**
   - Emails: lowercase
   - Telefones/CPF/CNPJ: apenas números
   - SKU: uppercase
   - Preços: centavos (int)

3. **Duplicatas:**
   - Clientes: telefone > documento > email > nome
   - Produtos: SKU > nome

4. **Updates preservam dados:**
   - Campos vazios não sobrescrevem dados existentes
   - Estoques são **somados** (não substituídos)

5. **Erros não param o processo:**
   - Linhas com erro são puladas
   - Outras linhas continuam sendo processadas
   - Lista de erros retornada no response

---

## 🎯 **CASOS DE USO**

### **Cenário 1: Importação rápida sem todos os dados**
```csv
nome,telefone
João Silva,
Maria Santos,11999999999
```
✅ Ambos importados! João sem telefone pode ser preenchido depois.

### **Cenário 2: Complementar dados existentes**
```csv
nome,email
João Silva,joao@email.com
```
✅ Atualiza o João criado antes, adicionando o email!

### **Cenário 3: NF-e com produtos novos e existentes**
- Produto novo: cria com estoque da NF
- Produto existente: **soma** estoque da NF ao existente

---

## 📝 **LOGS E DEBUG**

Erros são logados no console do servidor:
```bash
console.error('Erro ao importar clientes:', error);
```

Verifique logs em:
- Desenvolvimento: terminal onde roda `npm run dev`
- Produção: Vercel logs ou Supabase logs

---

**Atualizado:** 12/02/2026  
**Versão:** 2.0 (Importação Flexível)
