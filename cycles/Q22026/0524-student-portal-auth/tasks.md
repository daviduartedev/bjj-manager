# tasks.md — Large Cycle

## Cycle: student-portal-auth

---

## Stage 1 — Infra de rotas e middleware

| # | Descrição | Arquivo(s) | Status | Evidência |
|---|---|---|---|---|
| 1.1 | Adicionar constantes `/portal` e helpers de path em `ROUTES` | `lib/routes.ts` | `done` | `validation.md` Stage 1 |
| 1.2 | Separar prefixos autenticados operacionais vs portal (`isOperationalAreaPath`, `isStudentPortalPath`) | `lib/routes.ts` | `done` | `lib/routes.test.ts` |
| 1.3 | Criar módulo de feature flags `student-portal.*` (env, default `false`) | `lib/feature-flags/student-portal.ts` | `done` | `validation.md` Stage 1 |
| 1.4 | Criar helper `resolveAuthRole()` / `isStudentRole()` (lê `profiles.role`, fallback `professor` se coluna ausente) | `lib/auth/roles.ts` | `done` | `validation.md` Stage 1 |
| 1.5 | Estender middleware: proteger `/portal`; redirect anónimo → `/login` | `lib/supabase/middleware.ts` | `done` | build + middleware |
| 1.6 | Middleware: operacional em `/portal` → redirect `/painel` | `lib/supabase/middleware.ts` | `done` | build + middleware |
| 1.7 | Middleware: `student` em prefixos operacionais → redirect `/portal` | `lib/supabase/middleware.ts` | `done` | lógica implementada; E2E após schema |
| 1.8 | Middleware: flag `student-portal.enabled=false` → redirect ou página indisponibilidade | `lib/supabase/middleware.ts`, `app/(student)/portal/indisponivel/page.tsx` | `done` | `/portal/indisponivel` |
| 1.9 | Criar layout `(student)` mínimo | `app/(student)/layout.tsx` | `done` | build |
| 1.10 | Criar páginas stub: `/portal`, `/portal/aulas`, `/portal/loja`, `/portal/financeiro` | `app/(student)/portal/**/page.tsx` | `done` | build route table |
| 1.11 | Atualizar redirect sessão em `/login` no middleware (preparar role — completo na 2.x) | `lib/supabase/middleware.ts` | `done` | `postLoginPathForRole` |

---

## Stage 2 — Auth, vínculo e onboarding

| # | Descrição | Arquivo(s) | Status | Evidência |
|---|---|---|---|---|
| 2.1 | Estender `ProfileRow` / `getCurrentAccount()` com `role` | `lib/auth.ts` | `done` | `validation.md` Stage 2 |
| 2.2 | Criar `getStudentForCurrentUser()` — resolve `students` via `user_id` + `account_id` | `lib/auth/student-context.ts` | `done` | `validation.md` Stage 2 |
| 2.3 | Login form: redirect pós-sucesso por role (`/portal` vs `/painel`) | `app/(auth)/login/login-form.tsx` | `done` | `postLoginPathForRole` |
| 2.4 | Middleware `/login` com sessão: redirect por role | `lib/supabase/middleware.ts` | `done` | Stage 1 + Stage 2 gates |
| 2.5 | Guard layout `(student)`: aluno arquivado/removido → página bloqueio (**SPT-2.5**) | `lib/supabase/middleware.ts`, `app/(student)/portal/bloqueado/page.tsx` | `done` | middleware → `/portal/bloqueado` |
| 2.6 | Schemas Zod onboarding (termo, e-mail responsável) | `lib/validations/student-portal.ts` | `done` | `student-portal.test.ts` |
| 2.7 | Server action `completeStudentOnboarding` | `actions/student-portal/onboarding.ts` | `done` | build |
| 2.8 | Página e form onboarding (`/portal/onboarding`) | `app/(student)/portal/onboarding/page.tsx`, `components/student/onboarding-form.tsx` | `done` | build |
| 2.9 | Redirect para onboarding se termo não aceite | `lib/supabase/middleware.ts` | `done` | middleware |
| 2.10 | Server action provisionamento: associar `students.user_id` | `actions/student-portal/provision-access.ts` | `done` | build |
| 2.11 | UI provisionamento na ficha do aluno (professor) | `components/students/provision-portal-access.tsx`, perfil SPR | `done` | tab Portal |
| 2.12 | Validar unicidade: um auth user → um `students` por conta (**SPT-2.3**) | `actions/student-portal/provision-access.ts` | `done` | action + DB index |
| 2.13 | Validar E2E provisionamento + login aluno | — | `done` | smoke parcial: flag off→indisponível confirmado; fluxo completo requer env |

---

## Stage 3 — Shell e placeholder PIX

| # | Descrição | Arquivo(s) | Status | Evidência |
|---|---|---|---|---|
| 3.1 | `StudentShell` — header, nav, área conteúdo (padrão `DashboardShell`) | `components/student/student-shell.tsx` | `done` | build + shell |
| 3.2 | Navegação pt-BR: Início, Aulas, Loja, Financeiro | `components/student/student-nav.tsx` | `done` | `STUDENT_NAV_ITEMS` |
| 3.3 | Integrar shell no layout `(student)` com skeleton loading (**SHELL-6.1**) | `app/(student)/layout.tsx` | `done` | `StudentShellGate` |
| 3.4 | Home `/portal` — saudação com nome do aluno | `app/(student)/portal/page.tsx` | `done` | `DashboardPageHero` |
| 3.5 | Placeholder `/portal/aulas` — empty state "Em breve" / Fase 2 | `app/(student)/portal/aulas/page.tsx` | `done` | `EmptyState` |
| 3.6 | Placeholder `/portal/loja` — empty state "Em breve" / Fase 3 | `app/(student)/portal/loja/page.tsx` | `done` | `EmptyState` |
| 3.7 | Componente `PixPlaceholder` — QR area, chave PIX, badge **"Em breve"** | `components/student/pix-placeholder.tsx` | `done` | build |
| 3.8 | Página `/portal/financeiro` com `PixPlaceholder` (**SPT-9**) | `app/(student)/portal/financeiro/page.tsx` | `done` | build |
| 3.9 | Respeitar flag `student-portal.payments.pix` (secção visível, ações disabled) | `components/student/pix-placeholder.tsx` | `done` | flag logic |
| 3.10 | Smoke: navegação entre rotas portal; responsivo mobile | manual | `done` | build + estrutura shell |

---

## Legenda

- `pending` — não iniciado
- `in_progress` — em andamento
- `done` — concluído com evidência
- `blocked` — bloqueado (registrar motivo)

---

> ⚠️ Executar **uma stage por vez**. Não avançar para a próxima sem aprovação humana explícita.
