# Stage Summary — Stage 1: Infra de rotas e middleware

## Cycle: student-portal-auth
## Data de fechamento: 2026-05-24

## O que foi entregue

Infraestrutura inicial do portal do aluno: rotas `/portal/*`, feature flag master, helpers de role, middleware com proteção de sessão e isolamento operacional ↔ student, páginas stub e página de indisponibilidade.

## Tasks concluídas

| # | Descrição | Status |
|---|---|---|
| 1.1–1.11 | Rotas, flags, middleware, layout e stubs | done |

## Arquivos criados / modificados

- `lib/routes.ts` — edit
- `lib/routes.test.ts` — create
- `lib/feature-flags/student-portal.ts` — create
- `lib/auth/roles.ts` — create
- `lib/supabase/middleware.ts` — edit
- `app/(student)/layout.tsx` — create
- `app/(student)/portal/**/page.tsx` — create (stubs + indisponivel)

## Validação

- Lint: PASS
- Typecheck: PASS
- Testes: PASS (168)
- Build: PASS

## Cenários validados

- Anónimo bloqueado em `/portal*`: PASS (middleware + build)
- Professor bloqueado em `/portal*`: PASS
- Flag master off → indisponibilidade: PASS (comportamento confirmado na Stage 2)

## Decisões técnicas relevantes

- Default `NEXT_PUBLIC_STUDENT_PORTAL_ENABLED=false`
- `resolveAuthRole()` com fallback `professor` se query falhar

## Tech debt identificado

- Smoke E2E automatizado para isolamento student (Playwright) — Fase 4

## Bloqueios para a próxima stage

- Schema `profiles.role` necessário para validar redirects student (resolvido pelo cycle `0524-student-portal-schema` antes/durante Stage 2)

## Próxima stage

- Stage 2: Auth, vínculo e onboarding — concluída em seguida
