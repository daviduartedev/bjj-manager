# plan.md — Large Cycle

## Cycle: 0609-graduation-edit-kids-protect-isento
## Gerado em: 2026-06-09

---

## Resumo do plano

Três entregas sequenciais: (1) **parar regressão Kids 2** neutralizando a migração destrutiva e adicionando guardrail pós-`db:apply` + CI; (2) **flag Isento** no aluno com recorte de cobrança e UI financeira simplificada; (3) **graduação editável** com peso em kg, sincronização de estado actual e ilustração visual de faixa/graus (adulto + kids).

---

## Decisões do refino (consolidado)

| # | Tema | Decisão |
|---|------|---------|
| R1 | Isento em `/mensalidades` | **Fora da carteira** — mesmo recorte que inactive/paused (**BR-9** estendido) |
| R2 | Isento na ficha/perfil | **Secção financeira simplificada** — mostra apenas rótulo **Isento**; sem plano, vencimento, atraso nem CTA de pagamento |
| R3 | Histórico de graduação | **Adicionar + editar** eventos; **sem apagar** linhas |
| R4 | Peso (kg) | **Uma casa decimal**, faixa **20,0–250,0 kg**, opcional |
| R5 | Ilustração da faixa | **Adulto + kids** (incluindo faixas bicolores) no perfil e histórico completo |
| R6 | Guardrail Kids | Script de verificação no **CI** e **após `pnpm db:apply`** (falha se mass-update de planos) |
| — | Peso (confirmado antes) | Peso corporal do atleta em kg |
| — | Isento (confirmado antes) | Professor marca/desmarca Isento — fluxo simples |
| — | Kids 2 (confirmado antes) | Nunca SQL que reatribua planos; sem restauração automática |

---

## Delta em relação ao estado canónico actual

| Área | Antes | Depois |
|------|-------|--------|
| **GRD-6** | Histórico imutável; só `promoteStudent` | Adicionar/editar eventos; sem DELETE; sync de faixa/grau actual |
| **ENT-5** | Sem peso | `weight_kg` opcional por evento |
| **ENT-4** | Sem isenção persistente | `is_exempt` boolean; fora de `/mensalidades` |
| **BR-9 / PBS-3** | Só filtra status/archive | Exclui isentos; sem `overdue` derivado |
| **SPR-8** | Plano + mês + atraso | Isento: secção financeira mínima |
| **Migrations** | `001` move `kids_2`→`kids_1` | `001` neutralizada; política documentada; guardrail |

---

## Stages

### Stage 1 — Proteção Kids 1 / Kids 2
- **Objetivo:** Impedir que `pnpm db:apply` (ou migrations) altere vínculos abertos entre `kids_1` e `kids_2`.
- **Tasks:** ver `tasks.md` — Stage 1
- **Arquivos principais:** `db/migrations/001_juvenil_plans_to_kids.sql`, `scripts/apply-db.cjs`, `scripts/validate-plan-assignments.cjs` (novo), `docs/database/migrations-policy.md` (novo), `.github/workflows/e2e-security.yml`, `package.json`
- **Critério de saída:** `pnpm db:apply` conclui + guardrail passa; contagem `kids_2` abertos inalterada; migration `001` sem mass-update de `student_plans`

### Stage 2 — Aluno Isento
- **Objetivo:** Flag persistente `is_exempt`; isentos fora de `/mensalidades`; perfil/ficha sem “Atrasado”; secção financeira simplificada.
- **Tasks:** ver `tasks.md` — Stage 2
- **Arquivos principais:** `db/migrations/013_students_is_exempt.sql`, `db/schema.sql`, `db/policies.sql`, `actions/students.ts`, `lib/billing/month-billing-indicator.ts`, `lib/validations/students.ts`, componentes de ficha/perfil/mensalidades
- **Critério de saída:** Isento configurável na UI; não aparece em `/mensalidades`; perfil mostra “Isento” sem chip Atrasado após vencimento; testes PBS + smoke manual

### Stage 3 — Graduação editável + peso + visual
- **Objetivo:** CRUD parcial de graduações, peso kg, ilustração de faixa, sync de estado actual.
- **Tasks:** ver `tasks.md` — Stage 3
- **Arquivos principais:** `db/migrations/014_student_graduations_weight_kg.sql`, `actions/graduations.ts`, `lib/graduation/*`, `components/graduation/belt-illustration.tsx`, páginas perfil + `/alunos/[id]/graduacoes`
- **Critério de saída:** Professor adiciona/edita graduação com data e peso; tempo na faixa/grau actualiza; visual adulto+kids; validações GRD-3 mantidas; sem DELETE

---

## Arquivos afetados (visão geral)

| Arquivo | Stage(s) | Tipo de mudança |
|---|---|---|
| `db/migrations/001_juvenil_plans_to_kids.sql` | 1 | edit (neutralizar) |
| `scripts/validate-plan-assignments.cjs` | 1 | create |
| `scripts/apply-db.cjs` | 1 | edit (chamar guardrail) |
| `db/migrations/013_students_is_exempt.sql` | 2 | create |
| `db/migrations/014_student_graduations_weight_kg.sql` | 3 | create |
| `db/schema.sql`, `db/policies.sql` | 2, 3 | edit |
| `actions/students.ts`, `actions/graduations.ts` | 2, 3 | edit |
| `lib/billing/month-billing-indicator.ts` | 2 | edit |
| `components/graduation/belt-illustration.tsx` | 3 | create |
| `app/(dashboard)/alunos/[id]/graduacoes/*` | 3 | edit |
| `spec-delta.md` → `spec/` via `/update-spec` | final | promote |

---

## Specs afetadas (proposta em `spec-delta.md`)

- `spec/product/entities.md` — **ENT-4**, **ENT-5**
- `spec/product/billing-rules.md` — **BR-9**
- `spec/features/graduation-engine/readme.md` — **GRD-6**, **GRD-7**, **GRD-8**
- `spec/features/student-profile/readme.md` — **SPR-8**
- `spec/features/students-crud/readme.md` — **STU-3**, **STU-8**
- `spec/features/payments-billing-status/readme.md` — **PBS-3**
- `spec/features/billing-ui/readme.md` — **BUI-2**
- `spec/database.md` — política de migrations

---

## Riscos globais

| Risco | Probabilidade | Stage | Mitigação |
|---|---|---|---|
| Neutralizar `001` quebra ambientes que ainda dependiam dela | Média | 1 | Manter UPDATEs seguros em `plans`; remover só o bloco `student_plans` |
| `is_exempt` + vínculo aberto legado | Média | 2 | UI esconde financeiro; mensalidades filtra por flag |
| Edição de histórico desincroniza faixa actual | Alta | 3 | Server Action transaccional recalcula `current_*` a partir do evento mais recente |
| Faixas kids bicolores na ilustração | Média | 3 | Mapear `belts.name`/ordinal para padrão bicolor documentado |

---

## Fora de escopo (confirmado)

- Apagar eventos de graduação
- Restauração SQL automática dos ~22 Kids 2
- Alteração retroativa de `payments`/recibos
- Plano comercial “Juvenil”
- Portal/shop, produtos, job BR-4.5

---

## Dependências entre stages

- **Stage 2** depende de **Stage 1** concluída (pipeline DB estável antes de novas migrations).
- **Stage 3** depende de **Stage 2** concluída (evitar conflito de migrations/schema no mesmo deploy).

---

## Perguntas abertas

- [x] Todas respondidas no refino (ver tabela acima).
