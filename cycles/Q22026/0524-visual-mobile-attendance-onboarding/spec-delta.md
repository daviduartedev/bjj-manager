# spec-delta.md — Large Cycle

## Cycle: 0524-visual-mobile-attendance-onboarding
## Status: PROMOVIDO (2026-05-27)

> Promovido para `spec/` durante a execução das stages (tasks 1.13, 2.15, 3.11, 4.11). Este arquivo documenta o delta histórico.

---

## Specs afetadas

### `spec/features/design-system/readme.md`

**Mudança:** utilitários DS-1.12 (`dashboard-hero-badge`, `dashboard-kpi-card--*`, `dashboard-empty-state`, `--content-wash-start`).

**Motivo:** Stage 1 — chrome premium propagado via layouts partilhados.

---

### `spec/features/student-portal/readme.md`

**Mudanças:**

- **SPT-6.2–6.4** marcados implementados (Stage 2) — `actions/attendances.ts`, UI sessão professor.
- **SPT-13** histórico aluno em `/portal/presenca` (Stage 3).
- **SPT-12** fase 4 atualizada para ✅ Implementado.

**Motivo:** presença operacional + histórico portal.

---

### `spec/features/student-profile/readme.md`

**Mudança:** **SPR-12** aba Presença no perfil — total + listagem paginada de `attendances`.

**Motivo:** Stage 3.

---

### `spec/features/students-crud/readme.md`

**Mudanças:** **STU-12.5–12.7** — criar Auth no servidor (convite ou senha temporária); senha one-shot; bloqueio arquivado.

**Motivo:** Stage 4.

---

### `spec/features/authentication/readme.md`

**Mudanças:** **AUTH-8.4–8.6** — Admin API (`createUser`, `inviteUserByEmail`) só servidor; provisionamento professor.

**Motivo:** Stage 4.

---

### `spec/features/app-shell/readme.md`

**Mudança:** **SHELL-9.2** — item Presença na nav do aluno; rota `/portal/presenca`.

**Motivo:** Stage 3.

---

### `spec/frontend.md`

**Mudança:** referência cruzada à rota `/portal/presenca`.

**Motivo:** Stage 3.

---

### `db/policies.sql` + migration 011

**Mudança:** política `attendances_student_select` — aluno SELECT só `student_id = current_student_id()`.

**Motivo:** Stage 3 — SPT-13 sem expor presenças de outros alunos.
