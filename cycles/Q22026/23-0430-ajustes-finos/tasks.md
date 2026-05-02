# Tarefas — Ciclo 23-0430-ajustes-finos

- [x] Landing: cards da secção funcionalidades + logo no CTA final (`landing-page.tsx`).
- [x] Constantes e i18n: `lib/billing/constants.ts`, `lib/i18n/domain-enums.ts`.
- [x] Regra **STU-4** / `planKindMatchesStudentKind` + formulários (`student-form`, `quick-edit-dialog`).
- [x] `db/seed.sql`, migração `db/migrations/001_juvenil_plans_to_kids.sql`, `scripts/apply-db.cjs`.
- [x] Copy UI: configuracoes, record-payment-dialog, import script.
- [x] Testes: `plan-kind.test.ts`, `students.test.ts`, `constants.test.ts`.
- [x] Specs canónicas (`spec/`, `docs/product/`, ciclo `plan.md` / `scenarios.feature`).
- [ ] Deploy: executar **`pnpm db:apply`** (ou só o ficheiro de migração) em cada ambiente Supabase antes de considerar dados migrados.

Verificação local: `pnpm test`, `pnpm type-check`, `pnpm lint`, opcional `pnpm test:e2e`.
