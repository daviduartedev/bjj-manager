# spec/development-workflow.md — Fluxo Oficial de Desenvolvimento

## Princípio base

> Toda mudança não trivial nasce em um cycle. O agente não implementa a partir de prompts soltos.

---

## Fluxo Small

```
/create-cycle (small)
  └─ request.md
       └─ tasks.md (pode ser gerado junto ou pelo agente)
            └─ implementação
                 └─ /validate-cycle → validation.md
                      └─ /close-cycle
```

**Quando usar:** correções simples, mudanças de texto, ajustes pontuais de baixo risco.

**Não requer:** refinamento formal, plan.md, scenarios.feature.

---

## Fluxo Medium

```
/create-cycle (medium)
  └─ request.md
       └─ /refine-request
            ├─ plan.md
            ├─ tasks.md
            ├─ scenarios.feature
            └─ spec-delta.md (quando specs forem afetadas)
                 └─ /execute-cycle
                      └─ checkpoint humano
                           └─ /review-implementation → review.md
                                └─ /validate-cycle → validation.md
                                     └─ /update-spec (quando aplicável)
                                          └─ /close-cycle
```

**Quando usar:** novas telas, endpoints, integrações de complexidade moderada.

---

## Fluxo Large

```
/create-cycle (large)
  └─ request.md
       └─ /refine-request
            ├─ plan.md
            ├─ tasks.md (todas as stages)
            ├─ scenarios.feature
            ├─ spec-delta.md
            └─ implementation-notes.md (skeleton)
                 └─ Stage 1:
                 │    └─ /map-stage → Execution Map
                 │         └─ aprovação humana
                 │              └─ /execute-stage
                 │                   └─ /review-implementation
                 │                        └─ /validate-cycle (parcial)
                 │                             └─ /close-stage → stage-summaries/stage-1.md
                 │                                  └─ checkpoint humano
                 └─ Stage N: (repete o bloco acima)
                      └─ /update-spec
                           └─ /close-cycle
```

**Quando usar:** novos módulos, refactors arquiteturais, mudanças de alto impacto.

**Regra crítica:** o agente executa **uma stage por vez** e **não avança** sem aprovação explícita.

---

## Reancoragem após reset de contexto

Quando o contexto do chat é resetado (nova sessão, novo chat):

1. Pergunte ao humano: "Qual é o cycle ativo?"
2. Leia `cycles/{path}/request.md`
3. Leia `cycles/{path}/plan.md` (se existir)
4. Leia `cycles/{path}/tasks.md`
5. Leia `cycles/{path}/implementation-notes.md` (se existir)
6. Leia as specs relevantes listadas no plan
7. Só então retome o trabalho

> **Não dependa de memória do chat anterior. Não assuma contexto implícito.**

---

## Regras de escopo

- O agente executa **somente** o que está em `tasks.md` do cycle ativo.
- Se identificar algo útil fora do escopo, **registra em `review.md`** e **pergunta** antes de executar.
- Não transforma Medium em Large silenciosamente.
- Não divide Large em ciclos menores sem autorização.

---

## Gates obrigatórios

| Gate | Condição para avançar |
|---|---|
| Pós-refine | Humano aprova plan/tasks/scenarios antes de execute |
| Pós-execute (Medium) | Humano revisa antes de validate |
| Pós-stage (Large) | Humano aprova close-stage antes da próxima stage |
| Pós-validate | Humano confirma evidências antes de update-spec |
| Pós-update-spec | Humano confirma antes de close-cycle |

---

## O que nunca fazer

- Executar tudo de uma vez em ciclo Large.
- Avançar stage sem checkpoint.
- Atualizar `spec/` antes de validação.
- Fechar ciclo com falha crítica não explicada.
- Commitar sem instrução explícita.
- Fazer push.

---

_Harness version: 1.0.0_
