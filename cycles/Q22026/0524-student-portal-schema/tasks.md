# tasks.md — Medium Cycle

## Cycle: 0524-student-portal-schema

---

## Tasks

| # | Descrição | Arquivo(s) | Status | Evidência |
|---|---|---|---|---|
| 1 | Criar migration `009_student_portal_phase1.sql`: enum `profile_role`, `profiles.role DEFAULT 'professor'`, `students.user_id` + onboarding columns, índice único parcial `(account_id, user_id)`, índice `idx_students_user_id` | `db/migrations/009_student_portal_phase1.sql` | `done` | DDL aditivo; cabeçalho anti-DML |
| 2 | Espelhar DDL em `db/schema.sql` (enum block, colunas `profiles`/`students`, constraints/índices) | `db/schema.sql` | `done` | enum + colunas; índices user_id só na migration |
| 3 | Adicionar `public.current_profile_role()` em `db/policies.sql` (STABLE, SECURITY DEFINER, GRANT authenticated) | `db/policies.sql` | `done` | função + GRANT |
| 4 | Substituir políticas `profiles` SELECT: operacional vê colegas da conta; `student` vê só `user_id = auth.uid()`. UPDATE self: WITH CHECK impede alteração de `role` | `db/policies.sql` | `done` | profiles_select_operational / _student_self |
| 5 | Substituir `students_tenant_all` por políticas separadas: operacional ALL por `account_id`; student SELECT/UPDATE só `user_id = auth.uid()` (sem INSERT/DELETE) | `db/policies.sql` | `done` | students_operational_all / _student_* |
| 6 | Estender `validate-rls.cjs`: fixture user student (role + `students.user_id`), assert isolamento (não vê alunos da conta do professor), professor A inalterado, student não INSERT cross-account | `scripts/validate-rls.cjs` | `done` | E2E_STUDENT_EMAIL opcional; marcadores RLS-V-* |
| 7 | Actualizar `docs/security/rls.md`: resumo políticas Fase 1, passos bootstrap aluno de teste (role + vínculo) | `docs/security/rls.md` | `done` | secção bootstrap + tabela |
| 8 | Documentar rollback forward-only e ordem de deploy vs flag portal | `implementation-notes.md` | `done` | garantia anti-DML documentada |
| 9 | Aplicar migrations (`pnpm db:apply`) — **só com pedido explícito** | — | `done` | 2026-05-24: apply OK; migration 009 aplicada |
| 10 | Validar RLS (`pnpm db:validate-rls`) e registar output em `validation.md` | `validation.md` | `done` | PASS 2026-05-24; cenários student incluídos |

---

## Legenda

- `pending` — não iniciado
- `in_progress` — em andamento
- `done` — concluído com evidência
- `blocked` — bloqueado (registrar motivo)

---

> ⚠️ Não marque como `done` sem evidência. Registre evidência na coluna ou em `validation.md`.
