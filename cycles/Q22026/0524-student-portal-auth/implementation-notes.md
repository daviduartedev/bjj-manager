# implementation-notes.md — Large Cycle

## Cycle: student-portal-auth

> Diário técnico do cycle. Registre decisões, problemas encontrados, desvios de plano e aprendizados.
> Atualizado continuamente durante a execução — não apenas ao final.

---

## Stage 1 — Infra de rotas e middleware

### Decisões técnicas

- **Env flags:** `NEXT_PUBLIC_STUDENT_PORTAL_ENABLED` (e sub-flags `*_CLASSES_CHECKIN`, `*_SHOP`, `*_PAYMENTS_PIX`) em `lib/feature-flags/student-portal.ts`; default `false` (**SPT-11**).
- **Rotas:** `OPERATIONAL_PATH_PREFIXES` vs `STUDENT_PORTAL_PATH_PREFIXES`; `isAuthenticatedAreaPath` mantido como alias deprecated.
- **Role fallback:** `resolveAuthRole()` devolve `professor` em qualquer erro de query (coluna `profiles.role` ainda inexistente no schema).
- **Flag desligada:** aluno (`student`) em `/portal/*` → redirect `/portal/indisponivel`; página de indisponibilidade acessível mesmo com flag off.
- **Login redirect:** middleware usa `postLoginPathForRole()`; login form client-side permanece em Stage 2 (task 2.3).

### Problemas encontrados

- **`profiles.role` inexistente:** query falha silenciosamente → fallback `professor`. Cenários de isolamento student↔operacional só testáveis após cycle de schema.
- Nenhum blocker de build ou testes.

### Desvios do plano

- Adicionado `lib/routes.test.ts` (4 testes) — cobertura dos helpers de prefixo; não estava no plano mas reforça regressão.

### Notas de rollback / mitigação

- Manter `NEXT_PUBLIC_STUDENT_PORTAL_ENABLED=false` (default) oculta portal para alunos via redirect a `/portal/indisponivel`.
- Remover grupo `app/(student)/` e revert `lib/supabase/middleware.ts` restaura comportamento pré-Fase 1.

---

## Stage 2 — Auth, vínculo e onboarding

### Decisões técnicas

- **Guards onboarding/arquivado no middleware** (não layout) — alinha com SHELL-5.2 para redirects; evita pathname em server layout.
- **Provisionamento:** `lib/supabase/admin.ts` + `SUPABASE_SERVICE_ROLE_KEY` para lookup Auth por e-mail e INSERT em `profiles` (RLS não permite INSERT authenticated).
- **Onboarding persistido** em `students.portal_terms_accepted_at` + `guardian_email` (schema cycle 009).
- **Menores:** `kind = kids` ou idade &lt; 18 exige e-mail responsável.

### Problemas encontrados

- Typo syntax em `isMinorForPortalGuardian` — corrigido.
- Provisionamento falha graciosamente se service role ausente (mensagem ao professor).

### Desvios do plano

- Tab **Portal** no perfil SPR (`/alunos/[id]`) em vez de página editar — melhor UX operacional.
- Task 2.5/2.9 implementadas no middleware em vez de `(student)/layout.tsx`.

### Notas de rollback / mitigação

- Remover `SUPABASE_SERVICE_ROLE_KEY` desactiva provisionamento UI; vínculos manuais via SQL (`docs/security/rls.md`) continuam possíveis.

---

## Stage 3 — Shell e placeholder PIX

### Decisões técnicas

- **StudentShell** espelha `DashboardShell` (sidebar, top bar, bottom nav, skeleton **SHELL-6.1**) sem tour guiado; menu do utilizador só com **Sair** (aluno não acede `/perfil`).
- **`StudentShellGate`** (client): omite shell em rotas isentas (`/portal/onboarding`, `/portal/bloqueado`, `/portal/indisponivel`) via `isPortalExemptFromOnboardingPath`.
- **Nav** em `STUDENT_NAV_ITEMS`: Início, Aulas, Loja, Financeiro — reutiliza `ShellNavLink` e chrome escuro do dashboard.
- **PixPlaceholder:** secção sempre visível; botões desactivados quando `NEXT_PUBLIC_STUDENT_PORTAL_PAYMENTS_PIX=false` (default); badge **Em breve** permanente na Fase 1.

### Problemas encontrados

- Nenhum blocker de build ou testes.

### Desvios do plano

- Adicionado `student-shell-gate.tsx` para excluir shell das páginas de fluxo (onboarding/bloqueado/indisponível) — não listado no plano mas evita nav indevida nessas rotas.

### Notas de rollback / mitigação

- Reverter `app/(student)/layout.tsx` para wrapper mínimo restaura stubs sem shell; páginas mantêm conteúdo standalone.

---

## Tech debt identificado

- **Smoke E2E Playwright** para provision → login → onboarding → navegação portal (cenários Fase 1)
- **Convite Supabase por e-mail:** fora v1; associar Auth existente apenas
- **Documentação env:** `NEXT_PUBLIC_STUDENT_PORTAL_*`, `SUPABASE_SERVICE_ROLE_KEY` no README
- **`/security-review`** pendente antes de fechar o cycle

---

## Aprendizados

- Flag master off redireciona **todo** `/portal/*` para indisponível — incluindo onboarding; activar flag antes de testar onboarding.
- Schema cycle desbloqueou role/isolamento; provisionamento continua dependente de service role no servidor.
