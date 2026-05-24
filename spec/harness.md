# spec/harness.md — Conceito do Harness

## O que é SDD

**Spec-Driven Development (SDD)** é um método onde toda mudança não trivial começa com uma especificação explícita do que deve ser feito, antes de qualquer implementação.

A especificação serve como:
- Contrato entre humano e agente
- Critério de aceite observável
- Fonte de verdade para revisão e validação
- Base para atualização de specs canônicas

---

## O que é o Harness

**Harness = SDD + comandos + regras + templates + gates + validação + checkpoints**

O Harness é a infraestrutura que torna o SDD operacional dentro deste repositório. Ele define:
- Onde as coisas vivem (`cycles/`, `spec/`, `templates/`)
- Como as coisas evoluem (comandos `/create-cycle` → `/close-cycle`)
- Quando o agente pode avançar (gates e checkpoints humanos)
- O que conta como evidência (validation.md, scenarios.feature)

---

## Artefatos de um cycle

| Artefato | Propósito |
|---|---|
| `request.md` | Intenção humana: o que precisa ser feito e por quê |
| `plan.md` | Plano delta: o que muda, onde, riscos, fora de escopo |
| `tasks.md` | Lista de tarefas executáveis com status |
| `scenarios.feature` | Aceite observável em formato Gherkin (Given/When/Then) |
| `spec-delta.md` | Proposta de mudança nas specs canônicas |
| `validation.md` | Evidências de que o ciclo foi validado |
| `review.md` | Revisão crítica da implementação |
| `implementation-notes.md` | Diário técnico: decisões, riscos, problemas encontrados |
| `stage-summaries/stage-N.md` | Resumo de fechamento de cada stage (Large cycles) |

---

## `spec/` vs `spec-delta.md`

- `spec/` = verdade canônica do que foi **implementado e validado**
- `spec-delta.md` = proposta de mudança **dentro de um cycle**, ainda não promovida
- A promoção de `spec-delta.md` para `spec/` só ocorre via `/update-spec`, após validação

---

## Tipos de cycle

### Small cycle
- Mudança simples, bem entendida, baixo risco
- Não requer refinamento formal
- Artefatos: `request.md`, `tasks.md`, `validation.md`
- Fluxo: request → tasks → implementação → validação → close-cycle

### Medium cycle
- Mudança de complexidade moderada
- Requer refinamento, plano e cenários de aceite
- Pode afetar specs canônicas
- Artefatos: todos exceto `implementation-notes.md` e `stage-summaries/`
- Fluxo: request → refine → execute → review → validate → update-spec → close-cycle

### Large cycle
- Mudança complexa, multi-stage, alto risco ou amplo impacto
- Execução dividida em stages com checkpoint humano entre cada uma
- Todos os artefatos
- Fluxo: request → refine → (map-stage → execute-stage → review → validate → close-stage) × N → update-spec → close-cycle

### Quando usar cada um

| Critério | Small | Medium | Large |
|---|---|---|---|
| Linhas de código estimadas | < 50 | 50–300 | > 300 |
| Número de arquivos afetados | 1–2 | 3–10 | > 10 |
| Risco de regressão | Baixo | Médio | Alto |
| Afeta specs canônicas | Não | Possível | Sim |
| Requer stages separadas | Não | Não | Sim |
| Exemplos | Fix de typo, label, cor | Nova tela simples, endpoint CRUD | Novo módulo, refactor arquitetural |

---

## Política de checkpoints

- **Small:** sem checkpoint formal. Humano valida ao final.
- **Medium:** checkpoint após `/execute-cycle` (antes de validate e update-spec).
- **Large:** checkpoint obrigatório após cada `/close-stage`. O agente **não avança** sem aprovação explícita.

---

## Política de atualização de specs

1. Durante o ciclo, proponha mudanças em `spec-delta.md`.
2. Após `/validate-cycle` com sucesso, rode `/update-spec`.
3. `/update-spec` incorpora o delta em `spec/` e registra as specs alteradas.
4. Nunca documente intenção não entregue como fato em `spec/`.

---

## Política de commits (quando solicitado)

Commits só ocorrem se o humano escrever explicitamente **"e faça os commits"**.

Quando autorizado:
- Revise `git status` e `git diff` antes de commitar.
- Não use `git add .` cegamente.
- Commite apenas arquivos da stage/cycle atual.
- Nunca commite: `.env`, tokens, API keys, `DATABASE_URL`, dados sensíveis, logs, dumps, `node_modules`, build outputs.
- Não faça push.

---

## Path canônico de cycles

```
cycles/Q{quarter}{year}/{MMDD}-{slug}/
```

Exemplos:
- `cycles/Q22026/0523-auth-sso/`
- `cycles/Q32026/0701-relatorio-exportacao/`

---

_Harness version: 1.0.0_
