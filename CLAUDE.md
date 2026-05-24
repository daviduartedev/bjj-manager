# CLAUDE.md — Regras Globais do Agente

Este projeto usa **Spec-Driven AI Development Harness**.

---

## Princípios fundamentais

- Toda mudança não trivial nasce em um **cycle** dentro de `cycles/`.
- `spec/` e `cycles/` são a **fonte de verdade** — leia-os antes de ler grandes trechos de código.
- Não implemente a partir de prompts soltos quando a mudança for não trivial.
- Não invente requisitos que não estejam no `request.md` ou nas specs.
- Não altere escopo silenciosamente.

---

## Ordem de leitura

1. Leia os arquivos do cycle ativo (`request.md`, `plan.md`, `tasks.md`).
2. Leia as specs relevantes em `spec/`.
3. Só depois leia partes do código estritamente necessárias.
4. **Não leia o repositório inteiro sem necessidade.**

---

## Reancoragem após reset de contexto

Se o contexto do chat for resetado:
1. Pergunte qual é o cycle ativo.
2. Leia `cycles/{path}/request.md`, `plan.md`, `tasks.md`, `implementation-notes.md` (se existir).
3. Leia as specs relevantes listadas no plan.
4. Só então retome o trabalho.
5. **Não dependa de memória do chat anterior.**

---

## Proibições gerais

- Não implementar features fora do escopo do cycle ativo.
- Não alterar lógica de produto sem um cycle aberto e aprovado.
- Não refatorar código sem pedido explícito no cycle.
- Não instalar dependências sem pedido explícito.
- Não rodar migrações sem pedido explícito.
- Não alterar UI/UX fora do escopo.
- Não fazer commits sem instrução explícita ("e faça os commits").
- Não fazer push.
- Não commitar secrets, tokens, API keys, DATABASE_URL, dados sensíveis, logs, dumps, node_modules ou build outputs.
- Não misturar feature, refactor, formatação e cleanup no mesmo trabalho.
- Não fazer refactor amplo sem pedido explícito.

---

## Sobre specs

- `spec/` representa comportamento **implementado e validado**.
- Não atualize `spec/` como verdade final antes da validação.
- Use `spec-delta.md` para **propor** atualizações de spec durante o ciclo.
- Só promova `spec-delta.md` para `spec/` após validação confirmada (comando `/update-spec`).

---

## Sobre tasks

- Não marque uma task como concluída sem evidência real.
- Registre evidência em `validation.md` ou `implementation-notes.md`.
- Atualize `tasks.md` conforme o trabalho avança.

---

## Sobre ciclos Large

- Execute **uma stage por vez**.
- Não avance para a próxima stage sem aprovação humana explícita.
- Use `/map-stage` antes de executar qualquer stage.
- Use `/close-stage` ao finalizar cada stage.
- Gere `stage-summaries/stage-{N}.md` ao fechar cada stage.

---

## Comandos disponíveis

| Comando | Propósito |
|---|---|
| `/create-cycle` | Cria pasta do cycle + `request.md` |
| `/refine-request` | Gera `plan.md`, `tasks.md`, `scenarios.feature`, `spec-delta.md` |
| `/execute-cycle` | Executa cycle Small/Medium |
| `/map-stage` | Gera Execution Map para stage de Large cycle |
| `/execute-stage` | Executa uma stage de Large cycle |
| `/review-implementation` | Revisão crítica da implementação |
| `/validate-cycle` | Roda validações e atualiza `validation.md` |
| `/close-stage` | Fecha stage de Large cycle |
| `/update-spec` | Promove `spec-delta.md` para `spec/` |
| `/close-cycle` | Fecha o cycle com summary final |
| `/security-review` | Revisão de segurança (review-first) |
| `/e2e-review` | Revisão de E2E (review-first) |

---

## Fluxos resumidos

**Small:** `request.md` → `tasks.md` → implementação → `validation.md` → `/close-cycle`

**Medium:** `request.md` → `/refine-request` → `plan/tasks/scenarios/spec-delta` → `/execute-cycle` → `/review-implementation` → `/validate-cycle` → `/update-spec` → `/close-cycle`

**Large:** `request.md` → `/refine-request` → `/map-stage` → `/execute-stage` → `/review-implementation` → `/validate-cycle` → `/close-stage` → próxima stage → `/update-spec` → `/close-cycle`

---

_Harness version: 1.0.0_
