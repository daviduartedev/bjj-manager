# implementation-notes.md — Medium Cycle (documental)

## Cycle: student-portal-foundation
## Data: 2026-05-24

---

## Restrição zero (regra do humano)

**Nenhum script ou SQL que altere dados no banco** foi gerado neste cycle. Nenhuma migration, nenhum ficheiro em `db/`, nenhum `apply-db`, nenhuma alteração de schema em runtime.

---

## Decisões registadas

- Prefixo de rotas: **`/portal`** (grupo `(student)`).
- Auth: `profiles.role = student` + `students.user_id`.
- Check-in: janela 6h → início; cancelável até fechar.
- CheckIn ≠ Attendance; origens `checkin_student` | `manual_instructor`.
- D6 lotação adiada; Q1 financeiro não bloqueia v1.
- PIX: layout placeholder "Em breve" em Fase 1; flag `student-portal.payments.pix` default `false`.
- Turmas: N:N `student_class_enrollments`.
- Nomes de schema em inglês: `classes`, `class_sessions`, `check_ins`, `attendances`, `products`, `reservations`.

---

## Artefatos produzidos

| Artefato | Estado |
|---|---|
| `plan.md` | Decisões fechadas |
| `spec-delta.md` | Contrato **SPT-** completo + validação ENT-4 |
| `scenarios.feature` | 19 cenários Gherkin |
| `ROADMAP_PORTAL_ALUNO.md` | Alinhado com Fase 0 concluída |
| `validation.md` | Evidência documental |
| `spec/features/student-portal/readme.md` | **Não criado** — aguarda `/update-spec` |

---

## Próximo cycle sugerido

`student-portal-auth` (Large, Fase 1) — após checkpoint humano e `/update-spec`.
