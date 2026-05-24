# tasks.md — Medium Cycle

## Cycle: student-portal-foundation

---

## Tasks

| # | Descrição | Arquivo(s) | Status | Evidência |
|---|---|---|---|---|
| 1 | Revisar e aprovar decisões D1–D7 e Q1–Q4 documentadas em `plan.md` | `plan.md` | `done` | Secção "Decisões D1–D7 (fechadas neste cycle)" |
| 2 | Redigir contrato proposto **SPT-** completo (visão, domínios, regras, RLS, glossário) | `spec-delta.md` | `done` | Contrato SPT-0 a SPT-12 |
| 3 | Validar modelo de dados: entidades, FKs, separação CheckIn/Presença, nomes `class_*` vs `lesson_plans` | `spec-delta.md` (SPT-10.3–10.5) | `done` | Validação ENT-4, SEC-3, PED- |
| 4 | Escrever cenários Gherkin: check-in, presença, reserva, PIX placeholder, acesso negado | `scenarios.feature` | `done` | 19 cenários |
| 5 | Documentar mapa phases 1–4 → cycles Large com slugs e critérios de aceite | `plan.md` | `done` | Tabela "Mapa phases → cycles futuros" |
| 6 | Documentar feature flags (`student-portal.*`) e comportamento do placeholder PIX | `plan.md`, `spec-delta.md` | `done` | SPT-9, SPT-11 |
| 7 | Atualizar `ROADMAP_PORTAL_ALUNO.md`: status das decisões, PIX "Em breve", flags, alinhamento com **SPT-** | `ROADMAP_PORTAL_ALUNO.md` | `done` | Fase 0 ✅, sec. 4–6, glossário |
| 8 | Revisão humana: escopo aprovado antes de abrir cycle Fase 1 (`student-portal-auth`) | `validation.md` | `done` | Aprovação humana 2026-05-24; prefixo `/portal` confirmado |
| 9 | Após validação: promover spec via `/update-spec` | `spec/features/student-portal/readme.md` | `done` | Promovido 2026-05-24; AUTH-8, SHELL /portal, SEC-3.7 |

---

## Legenda

- `pending` — não iniciado
- `in_progress` — em andamento
- `done` — concluído com evidência
- `blocked` — bloqueado (registrar motivo)

---

> ⚠️ Não marque como `done` sem evidência. Registre evidência na coluna ou em `validation.md`.
