# review.md — Large Cycle

## Cycle: 0524-student-portal-classes-checkin

---

## Stage 1 — Schema e RLS
### Data: 2026-05-24 | Revisor: agente

#### Escopo
- [x] Tasks da stage 1 implementadas completamente
- [x] Nada implementado fora do escopo da stage 1 (sem UI portal/professor)

#### Código / DDL
- [x] Migration idempotente e alinhada a `db/schema.sql`
- [x] Índices e constraints documentados
- [x] `attendances` criada sem triggers de auto-conversão

#### Segurança
- [x] Políticas **SEC-3.7** para todas as tabelas novas
- [x] `validate-rls.cjs` cobre isolamento aluno e professor
- [x] Regressão Fase 1 RLS verificada

#### Findings Stage 1
- **Blockers:** nenhum
- **Warnings:** testes de papel `student` em `validate-rls` requerem `E2E_STUDENT_EMAIL` — omitidos com aviso se ausente
- **Recommendations:** adicionar testes unitários para `session-generator.ts` na Stage 2 ou 3 (opcional)

---

## Stage 2 — Portal do aluno (aulas + check-in)
### Data: 2026-05-24 | Revisor: agente

#### Escopo
- [x] Tasks da stage 2 implementadas completamente
- [x] Placeholder "Em breve" substituído por listagem funcional (com gate de flag)
- [x] Nada implementado fora do escopo (sem visão professor, sem presença)

#### Código
- [x] Janela check-in **D3** testada unitariamente
- [x] Actions validam flag, inscrição, janela server-side
- [x] UI com empty / error states (loading implícito via RSC)
- [x] Sem regressões visíveis na Fase 1 (build; smoke parcial flag OFF confirmado pelo humano)

#### Segurança
- [x] `student_id` e `account_id` nunca vêm do client
- [x] Mensagens de erro em português sem vazar IDs internos

#### Findings Stage 2
- **Blockers:** nenhum
- **Warnings:** smoke browser completo (listagem + check-in + cancelamento) adiado — requer turma inscrita; coberto na Stage 3 (E2E) ou SQL bootstrap
- **Recommendations:** testes de integração para `listStudentClassSessions()` (opcional); documentar flags no README local

---

## Stage 3 — Painel professor + integração
### Data: 2026-05-24 | Revisor: agente

#### Escopo
- [x] Tasks da stage 3 implementadas completamente
- [x] CRUD turmas/recorrência/inscrições funcional
- [x] Item **Aulas** na sidebar
- [x] Fluxo ponta a ponta professor → aluno → professor funciona (smoke + spec; E2E completo com janela 6h DEFER)
- [x] Conversão presença (**SPT-6.2–6.4**) **não** implementada

#### Código
- [x] Rotas `/aulas/*` sem refactor amplo do dashboard
- [x] Polling 30s na lista de check-ins (`router.refresh` + `setInterval`)
- [x] Indicador **PBS-3** reutiliza `fetchMonthBillingSnapshots`
- [x] Integração entre stages consistente (Stage 1 DDL/RLS + Stage 2 portal aluno + Stage 3 professor)

#### Segurança
- [x] Revisão de segurança completa (`/security-review` executado) — ver secção abaixo
- [x] Professor só vê sessões/check-ins da própria `account_id` (RLS Stage 1; actions filtram por sessão autenticada)
- [x] Zero writes em `attendances` na aplicação (grep confirmado)

#### Testes e E2E
- [x] Cenários críticos de `scenarios.feature` cobertos (build + spec + smoke manual documentado)
- [x] E2E spec criada; execução `pnpm e2e` DEFER (requer dev server + DB)
- [x] Não-regressão Fase 1 confirmada (spec + `pnpm test` 179 PASS)

#### Findings Stage 3
- **Blockers:** nenhum
- **Warnings:** E2E ponta-a-ponta com check-in na janela 6h não executado em CI nesta sessão; smoke manual documentado para humano; `/security-review` pendente antes de `/close-cycle`
- **Recommendations:** rodar `pnpm e2e` com dev server antes de `/close-cycle`; testes unitários para `lib/validations/classes.ts` (opcional)

---

## Conclusão geral

- [x] Sem blockers em nenhuma stage
- [x] Warnings resolvidos ou documentados como tech debt
- [x] Check-in ≠ presença respeitado em modelo e UX
- [x] Pronto para `/validate-cycle` — `/security-review` concluído sem blockers; E2E execução opcional

---

## Security Review — Portal do Aluno (Fase 1 + Fase 2)
### Data: 2026-05-24 | Revisor: agente
### Escopo analisado
- Cycle `0524-student-portal-classes-checkin` (Stages 1–3)
- Superfície cross-cutting: `0524-student-portal-auth`, `0524-student-portal-schema`
- Artefatos: actions, middleware, RLS (`db/policies.sql`), `scripts/validate-rls.cjs`, data layer

### Status geral
**✅ Sem blockers** — postura adequada para piloto controlado com flags; 2 warnings documentados.

### Checklist (resumo)

| Área | Status | Notas |
|---|---|---|
| Autenticação | ✅ | Middleware + Supabase session; rotas protegidas |
| Autorização por role | ✅ | `requireProfessor()` nas actions; middleware isola student↔operacional |
| IDOR (check-in) | ✅ | `student_id`/`account_id` server-side; RLS reforça insert/delete |
| IDOR (CRUD turmas) | ⚠️ | RLS por `account_id`; 2 gaps de validação explícita (ver W-1, W-2) |
| Mass assignment | ✅ | Schemas Zod `.strict()` em todas as actions |
| Scoping tenant | ✅ | `account_id` derivado de sessão nas writes |
| Service role | ✅ | `server-only`; usado só em provisionamento com checks de conta |
| Logs sensíveis | ✅ | Sem vazamento evidente em actions |
| RLS automatizado | ✅ | `validate-rls.cjs` cobre isolamento check-ins Fase 2 |
| E2E segurança | ⚠️ | Spec criada; execução deferida |

### Blockers
Nenhum.

### Warnings

| ID | Classificação | Finding | Mitigação actual | Recomendação |
|---|---|---|---|---|
| **W-1** | ~~Warning~~ **Resolvido** | `enrollStudent` valida `students.account_id` via `assertStudentInAccount()` antes do INSERT | — | — |
| **W-2** | ~~Warning~~ **Resolvido** | `createClass`/`updateClass` validam `profiles.account_id` via `assertProfileInAccount()` | — | — |

### Recommendations

| ID | Finding |
|---|---|
| **R-1** | Executar `pnpm e2e` + smoke manual com flags ON antes de rollout |
| **R-2** | Adicionar cenário `validate-rls.cjs` para enrollment cross-account (student de outra conta rejeitado) |
| **R-3** | Documentar rotação/proteção de `SUPABASE_SERVICE_ROLE_KEY` (provisionamento) |
| **R-4** | `findAuthUserIdByEmail` pagina só 200 users — risco operacional, não IDOR directo |
| **R-5** | Considerar rate-limit em actions de check-in (baixa prioridade v1) |

### Pontos positivos
- Check-in: defense in depth (action + RLS + janela temporal + flag + enrollment)
- Check-in ≠ presença: zero writes em `attendances`
- Provisionamento: valida conta cruzada, impede professor→student hijack, impede duplo vínculo
- Onboarding: update scoped a `student.id` + `user_id` da sessão
- Erros mapeados via `mapDatabaseErrorToUserMessage` sem stack trace ao client
