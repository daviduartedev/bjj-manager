# tasks.md — Large Cycle

## Cycle: 0609-graduation-edit-kids-protect-isento

---

## Stage 1 — Proteção Kids 1 / Kids 2

| # | Descrição | Arquivo(s) | Status | Evidência |
|---|---|---|---|---|
| 1.1 | Neutralizar `001_juvenil_plans_to_kids.sql`: remover bloco que move vínculos `kids_2`→`kids_1`; manter apenas UPDATEs seguros em `plans` (nome/preço) | `db/migrations/001_juvenil_plans_to_kids.sql` | `done` | Bloco DO removido |
| 1.2 | Documentar política: migrations **nunca** fazem mass-update de `student_plans` entre `kids_1`/`kids_2` | `docs/database/migrations-policy.md`, `spec/database.md` (via spec-delta) | `done` | `docs/database/migrations-policy.md` |
| 1.3 | Criar `scripts/validate-plan-assignments.cjs`: detecta SQL/migration com padrão proibido; opcionalmente snapshot COUNT `kids_2` abertos antes/depois | `scripts/validate-plan-assignments.cjs` | `done` | Static + DB snapshot |
| 1.4 | Invocar guardrail no fim de `pnpm db:apply` | `scripts/apply-db.cjs` | `done` | `require` + `main()` |
| 1.5 | Adicionar `pnpm db:validate-plans` e incluir no workflow CI | `package.json`, `.github/workflows/e2e-security.yml` | `done` | Step `--static-only` |
| 1.6 | Smoke: rodar `pnpm db:apply` + guardrail; humano confirma COUNT `kids_2` (~22) | `validation.md` | `done` | 22 estável ×2 applies |

---

## Stage 2 — Aluno Isento

| # | Descrição | Arquivo(s) | Status | Evidência |
|---|---|---|---|---|
| 2.1 | Migration `013`: `students.is_exempt boolean NOT NULL DEFAULT false` | `db/migrations/013_students_is_exempt.sql`, `db/schema.sql` | `done` | migration ok |
| 2.2 | RLS/policies inalteradas para tenant (UPDATE professor na própria conta) | `db/policies.sql`, `scripts/validate-rls.cjs` | `done` | coluna em `students`; policies existentes |
| 2.3 | Zod + `updateStudent` / edição rápida: toggle **Isento** | `lib/validations/students.ts`, `actions/students.ts`, formulários STU-8 | `done` | ficha + quick edit |
| 2.4 | **BR-9**: excluir `is_exempt = true` de `/mensalidades`, KPIs correlatos e `PBS-6` quando aplicável | `lib/billing/*`, `components/billing/mensalidades-client.tsx` | `done` | mensalidades-page + painel |
| 2.5 | **PBS-3**: isento não deriva `overdue`/`pending` por calendário | `lib/billing/month-billing-indicator.ts` + testes | `done` | indicator `exempt` + test |
| 2.6 | **SPR-8**: secção Financeiro simplificada (“Isento”); omitir plano, vencimento, atraso, CTA pagamento | perfil + ficha editar | `done` | student-profile-client |
| 2.7 | Lista de alunos: badge/chip **Isento** no resumo (opcional, legível) | `components/students/*` | `done` | StudentExemptBadge |
| 2.8 | Smoke manual + testes unitários indicador | `validation.md` | `done` | 186 tests PASS |

---

## Stage 3 — Graduação editável + peso + visual

| # | Descrição | Arquivo(s) | Status | Evidência |
|---|---|---|---|---|
| 3.1 | Migration `014`: `student_graduations.weight_kg numeric(5,1) NULL` + CHECK 20.0–250.0 quando não nulo | `db/migrations/014_*.sql`, `db/schema.sql` | `done` | `pnpm db:apply` PASS |
| 3.2 | Actions `addGraduation` / `updateGraduation` (sem DELETE); transaccional; sync `students.current_*` | `actions/graduations.ts`, `lib/graduation/*` | `done` | promote + add + update |
| 3.3 | Validações GRD-3 em edição (sem demotion, sem no-op, grau +1 mesma faixa, pulo com justificativa) | `lib/graduation/*`, `lib/validations/graduations.ts` | `done` | belt-order + actions |
| 3.4 | Peso kg: Zod `20.0–250.0`, uma casa decimal, opcional | `lib/validations/graduations.ts` | `done` | graduations.test.ts |
| 3.5 | Componente `BeltIllustration` (adulto monocromático + kids bicolor + listras de grau) | `components/graduation/belt-illustration.tsx` | `done` | belt-colors.ts |
| 3.6 | UI histórico completo: editar/adicionar evento (modal ou inline); exibir peso e ilustração | `/alunos/[id]/graduacoes` | `done` | graduations-page-client |
| 3.7 | UI perfil **SPR-7**: ilustração no separador Graduação; tempo na faixa/grau coerente pós-edição | perfil aluno | `done` | student-profile-client |
| 3.8 | Testes domínio graduação + smoke manual | `*.test.ts`, `validation.md` | `done` | 195 tests PASS |

---

## Fechamento do cycle

| # | Descrição | Arquivo(s) | Status | Evidência |
|---|---|---|---|---|
| F.1 | `/review-implementation` → `review.md` | `review.md` | `pending` | — |
| F.2 | `/validate-cycle` → `validation.md` (todas as stages) | `validation.md` | `pending` | — |
| F.3 | Promover `spec-delta.md` via `/update-spec` | `spec/` | `pending` | — |
| F.4 | `/close-cycle` | — | `pending` | — |

---

## Legenda

- `pending` — não iniciado
- `in_progress` — em andamento
- `done` — concluído com evidência
- `blocked` — bloqueado (registrar motivo)

---

> ⚠️ Executar **uma stage por vez**. Não avançar para a próxima sem aprovação humana explícita.
