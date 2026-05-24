# request.md — Large Cycle

## Cycle
- **Path:** `cycles/Q22026/0524-student-portal-classes-checkin/`
- **Tipo:** Large
- **Data:** 2026-05-24
- **Autor:** {nome}

---

## Contexto

A **Fase 1** do Portal do Aluno (`0524-student-portal-auth`) entregou auth, onboarding, shell e rotas stub — incluindo `/portal/aulas` com placeholder "Em breve".

Este cycle implementa a **Fase 2**: o core operacional de **aulas agendadas** e **check-in** do aluno, com visibilidade para o professor e fundação para conversão futura em presença oficial.

Decisões de produto e modelagem já fechadas na fundação (`0524-student-portal-foundation`) e no schema Fase 1 (`0524-student-portal-schema`) devem ser respeitadas — em especial a separação **CheckIn ≠ Presença** e o domínio distinto de `lesson_plans` (pedagógico) vs `class_*` (portal).

Documentos de referência:
- `ROADMAP_PORTAL_ALUNO.md`
- `spec/features/student-portal/readme.md` (proposto via spec-delta da fundação; promover após validação)
- Cycles anteriores: `0524-student-portal-foundation`, `0524-student-portal-schema`, `0524-student-portal-auth`

---

## O que precisa ser feito

Implementar Fase 2 do Portal do Aluno — **aulas e check-in**:

1. **Modelar turmas/aulas** — schema, migrations e policies para turmas, recorrência, instâncias de aula (`class_*`), inscrições aluno↔turma e check-ins; alinhado ao modelo preliminar da fundação.
2. **Listagem funcional de aulas** — substituir placeholder em `/portal/aulas` por listagem real das aulas disponíveis ao aluno (turmas em que está inscrito).
3. **Check-in do aluno** — permitir confirmar presença intencional dentro da janela de check-in definida (decisão D3 da fundação).
4. **Cancelamento de check-in** — permitir desfazer check-in dentro da mesma janela (decisão D5 da fundação).
5. **Visão do professor** — professor visualiza check-ins da aula (lista de quem confirmou antes do início).
6. **Preparar conversão check-in → presença** — modelar/persistir de forma que a conversão futura seja possível, **sem** promover check-in a presença oficial automaticamente.
7. **RLS e isolamento** — garantir isolamento por aluno e por academia (`account_id`), seguindo padrões SEC- do projeto; validar com `validate-rls.cjs`.

O detalhamento em stages vem no `plan.md` após `/refine-request`.

---

## Motivação / valor

Entrega o fluxo central do portal: aluno vê suas aulas e sinaliza intenção de presença; professor tem visibilidade pré-aula. Desbloqueia operação real da academia no portal sem antecipar loja ou pagamentos.

---

## Critérios de aceite (alto nível)

- [ ] Turmas, aulas (instâncias) e check-ins modelados no banco com migrations e RLS aplicadas
- [ ] Aluno inscrito em turma(s) vê listagem funcional de aulas em `/portal/aulas`
- [ ] Aluno consegue fazer check-in dentro da janela de check-in configurada
- [ ] Aluno consegue cancelar check-in dentro da janela (até fechamento da janela)
- [ ] Fora da janela, check-in e cancelamento são rejeitados com feedback claro
- [ ] Professor consegue visualizar check-ins de uma aula específica
- [ ] Check-in **não** vira presença oficial automaticamente — conversão fica preparada, não implementada sem regra explícita
- [ ] RLS garante que aluno só acessa dados da própria conta/academia; professor/academia isolados por `account_id`
- [ ] Feature flag `student-portal.classes.checkin` controla disponibilidade do fluxo
- [ ] Fase 1 (auth, onboarding, shell, rotas existentes) permanece funcional — sem regressão

---

## Stages previstas (estimativa inicial)

> Refinamento real ocorre em `/refine-request`. Lista estimativa com base na fundação.

1. **Stage 1 — Schema e RLS** — migrations para `class_*`, `student_class_enrollments`, `check_ins` (e estruturas de presença preparatórias se aplicável); policies; validação RLS.
2. **Stage 2 — Portal do aluno (aulas + check-in)** — listagem em `/portal/aulas`, actions de check-in/cancelamento, janela temporal, UI e testes unitários relevantes.
3. **Stage 3 — Visão professor + integração** — tela/lista de check-ins por aula no painel professor; feature flag; E2E dos fluxos principais; revisão de não-regressão Fase 1.

---

## Restrições e riscos conhecidos

**Restrições (obrigatórias neste cycle):**

- Não implementar loja
- Não implementar pagamento (incl. PIX funcional)
- Não implementar reconhecimento facial, QR code ou GPS para check-in
- Não transformar check-in em presença oficial automaticamente sem regra explícita
- Não quebrar portal auth/onboarding entregue na Fase 1

**Restrições técnicas (padrão do projeto):**

- Reutilizar stack: Supabase, RLS, server actions, Zod, App Router
- Isolamento multi-tenant via `account_id`
- `lesson_plans` (PED-) ≠ aulas agendadas do portal (SPT- / `class_*`) — domínios distintos
- Decisões D3 (janela check-in) e D5 (cancelamento) da fundação devem ser implementadas conforme spec

**Riscos:**

- Confundir check-in (intenção) com presença (registro oficial) — mitigar com modelo e UX separados
- RLS insuficiente para papel aluno — validar com `validate-rls.cjs` e cenários de isolamento
- Regressão na Fase 1 (auth/onboarding/shell) — testes de não-regressão ao final
- Scope creep para loja/pagamento — manter fora de escopo explícito

---

## Fora de escopo

- Loja e reserva de produtos (Fase 3)
- Pagamento online, PIX funcional ou gateway (Fase futura)
- Reconhecimento facial, QR code, GPS ou biometria para presença
- Conversão automática check-in → presença oficial (apenas preparar modelo; conversão explícita fica para cycle futuro se necessário)
- Notificações push/e-mail
- Bloqueio de check-in por inadimplência (Q1 adiada na v1 — fundação prevê apenas alerta ao professor)
- Limite de vagas / lotação (D6 adiada — campo nullable permitido, bloqueio fora da v1)
- Refatoração ampla do painel professor além do necessário para visualizar check-ins

---

## Specs relevantes

- `spec/features/student-portal/readme.md`
- `spec/features/authentication/readme.md`
- `spec/features/rls-security/readme.md`
- `spec/features/students-crud/readme.md`
- `spec/features/student-profile/readme.md`
- `spec/features/app-shell/readme.md`
- `spec/features/lesson-plans/readme.md` (domínio distinto — não confundir)
- `spec/database.md`
- `spec/backend.md`
- `spec/frontend.md`
- `spec/security.md`
- `spec/testing.md`

---

## Referências

- `ROADMAP_PORTAL_ALUNO.md` — roadmap estratégico, D1–D7, fases 1–4
- `cycles/Q22026/0524-student-portal-foundation/` — decisões D3, D5, modelo preliminar, mapa de phases
- `cycles/Q22026/0524-student-portal-schema/` — schema Fase 1; tabelas Fase 2 listadas como escopo futuro
- `cycles/Q22026/0524-student-portal-auth/` — auth, shell e placeholder `/portal/aulas` (Fase 1 concluída)
