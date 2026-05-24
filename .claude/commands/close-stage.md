# /close-stage

Fecha uma stage de cycle Large. Consolida status, gera stage summary e prepara para checkpoint humano antes da próxima stage.

---

## Passos

### 1. Verificar pré-condições

Antes de fechar, confirmar:
- [ ] Todas as tasks desta stage estão `done` em `tasks.md`
- [ ] `validation.md` tem evidências desta stage
- [ ] `review.md` desta stage foi preenchido (sem blockers abertos)
- [ ] `implementation-notes.md` está atualizado para esta stage

Se alguma condição não for atendida, reportar ao humano e **não fechar**.

### 2. Atualizar implementation-notes.md

Consolidar as notas desta stage:
- Decisões técnicas tomadas
- Problemas encontrados e resoluções
- Desvios do plano original (com justificativa)
- Tech debt identificado
- Notas de rollback / mitigação se aplicável

### 3. Atualizar validation.md

Garantir que a seção desta stage está completa:
- Resultados de todos os comandos rodados
- Mapeamento cenários → evidências
- Falhas baseline documentadas (se houver)

### 4. Atualizar review.md

Garantir que a seção desta stage está completa:
- Checklist preenchido
- Findings registrados (blockers resolvidos, warnings documentados)

### 5. Gerar stage summary

Criar `cycles/{path}/stage-summaries/stage-{N}.md`:

```markdown
# Stage Summary — Stage {N}: {nome}

## Cycle: {slug}
## Data de fechamento: YYYY-MM-DD

## O que foi entregue
{descrição objetiva do que esta stage implementou}

## Tasks concluídas
| # | Descrição | Status |
|---|---|---|
| {N.1} | {descrição} | done |

## Arquivos criados / modificados
- `{arquivo}` — {create / edit}

## Validação
- Lint: PASS / FAIL
- Typecheck: PASS / FAIL
- Testes: PASS / FAIL ({N} passing)
- Build: PASS / FAIL

## Cenários validados
- {cenário}: PASS

## Decisões técnicas relevantes
- {decisão}

## Tech debt identificado
- {item / nenhum}

## Bloqueios para a próxima stage
- {dependência / nenhum}

## Próxima stage
- Stage {N+1}: {nome} — aguardando aprovação humana
```

### 6. Modo commit (apenas se autorizado)

Somente se o humano escrever explicitamente **"e faça os commits"**:

```bash
# Revisar o que mudou
git status
git diff --staged

# Verificar secrets (NUNCA commitar)
# .env, tokens, API keys, DATABASE_URL, dados sensíveis

# Adicionar apenas arquivos da stage
git add {arquivo1} {arquivo2} ...
# NUNCA: git add .

# Commitar
git commit -m "feat({slug}): stage {N} — {descrição curta}"

# NÃO fazer push
```

### 7. Reportar ao humano

1. Stage {N} fechada com sucesso
2. Arquivo gerado: `stage-summaries/stage-{N}.md`
3. Status geral: tasks concluídas, validação, review
4. Bloqueios para a próxima stage (se houver)
5. Próximo passo: aguardando aprovação para Stage {N+1} → `/map-stage`

---

## O que NÃO fazer

- Não atualizar `spec/` final (somente via `/update-spec` ao final de todas as stages)
- Não iniciar a próxima stage sem aprovação humana explícita
- Não fechar com blockers abertos em `review.md`
- Não fechar com falha crítica não explicada em `validation.md`
- Não fazer push
