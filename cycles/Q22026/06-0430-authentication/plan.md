# Plano (delta) , ciclo 06-0430-authentication

Refino alinhado às respostas do produto (login-only no MVP, sem registro na app, sem recuperação de senha neste ciclo, um utilizador provisionado manualmente, pós-login em `/dashboard`).

## Decisões travadas

| Tema | Decisão |
|------|---------|
| Registro público | **Fora do MVP**. Nenhuma página ou fluxo de criação de conta na aplicação. |
| Recuperação de senha | **Fora deste ciclo** (e do MVP imediato); credenciais geridas pelo operador (Supabase / comunicação direta). |
| Pós-login | Redirecionar para **`/dashboard`** (URL canónica da área operacional). |
| Bootstrap conta/perfil | **Manual**: Supabase Auth + SQL conforme [`docs/security/rls.md`](../../../docs/security/rls.md). Mantém coerência com **SEC-2.2** (sem `INSERT` em `accounts`/`profiles` para o papel `authenticated`). |
| Evolução futura (autocadastro) | Quando existir, o encaixe recomendado é **trigger `SECURITY DEFINER` em `auth.users`** (ou função invocada pelo trigger) para criar `accounts` + `profiles` numa única transação no Postgres , evita expor `service_role` no app e alinha com RLS. **Não** faz parte deste ciclo. |
| Confirmação de e-mail | Sem requisito de produto extra; segue a configuração do projeto Supabase (já tolerada no login atual). |
| Sessão | Comportamento **default** do Supabase + `@supabase/ssr` (sem “lembrar-me” custom). |
| `/login` com sessão ativa | Redirecionar para **`/dashboard`**. |
| Erros | Mapear respostas Supabase para mensagens em **pt-BR**; feedback imediato via **toasts** (stack já usa **Sonner**). |
| Compliance no signup | **Nada** neste ciclo (termos/LGPD em ciclo dedicado). |

## Delta em relação ao `request.md` original do ciclo

- Remove do escopo deste ciclo: `register`, `forgot-password`, `signUp`, `requestPasswordReset`, e criação atómica via app.
- Mantém e foca: `login`, proteção de rotas, `signOut`, helpers de sessão/conta, layout `(auth)`, validação Zod para login, integração SSR/cookies.
- Inclui: rota **`/dashboard`** (stub ou shell mínimo) como destino pós-login e para middleware.

## Artefatos canónicos tocados

- Novo: [`spec/features/authentication/readme.md`](../../../spec/features/authentication/readme.md) (**AUTH-**).
- Atualizar: [`spec/README.md`](../../../spec/README.md), [`spec/product/spec.md`](../../../spec/product/spec.md), [`docs/product/spec.md`](../../../docs/product/spec.md), [`spec/product/entities.md`](../../../spec/product/entities.md) (nota de provisionamento).
- Referência cruzada opcional: [`spec/features/rls-security/readme.md`](../../../spec/features/rls-security/readme.md) → feature auth.

## Implementação (para `tasks.md`)

- Middleware: sessão anónima que acede a `/dashboard` → `/login`; utilizador autenticado em `/login` → `/dashboard`.
- Remover referências de UI a “criar conta” / `/register` na landing e no formulário de login; `/register` não é rota de produto no MVP (redirect 307 para `/login` ou 404 , escolha única documentada em **AUTH-** / tarefas).
- `lib/auth.ts`: `getCurrentUser()`, `getCurrentAccount()` (e tratamento de utilizador sem `profiles` , estado inválido para domínio, mensagem clara).
- Centralizar schema Zod de login em `lib/validations/auth.ts`.
- Server Actions ou caminho server-first alinhado ao pacote SSR (detalhe na execução), sem expor chaves privilegiadas ao cliente.
