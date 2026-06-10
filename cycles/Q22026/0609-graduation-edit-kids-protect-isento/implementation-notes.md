# implementation-notes.md — Large Cycle

## Cycle: 0609-graduation-edit-kids-protect-isento

> Diário técnico do cycle. Registre decisões, problemas encontrados, desvios de plano e aprendizados.

---

## Stage 1 — Proteção Kids 1 / Kids 2

**Status:** concluída (2026-06-09)

### Decisões técnicas

- **Neutralização de `001`:** removido apenas o bloco `DO $$` que fechava vínculos `kids_2` e abria `kids_1`; mantidos UPDATEs idempotentes em `plans`.
- **Guardrail estático:** regex detecta par `UPDATE student_plans` + `INSERT INTO student_plans` referenciando `kids_2` e `kids_1` na mesma migration.
- **Snapshot DB:** `pnpm db:apply` e `pnpm db:validate-plans` reportam COUNT; `PLAN_GUARD_KIDS2_MIN_COUNT` opcional para ambientes que queiram falhar abaixo de um mínimo.

### Ficheiros alterados

| Ficheiro | Mudança |
|----------|---------|
| `db/migrations/001_juvenil_plans_to_kids.sql` | Removido mass-reassign |
| `docs/database/migrations-policy.md` | Novo — política |
| `scripts/validate-plan-assignments.cjs` | Novo — guardrail |
| `scripts/apply-db.cjs` | Chama guardrail no fim |
| `package.json` | Script `db:validate-plans` |
| `.github/workflows/e2e-security.yml` | Step `--static-only` no job validate-rls |

### Comandos e resultados

| Comando | Resultado |
|---------|-----------|
| `pnpm db:validate-plans --static-only` | PASS — 12 migrations |
| `pnpm db:apply` (1.ª execução) | PASS — kids_2 abertos = **22** |
| `pnpm db:apply` (2.ª execução) | PASS — kids_2 abertos = **22** (estável) |

### Problemas encontrados

- Nenhum.

### Desvios do plano

- `spec/database.md` não editado directamente (permanece proposta em `spec-delta.md` até `/update-spec`).

### Notas de rollback / mitigação

- Se regressão Kids 2 voltar a aparecer, verificar migrations novas com `pnpm db:validate-plans --static-only` antes de merge.

---

## Stage 2 — Aluno Isento

**Status:** concluída (2026-06-09)

### Decisões técnicas

- Coluna `students.is_exempt boolean NOT NULL DEFAULT false`.
- Indicador derivado `exempt` em PBS-3; isentos excluídos de `/mensalidades` e painel (BR-9).
- Plano/vencimento ocultos na UI quando isento; vínculo em DB preservado se existir.

### Ficheiros principais

- `db/migrations/013_students_is_exempt.sql`, `db/schema.sql`
- `lib/students/monthly-operational-wallet.ts`, `lib/billing/month-billing-indicator.ts`
- `lib/validations/students.ts`, `actions/students.ts`
- `components/students/student-form.tsx`, `quick-edit-dialog.tsx`, `student-profile-client.tsx`, `student-exempt-badge.tsx`

### Comandos

| Comando | Resultado |
|---------|-----------|
| `pnpm db:apply` | PASS |
| `pnpm test` | PASS (186) |
| `pnpm type-check` | PASS |
| `pnpm lint` | PASS |

---

## Stage 3 — Graduação editável + peso + visual

**Status:** concluída (2026-06-09)

### Decisões técnicas

- Cores de faixa mapeadas por `slug` em `lib/graduation/belt-colors.ts` (BD não tem `color_hex`).
- `promoteStudent` valida transição a partir de `students.current_*`; `addGraduation`/`updateGraduation` validam timeline completa (GRD-3 / GRD-6.4).
- Após mutação, `syncStudentCurrentFromEvents` recalcula faixa/grau actual pelo evento mais recente (`graduated_at`, desempate `created_at`).
- Perfil mostra até 5 eventos (SPR-7.3) + link «Ver histórico completo».

### Ficheiros principais

| Ficheiro | Mudança |
|----------|---------|
| `db/migrations/014_student_graduations_weight_kg.sql` | Coluna `weight_kg` |
| `actions/graduations.ts` | `promoteStudent`, `addGraduation`, `updateGraduation` |
| `lib/graduation/belt-order.ts` | Validação timeline GRD-3 |
| `lib/graduation/belt-colors.ts`, `belt-illustration.tsx` | Visual faixa |
| `lib/validations/graduations.ts` | Zod peso + evento |
| `app/(dashboard)/alunos/[id]/graduacoes/page.tsx` | Histórico completo |
| `components/graduation/graduation-event-dialog.tsx` | Modal partilhado |
| `components/students/student-profile-client.tsx` | SPR-7 ilustração + Promover |

### Comandos

| Comando | Resultado |
|---------|-----------|
| `pnpm db:apply` | PASS — migration 014; kids_2 = 22 |
| `pnpm test` | PASS (195) |
| `pnpm type-check` | PASS |
| `pnpm lint` | PASS |

### Desvios do plano

- Nenhum significativo.

---

## Tech debt identificado

- CI não executa snapshot DB de kids_2 (só análise estática); opcional adicionar step com `E2E_DATABASE_URL` se quiserem gate de contagem em PR.

---

## Aprendizados

- Reaplicar `schema.sql` + migrations completas era suficiente para reproduzir a regressão; neutralizar `001` + guardrail pós-apply impede recorrência.
