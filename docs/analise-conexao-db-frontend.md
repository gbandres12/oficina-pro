# Análise da conexão entre banco de dados e front-end

## Resumo executivo

A aplicação segue um modelo **front-end (React Client Components) → rotas API do Next.js (`/api/*`) → PostgreSQL (Supabase) via `pg`**, sem acesso direto do navegador ao banco para operações sensíveis.

Na prática, o fluxo principal está funcional para cadastro/autenticação/importação, mas há sinais de dívida técnica e risco de segurança:

- uso de credenciais hardcoded para Supabase em código-fonte;
- logs com prefixo de `DATABASE_URL`;
- inconsistência entre presença de Prisma no projeto e uso real de SQL manual;
- tela de estoque parcialmente desconectada do banco (catálogo exibido com dados mockados).

---

## 1) Arquitetura atual de ponta a ponta

## 1.1 Camada de front-end

As telas client-side fazem chamadas `fetch` para rotas internas:

- Login/Cadastro: `POST /api/register` na tela inicial.
- Gestão de usuários: `GET/POST /api/users`.
- Estoque (importação): `POST /api/stock/import` (JSON) e `POST /api/parts/import` (XML).

Isso indica que o browser não envia queries SQL diretamente; ele conversa com o backend Next.js.

## 1.2 Camada de API/backend

As rotas em `src/app/api/**/route.ts` usam `db` de `src/lib/db.ts`, que encapsula um `Pool` do `pg` com `DATABASE_URL`, SSL e limites de conexão.

Essa camada centraliza o acesso SQL e retorna JSON para o front-end.

## 1.3 Camada de banco

O `db.ts` abre pool PostgreSQL via `DATABASE_URL` e executa queries parametrizadas (`$1`, `$2`, ...), o que reduz risco de SQL Injection nas rotas analisadas.

---

## 2) Mapeamento de fluxos front ↔ banco

## 2.1 Autenticação

1. Front chama `signIn("credentials")`.
2. Provider de credenciais (`src/auth.ts`) busca usuário via SQL direto em `"User"`.
3. Senha é comparada com `bcrypt-ts`.
4. Sessão/JWT recebe `role` para autorização no app.

**Conexão com banco:** direta no servidor (route/auth), sem exposição da query ao cliente.

## 2.2 Registro inicial

1. Front (`src/app/page.tsx`) envia `name/email/password` para `POST /api/register`.
2. API valida campos, verifica e-mail existente e insere usuário com hash.

**Conexão com banco:** via `db.fetchOne` com SQL parametrizado.

## 2.3 Gestão de usuários

1. Front da página de usuários chama `GET /api/users` para listagem.
2. No submit, chama `POST /api/users`.
3. API exige sessão e papel `ADMIN`.
4. API consulta/insere no banco.

**Conexão com banco:** consistente e protegida por autorização server-side.

## 2.4 Estoque/importação

- Upload JSON: front chama `/api/stock/import`, que faz `upsert` em `InventoryItem`.
- Upload XML: front chama `/api/parts/import`, que apenas parseia XML e retorna itens extraídos (sem persistir no banco hoje).

**Conexão com banco:** parcial.

---

## 3) Pontos fortes identificados

- Separação correta browser vs servidor para acesso ao banco.
- Uso de SQL parametrizado em rotas principais.
- Controle de autorização em `/api/users` com `auth()` e `role`.
- Pool de conexões com limites explícitos para evitar exaustão.

---

## 4) Riscos e lacunas

## 4.1 Credenciais sensíveis hardcoded

Há chaves e URLs Supabase hardcoded em `src/lib/supabase.ts`, inclusive chave de service role no servidor.

**Impacto:** alto risco de vazamento/abuso de dados caso o código seja exposto.

## 4.2 Logs potencialmente sensíveis

`src/lib/db.ts` registra prefixo da `DATABASE_URL`. Mesmo parcial, é melhor evitar log de cadeia de conexão em produção.

## 4.3 Estoque visual ainda não usa banco para catálogo

A tela de estoque renderiza array local `parts` fixo para tabela e indicadores. A importação grava/parseia, mas a visualização não reflete o estado real do banco.

## 4.4 Prisma não está fechando o ciclo

O projeto possui schema Prisma, porém as rotas usam SQL manual com `pg` e alguns comentários mencionam integração futura por Prisma. Isso sugere stack híbrida não consolidada.

---

## 5) Conclusão

A conexão entre front-end e banco existe e está organizada no padrão recomendado de Next.js (front → API → banco). Para autenticação, cadastro e usuários, o encadeamento está claro e funcional.

Entretanto, para robustez de produção, o sistema precisa de ajustes prioritários de segurança (remoção de segredos hardcoded) e consistência funcional (estoque consumindo dados reais do banco em leitura).

---

## 6) Recomendações priorizadas

1. **Segurança imediata (P0):** remover todas as chaves hardcoded e migrar para variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`).
2. **Observabilidade segura (P1):** sanitizar logs de conexão no `db.ts` e manter logs de query apenas em desenvolvimento.
3. **Consistência funcional (P1):** criar endpoint `GET /api/stock` e substituir `parts` mockados na UI por dados reais de `InventoryItem`.
4. **Padronização de acesso a dados (P2):** decidir entre manter SQL manual com `pg` ou migrar para Prisma de forma completa.
5. **Hardening (P2):** adicionar validação de payload (ex.: Zod) nas rotas de importação e limites de tamanho/quantidade para uploads.
