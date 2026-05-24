# /close-cycle

Fecha o cycle com verificação final e geração do closing summary.

---

## Passos

### 1. Verificar arquivos obrigatórios

Confirmar que existem no path do cycle:

**Small:**
- [ ] `request.md`
- [ ] `tasks.md`
- [ ] `validation.md`

**Medium:**
- [ ] `request.md`
- [ ] `plan.md`
- [ ] `tasks.md`
- [ ] `scenarios.feature`
- [ ] `validation.md`
- [ ] `review.md`

**Large:**
- [ ] `request.md`
- [ ] `plan.md`
- [ ] `tasks.md`
- [ ] `scenarios.feature`
- [ ] `spec-delta.md`
- [ ] `implementation-notes.md`
- [ ] `validation.md`
- [ ] `review.md`
- [ ] `stage-summaries/stage-{N}.md` para cada stage executada

### 2. Verificar tasks

- [ ] Todas as tasks estão `done` em `tasks.md`
- [ ] Nenhuma task ficou em `pending` ou `in_progress` sem justificativa registrada

### 3. Verificar validation

- [ ] `validation.md` tem evidências para todos os cenários
- [ ] Nenhuma falha crítica não explicada
- [ ] Falhas baseline documentadas (se houver)

### 4. Verificar review

- [ ] `review.md` preenchido
- [ ] Sem blockers abertos
- [ ] Warnings resolvidos ou documentados como tech debt

### 5. Verificar specs (quando aplicável)

- [ ] `/update-spec` foi executado (se `spec-delta.md` existia)
- [ ] Specs em `spec/` refletem o comportamento implementado

### 6. Registrar ressalvas

Se houver itens não concluídos, problemas conhecidos ou tech debt, registrar explicitamente no closing summary como "Ressalvas".

### 7. Gerar closing summary

Criar `cycles/{path}/closing-summary.md`:

```markdown
# Closing Summary — {slug}

## Cycle: {path}
## Tipo: Small / Medium / Large
## Data de fechamento: YYYY-MM-DD

## O que foi entregue
{descrição objetiva do que o cycle implementou}

## Critérios de aceite
| Critério | Status |
|---|---|
| {critério do request.md} | ✅ Atendido / ⚠️ Parcial / ❌ Não atendido |

## Arquivos alterados
- `{arquivo}` — {create / edit / delete}

## Validação
- Lint: PASS / FAIL
- Typecheck: PASS / FAIL
- Testes: PASS / FAIL
- Build: PASS / FAIL
- E2E: PASS / FAIL / N/A

## Specs atualizadas
- `spec/{arquivo}.md` — {seção}
- `spec/features/{slug}.md` — novo (se aplicável)

## Tech debt identificado
- {item / nenhum}

## Ressalvas
- {ressalvas / nenhuma}

## Status final
✅ Cycle fechado com sucesso.
```

### 8. Reportar ao humano

1. Status do fechamento (sucesso / com ressalvas)
2. O que foi entregue
3. Critérios de aceite atendidos
4. Tech debt registrado
5. Ressalvas (se houver)

---

## O que NÃO fazer

- Não fechar com tasks pendentes sem justificativa
- Não fechar com blockers abertos
- Não fechar com falha crítica não explicada
- Não implementar nada durante o close-cycle
- Não fazer push
