# validation.md — Large Cycle

## Cycle: 0609-graduation-edit-kids-protect-isento

---

## Stage 1 — Proteção Kids 1 / Kids 2
### Data: 2026-06-09

| Comando | Resultado | Observações |
|---|---|---|
| `pnpm db:validate-plans --static-only` | PASS | 12 migrations analisadas |
| `pnpm db:apply` (1.ª vez) | PASS | kids_2 abertos = 22 |
| `pnpm db:apply` (2.ª vez) | PASS | kids_2 abertos = 22 (estável) |
| `pnpm lint` | N/A | Stage 1 sem alterações TS/TSX |
| `pnpm type-check` | N/A | Stage 1 sem alterações TS |
| `pnpm test` | N/A | Sem testes novos nesta stage |

| Cenário | Evidência | Resultado |
|---|---|---|
| Pipeline DB não altera alunos Kids 2 | `db:apply` ×2, guardrail COUNT | PASS |
| Migração proibida detectada | `001` neutralizada; static scan PASS | PASS |

**Falhas baseline:** nenhuma

**Notas:** Humano confirmou expectativa ~22 Kids 2 — COUNT bateu exactamente após neutralizar `001`.

---

## Stage 2 — Aluno Isento
### Data: 2026-06-09

| Comando | Resultado | Observações |
|---|---|---|
| `pnpm db:apply` | PASS | migration `013_students_is_exempt.sql` |
| `pnpm test` | PASS | 186 tests (incl. wallet + indicator) |
| `pnpm type-check` | PASS | após `exempt` em mensalidades-filtro-url |
| `pnpm lint` | PASS | — |

| Cenário | Evidência | Resultado |
|---|---|---|
| Flag `is_exempt` persistida | migration + schema | PASS |
| PBS-3 isento → `exempt` | unit test | PASS |
| BR-9 fora de mensalidades | query `.eq("is_exempt", false)` | PASS |

**Falhas baseline:** nenhuma

**Smoke manual pendente:** marcar aluno Isento na UI e confirmar perfil sem “Atrasado” (humano).

---

## Stage 3 — Graduação editável + peso + visual
### Data: 2026-06-09

| Comando | Resultado | Observações |
|---|---|---|
| `pnpm db:apply` | PASS | migration `014_student_graduations_weight_kg.sql`; kids_2 = 22 |
| `pnpm test` | PASS | 195 tests (belt-order, graduations zod) |
| `pnpm type-check` | PASS | — |
| `pnpm lint` | PASS | — |

| Cenário | Evidência | Resultado |
|---|---|---|
| Peso kg opcional 20–250 | Zod + CHECK DB | PASS |
| add/update/promote sem DELETE | `actions/graduations.ts` | PASS |
| Sync `current_*` pós-mutação | `syncStudentCurrentFromEvents` | PASS |
| Ilustração faixa adulto + kids | `BeltIllustration` | PASS (automático) |
| Histórico completo `/graduacoes` | page + client | PASS (automático) |

**Falhas baseline:** nenhuma

**Smoke manual pendente:** promover aluno, editar evento retroactivo com peso, confirmar tempos no perfil (humano).

---

## Conclusão geral

- [x] Stages 1–3 concluídas
- [ ] Pronto para `/update-spec` e `/close-cycle` (após fechamento F.1–F.4)
