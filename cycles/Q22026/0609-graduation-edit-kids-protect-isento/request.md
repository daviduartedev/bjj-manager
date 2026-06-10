# request.md — Large Cycle

## Cycle
- **Path:** `cycles/Q22026/0609-graduation-edit-kids-protect-isento/`
- **Tipo:** Large
- **Data:** 2026-06-09
- **Autor:** {nome}

---

## Contexto

O professor precisa **corrigir e enriquecer** o histórico de graduação de cada aluno (faixa, grau, data, tempo na faixa/grau, peso corporal) com **visualização clara** da faixa e dos graus.

Migrações SQL recentes (ex.: `db/migrations/001_juvenil_plans_to_kids.sql`) têm **movido alunos de Kids 2 para Kids 1** sempre que o pipeline de DB roda. A operação mantém cerca de **22 alunos em Kids 2**; essa segmentação **não pode ser alterada por SQL** — correções futuras são manuais na UI, se necessário.

Alunos **isentos** de mensalidade aparecem como **“Atrasado”** na ficha após o vencimento. O professor deve poder marcar o aluno como **Isento** de forma simples, sem falsa sensação de inadimplência.

---

## O que precisa ser feito

Cycle Large em **3 stages sequenciais**:

1. **Stage 1 — Proteção Kids 1 / Kids 2** — neutralizar migração destrutiva; documentar política de migrations; guardrail de verificação para impedir mass-update de `student_plans` entre `kids_1` e `kids_2`; garantir UI/filtros com Kids 1 e Kids 2 distintos.

2. **Stage 2 — Aluno Isento** — flag persistente configurável pelo professor; ajustar regras de indicador de cobrança e UI (ficha, perfil, mensalidades) para **não** mostrar “Atrasado” quando isento; rótulo **“Isento”** em pt-BR (distinto de **Bolsista**, que continua sendo status por mês).

3. **Stage 3 — Graduação editável + peso + visual da faixa** — CRUD controlado de `student_graduations` (hoje imutável em GRD-6.1); peso opcional em **kg** por evento; sincronização de faixa/grau actuais; ilustração compacta da faixa com graus no perfil e histórico completo.

O detalhamento por stage vem no `plan.md` após `/refine-request`.

---

## Motivação / valor

Dar controlo pedagógico e operacional ao professor (graduação rica, isenção clara), **parar regressões de dados** que “zeram” Kids 2, e eliminar confusão financeira para alunos isentos.

---

## Decisões confirmadas

- **Peso:** peso corporal do atleta em **kg** (opcional por evento de graduação).
- **Isento:** o professor configura o aluno como **Isento** — fluxo simples, sem complexidade adicional.
- **Kids 2:** **nunca** SQL/migration que reatribua planos de alunos existentes entre Kids 1 e Kids 2; **sem** script automático de restauração — ajuste manual na UI se precisar.

---

## Critérios de aceite (alto nível)

- [ ] **Stage 1:** após rodar pipeline de DB, contagem de vínculos abertos em `kids_2` permanece estável (humano valida ~22); nenhuma migration futura inclui mass-update `kids_2` → `kids_1`
- [ ] **Stage 1:** guardrail ou verificação documentada falha/alerta se detectar reatribuição em massa de planos
- [ ] **Stage 2:** aluno marcado Isento **não** exibe chip/indicador “Atrasado” na ficha/perfil após vencimento
- [ ] **Stage 2:** indicador derivado de cobrança (PBS-3) não classifica isento como `overdue`
- [ ] **Stage 2:** professor consegue marcar/desmarcar Isento na ficha ou edição rápida
- [ ] **Stage 3:** professor regista/edita graduações com data; peso em kg opcional persiste; tempo na faixa/grau actualiza coerentemente
- [ ] **Stage 3:** ilustração visual reflecte faixa actual e grau; `students.current_belt_id` / `current_degree` coerentes com histórico
- [ ] **Stage 3:** validações GR- / GRD-3 mantidas (sem demotion, sem saltos inválidos)
- [ ] RLS e multi-tenant inalterados (**SEC-3.3**)

---

## Stages previstas (estimativa inicial)

> Refinamento real ocorre em `/refine-request`. Executar uma stage por vez (`/map-stage` → `/execute-stage` → `/close-stage`).

1. **Stage 1 — Proteção Kids 1 / Kids 2** — neutralizar `001_juvenil_plans_to_kids.sql`; política de migrations; guardrail; UI/filtros intactos.
2. **Stage 2 — Aluno Isento** — flag + regras PBS/SPR/BUI + UI.
3. **Stage 3 — Graduação editável** — histórico editável, peso (kg), visual da faixa/graus.

---

## Restrições e riscos conhecidos

**Restrições:**

- **Nunca** SQL/migration que altere vínculos Kids 1 ↔ Kids 2 de alunos existentes
- **Não** script automático de restauração dos ~22 Kids 2
- **Não** alterar retroativamente `payments` ou recibos emitidos
- **Não** recriar plano/categoria “Juvenil” (**SPEC-2.5.1**, **BR-1.1**)
- `account_id` nunca aceite do cliente (**SEC-3.3**)
- Uma stage por vez; não avançar sem aprovação humana explícita

**Riscos:**

- Relaxar imutabilidade de `student_graduations` pode desincronizar faixa/grau actual
- Flag Isento vs vínculo `student_plans` aberto pode gerar ambiguidade (definir no refine)
- Neutralizar migration 001 pode afectar ambientes novos — tratar idempotência por ambiente
- Ilustração de faixas kids bicolores é mais complexa que adulto monocromático

---

## Fora de escopo

- Restauração automática via SQL dos alunos Kids 2
- Portal do aluno / loja PIX (cycle `0527-portal-shop-pix-whatsapp`)
- Venda de produtos, checkout, WhatsApp shop
- Automação juvenil faixa laranja → Adulto (cycle `24-0430-refactor-juvenil`)
- Job BR-4.5 Pendente → Não pago
- Upload de foto/avatar
- Demotion automática ou homologação federativa (**GR-5**)
- Refactor amplo fora destas três frentes

---

## Decisões do refino (2026-06-09)

| Tema | Decisão |
|------|---------|
| Isento em `/mensalidades` | **Fora da carteira** (como inactive/paused) |
| Isento na ficha | **Secção financeira simplificada** — só rótulo Isento |
| Graduação | **Adicionar + editar**; sem apagar |
| Peso (kg) | **Uma casa decimal**, faixa **20,0–250,0** |
| Visual faixa | **Adulto + kids** (bicolores) |
| Guardrail Kids | **CI + após `pnpm db:apply`** |

Ver `plan.md`, `spec-delta.md`, `tasks.md`, `scenarios.feature`.

---

## Specs relevantes

- `spec/product/graduation-rules.md` (**GR-**)
- `spec/features/graduation-engine/readme.md` (**GRD-**, **GRD-6** imutabilidade)
- `spec/features/student-profile/readme.md` (**SPR-7**, **SPR-8.3**)
- `spec/features/students-crud/readme.md` (**STU-4**, **STU-7**, **STU-8**)
- `spec/features/payments-billing-status/readme.md` (**PBS-3**)
- `spec/product/billing-rules.md` (**BR-1.1**, **BR-4**, **BR-9**)
- `spec/features/plans-billing-model/readme.md` (**BLM-5**)
- `spec/product/entities.md` (**ENT-4**, **ENT-5**, **ENT-6**, **ENT-7**)
- `spec/database.md`
- `spec/security.md`

---

## Referências

- `db/migrations/001_juvenil_plans_to_kids.sql` (migração que move `kids_2` → `kids_1`)
- `cycles/Q22026/24-0430-refactor-juvenil/` (contexto juvenil / planos Kids 1, Kids 2, Adulto)
- Verificação sugerida (humano):
  ```sql
  SELECT COUNT(*) AS kids_2_abertos
  FROM student_plans sp
  JOIN plans p ON p.id = sp.plan_id
  WHERE sp.ended_at IS NULL AND p.kind = 'kids_2';
  ```
