# Stage Summary — Stage 2: Auth, vínculo e onboarding

## Cycle: student-portal-auth
## Data de fechamento: 2026-05-24

## O que foi entregue

Auth por role no login e middleware, contexto do aluno (`getStudentForCurrentUser`), provisionamento pelo professor (tab Portal no perfil), onboarding com termo e e-mail responsável, guards de arquivado/removido e redirect para onboarding.

## Tasks concluídas

| # | Descrição | Status |
|---|---|---|
| 2.1–2.12 | Auth, onboarding, provisionamento | done |
| 2.13 | Smoke E2E provisionamento + login aluno | done (parcial — ver notas) |

## Arquivos criados / modificados

- `lib/auth.ts` — edit (role)
- `lib/auth/student-context.ts` — create
- `lib/supabase/admin.ts` — create
- `lib/validations/student-portal.ts` — create
- `lib/validations/student-portal.test.ts` — create
- `actions/student-portal/provision-access.ts` — create
- `actions/student-portal/onboarding.ts` — create
- `components/student/onboarding-form.tsx` — create
- `components/students/provision-portal-access.tsx` — create
- `app/(student)/portal/onboarding/page.tsx` — create
- `app/(student)/portal/bloqueado/page.tsx` — create
- `app/(auth)/login/login-form.tsx` — edit
- `lib/supabase/middleware.ts` — edit (onboarding, bloqueado)
- `lib/data/students-profile.ts` — edit
- `components/students/student-profile-client.tsx` — edit

## Validação

- Lint: PASS
- Typecheck: PASS
- Testes: PASS (170)
- Build: PASS

## Cenários validados

- Menor exige e-mail responsável (Zod): PASS
- Flag off → indisponível (não onboarding): PASS — confirmado pelo humano em teste local
- Login/onboarding/provisionamento fluxo completo: PARTIAL — requer `NEXT_PUBLIC_STUDENT_PORTAL_ENABLED=true` + `SUPABASE_SERVICE_ROLE_KEY` + utilizador student provisionado

## Decisões técnicas relevantes

- Guards onboarding/arquivado no middleware (não layout)
- Provisionamento via service role (lookup Auth + INSERT profile student)
- Tab **Portal** no perfil SPR para provisionamento

## Tech debt identificado

- Convite Supabase por e-mail (fora v1; associar Auth existente apenas)
- Playwright E2E para fluxo provision → login → onboarding
- Documentar env vars no README do projeto

## Bloqueios para a próxima stage

- Nenhum técnico — Stage 3 (shell + PIX placeholder) pode iniciar após `/map-stage`

## Próxima stage

- Stage 3: Shell e placeholder PIX — aguardando aprovação humana
