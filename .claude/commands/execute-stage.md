# /execute-stage

Executa **uma única stage** de um cycle Large. Para ao final para checkpoint humano obrigatório.

> Requer que `/map-stage` tenha sido executado e aprovado pelo humano antes.

---

## Passos

### 1. Confirmar qual stage será executada

Perguntar ao humano se não estiver claro. Confirmar que o Execution Map desta stage já foi aprovado.

### 2. Ler os artefatos necessários

- `cycles/{path}/request.md`
- `cycles/{path}/plan.md`
- `cycles/{path}/tasks.md` — apenas tasks desta stage
- `cycles/{path}/scenarios.feature` — cenários desta stage
- `cycles/{path}/implementation-notes.md`
- `cycles/{path}/stage-summaries/stage-{N-1}.md` (se stages anteriores existirem)

### 3. Ler apenas arquivos de código necessários

Somente os arquivos listados no Execution Map como afetados por esta stage.

### 4. Executar somente as tasks desta stage

- Executar **apenas** tasks numeradas para esta stage (ex: 2.1, 2.2, 2.3)
- Não reabrir tasks de stages anteriores sem pedido explícito
- Não adiantar tasks de stages futuras
- Marcar cada task como `in_progress` antes e `done` ao concluir em `tasks.md`

### 5. Atualizar artefatos durante a execução

- `tasks.md` — status das tasks desta stage
- `implementation-notes.md` — decisões técnicas, problemas encontrados, desvios do plano
- `validation.md` — evidências parciais conforme tasks concluídas

### 6. Rodar validações relevantes para esta stage

Executar os comandos disponíveis no projeto:
```bash
pnpm lint
pnpm typecheck
pnpm test        # ou apenas os testes afetados
pnpm build       # quando aplicável
```

Registrar resultados em `validation.md` — seção desta stage.

### 7. Parar para checkpoint humano

Ao concluir todas as tasks da stage, **parar imediatamente**. Não avançar para a próxima stage. Reportar:

1. Tasks desta stage concluídas
2. Arquivos criados / modificados
3. Resultado das validações
4. Decisões técnicas relevantes registradas em `implementation-notes.md`
5. Próximo passo recomendado: `/review-implementation` → `/validate-cycle` → `/close-stage`

---

## O que NÃO fazer

- Não avançar para a próxima stage sem aprovação humana
- Não reabrir stage anterior sem pedido
- Não implementar tasks de outras stages
- Não atualizar `spec/` final
- Não commitar sem instrução explícita ("e faça os commits")
- Não fazer push
