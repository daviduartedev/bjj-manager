# /map-stage

Gera o **Execution Map** de uma stage de cycle Large antes de qualquer implementação. Serve como checkpoint de alinhamento entre agente e humano.

> Usar **sempre** antes de `/execute-stage`. Não pular este passo.

---

## Passos

### 1. Identificar a stage

Perguntar ao humano: "Qual stage vamos mapear?" (ex: Stage 1, Stage 2).

### 2. Ler os artefatos do cycle

- `cycles/{path}/request.md`
- `cycles/{path}/plan.md`
- `cycles/{path}/tasks.md` — filtrar tasks da stage solicitada
- `cycles/{path}/scenarios.feature` — filtrar cenários da stage
- `cycles/{path}/spec-delta.md`
- `cycles/{path}/implementation-notes.md` (se existir — para stages 2+)
- `cycles/{path}/stage-summaries/stage-{N-1}.md` (se existir — para stages 2+)

### 3. Ler specs relevantes para esta stage

Apenas as specs que impactam as tasks desta stage específica.

### 4. Gerar o Execution Map

Produzir um documento claro com as seguintes seções:

---

```markdown
## Execution Map — {cycle slug} / Stage {N} — {nome da stage}

### Objetivo
{O que esta stage deve entregar ao final}

### Tasks incluídas
| # | Descrição | Arquivo alvo |
|---|---|---|
| {N.1} | {descrição} | `{arquivo}` |
| {N.2} | {descrição} | `{arquivo}` |

### Arquivos que serão criados ou modificados
- `{arquivo}` — {create / edit} — {motivo}

### Specs relevantes para esta stage
- `spec/{arquivo}.md` — {seção relevante}

### Riscos identificados para esta stage
| Risco | Probabilidade | Mitigação |
|---|---|---|
| {risco} | Alta/Média/Baixa | {mitigação} |

### Fora de escopo desta stage
- {o que NÃO será feito nesta stage}

### Validações que serão rodadas ao final
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- {outros conforme relevante}

### Cenários de aceite desta stage
- {cenário 1 do scenarios.feature}
- {cenário 2}

### Critério de parada (quando a stage está concluída)
{descrição clara de quando a stage pode ser fechada}
```

---

### 5. Aguardar aprovação humana

Após gerar o Execution Map, **não iniciar implementação**. Aguardar confirmação explícita do humano antes de prosseguir para `/execute-stage`.

---

## O que NÃO fazer

- Não alterar nenhum código
- Não criar ou modificar arquivos do projeto
- Não iniciar implementação antes da aprovação
- Não gerar Execution Map para múltiplas stages de uma vez
