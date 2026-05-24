# review.md — Medium Cycle

## Cycle: 0524-student-portal-schema
## Revisor: agente + humano (smoke professor)
## Data: 2026-05-24

---

## Escopo

- [x] Implementação cobre tudo que está em `tasks.md`
- [x] Nada foi implementado fora do escopo do `request.md`
- [x] Sem features extras não solicitadas (sem tabelas Fase 2–3, sem código app)

---

## Código / SQL

- [x] Migration idempotente (`IF NOT EXISTS`, `DO $$` para enum)
- [x] `schema.sql` e migration 009 consistentes (índices `user_id` só na migration)
- [x] Políticas DROP IF EXISTS antes de CREATE (padrão `policies.sql`)
- [x] Default `professor` preserva comportamento de utilizadores existentes
- [x] FK `students.user_id` ON DELETE `SET NULL` documentado

---

## Segurança

- [x] Aluno isolado: não lê `students` de colegas (**SEC-3.7**)
- [x] Professor inalterado em isolamento cross-tenant (**SEC-4.1**)
- [x] `profiles.role` não escalável via UPDATE client-side
- [x] `current_profile_role()` SECURITY DEFINER com `search_path` fixo
- [x] Anon continua sem linhas em tabelas de domínio
- [x] SQL do cycle sem DML em dados de produção

---

## Testes

- [x] `validate-rls.cjs` cobre papel student sem quebrar cenários A/B
- [x] Cenário INSERT cross-account ainda falha para professor
- [x] Cenário student onboarding + role escalation cobertos
- [x] E2E IDOR/RLS REST passam com `--workers=1`

---

## Findings

### Blockers (impedem fechamento)
- Nenhum.

### Warnings (devem ser resolvidos ou documentados)
- E2E login flaky com 12 workers paralelos no mesmo `E2E_USER_A` — usar `--workers=1` localmente ou fixture `storageState` (tech debt SECE2E).

### Recommendations (tech debt / melhoria futura)
- Column-level restriction em `students` UPDATE (trigger) se app layer não bastar na Stage 2 auth
- Promover `spec-delta.md` via `/update-spec`
- Cookie `httpOnly` em fluxo browser client (**SECE2E-1.8**)

---

## Conclusão

- [x] Sem blockers
- [x] Warnings resolvidos ou documentados
- [x] Pronto para `/close-cycle`
