# Análise de Erros, Bugs e Melhorias Funcionais

## Erros/Bugs identificados

### 1) Build pode falhar em ambiente sem acesso ao Google Fonts
- **Sintoma:** `next build` falha ao baixar as fontes `Inter` e `Montserrat` em `src/app/layout.tsx`.
- **Impacto:** bloqueia pipeline de build/deploy em ambientes com rede restrita.
- **Recomendação:** usar fallback local (`next/font/local`) ou permitir fallback de fonte do sistema quando download externo falhar.

### 2) Logging de conexão de banco expunha parte da `DATABASE_URL`
- **Sintoma:** o log mostrava substring da connection string.
- **Impacto:** risco de exposição parcial de credenciais/host sensível em logs.
- **Correção aplicada:** sanitização da URL antes do log (somente protocolo/host/porta/database).

### 3) Tipagem fraca no client de banco (`any`)
- **Sintoma:** uso extensivo de `any` em `db.query/fetchOne/fetchAll`.
- **Impacto:** maior chance de bug em runtime e menor validação estática.
- **Correção aplicada:** adoção de generics + `unknown` para melhorar segurança de tipos.

### 4) Componente `Textarea` com tipo redundante
- **Sintoma:** interface vazia estendendo `TextareaHTMLAttributes`.
- **Impacto:** erro de lint (`no-empty-object-type`) e ruído de manutenção.
- **Correção aplicada:** troca para `type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>`.

## Problemas relevantes ainda pendentes (detectados)

1. **Lint global com alta quantidade de erros e warnings (121/104)**
   - Principais causas:
     - `require()` proibido em scripts `.js` utilitários
     - `any` em páginas e scripts
     - imports/variáveis não usados
     - hooks com dependências ausentes

2. **Potencial exposição de dados sensíveis em logs de erro SQL**
   - Atualmente o texto da query é logado parcialmente.
   - Recomenda-se mascarar parâmetros e limitar logs em produção.

3. **Warnings de hooks e imports não usados em páginas do dashboard**
   - Podem indicar código morto ou feature incompleta.

## Melhorias de funcionalidade sugeridas

1. **Painel de saúde operacional no dashboard**
   - Exibir latência de banco, status de conexão e falhas recentes.
   - Fonte: dados de `scripts/health-check.ts` ou endpoint dedicado.

2. **Mecanismo de fallback de fontes e assets críticos**
   - Evitar quebra total de build/render por dependência externa.

3. **Padronizar scripts utilitários para TypeScript/ESM**
   - Reduzir erros de lint e facilitar manutenção.

4. **Fluxo de observabilidade mínimo**
   - Criar contadores de erro por módulo (estoque, ordens, clientes).
   - Ajudar a priorizar correções por impacto real.

5. **Hardening de dados em produção**
   - Remover logs verbosos de query/connection em ambiente produtivo.
   - Adicionar trilha de auditoria para ações críticas.
