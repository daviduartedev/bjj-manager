# Authentication

## Context
Sem autenticação não há multi-tenant. RLS já está ativo no banco; agora
ligamos o front a Supabase Auth e garantimos que cada signup gera
`account` + `profile` para isolar a academia daquele professor. Apenas
professores/admins acessam — alunos não têm login no MVP.

## Intent
- Páginas:
  - `app/(auth)/login/page.tsx`
  - `app/(auth)/register/page.tsx`
  - `app/(auth)/forgot-password/page.tsx` (opcional)
- Server Actions: `signIn`, `signUp`, `signOut`,
  `requestPasswordReset`.
- No signup, criar atomicamente:
  1. usuário em `auth.users`,
  2. `account` (a academia),
  3. `profile` ligando user → account, com `role = 'owner'`.
- `middleware.ts` redireciona não-autenticados das rotas `(dashboard)`
  para `/login`.
- Helper `lib/auth.ts` com `getCurrentUser()` e `getCurrentAccount()`.
- Layout `(auth)` minimalista (preto + vermelho), sem sidebar.
- Validações com Zod centralizadas em `lib/validations/auth.ts`.
- Erros inline no formulário (e-mail já existe, senha curta, etc.).

## Taste / Constraints
- Apenas e-mail/senha no MVP. OAuth fica para o roadmap.
- Cookies HttpOnly via `@supabase/ssr`.
- Tratar race entre criar usuário e criar account/profile (Server
  Action transacional ou trigger Postgres no `auth.users`).
- Mensagens de erro em português, claras, sem jargão.
- Tela de login mobile-first, botão com estado loading.

## References
- `cycles/Q22026/04-0430-supabase-schema/request.md`
- `cycles/Q22026/05-0430-rls-and-security/request.md`
- `lib/supabase/{client,server,middleware}.ts` (já criados).
- `middleware.ts` (já chama `updateSession`).

## Attachments
- (nenhum)
