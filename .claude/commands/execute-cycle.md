# /execute-cycle

Executa cycles **Small** e **Medium**. Implementa as tasks do ciclo, atualiza artefatos e para para checkpoint humano.

> Para cycles **Large**, use `/map-stage` + `/execute-stage`.

---

## Passos

### 1. Ler os artefatos do cycle

Ler nesta ordem:
1. `cycles/{path}/request.md`
2. `cycles/{path}/plan.md` (se existir)
3. `cycles/{path}/tasks.md`
4. `cycles/{path}/scenarios.feature` (se existir)
5. `cycles/{path}/spec-delta.md` (se existir)

### 2. Ler specs relevantes

Ler as specs listadas no `plan.md`. Não ler o repositório inteiro.

### 3. Ler apenas os arquivos de código necessários

Ler somente os arquivos listados em `plan.md` como afetados. Não explorar o repositório além disso sem necessidade.

### 4. Executar as tasks

- Executar **somente** as tasks listadas em `tasks.md`
- Marcar cada task como `in_progress` antes de iniciar e `done` ao concluir
- Não adicionar tasks novas sem comunicar ao humano
- Não implementar nada fora do escopo do `request.md`
- Não transformar Medium em Large silenciosamente

### 5. Atualizar artefatos durante a execução

- `tasks.md` — atualizar status conforme avança
- `implementation-notes.md` — registrar decisões técnicas relevantes (se existir)
- `validation.md` — registrar evidências parciais conforme tarefas concluídas

### 6. Não atualizar spec/ final

- `spec-delta.md` pode ser ajustado se algo mudar
- `spec/` **não** é atualizada durante o execute — somente via `/update-spec` após validação

### 7. Parar para checkpoint humano

Ao concluir todas as tasks, **não continuar automaticamente**. Reportar:
1. Tasks concluídas
2. Arquivos alterados
3. Decisões técnicas relevantes
4. Próximo passo recomendado: `/review-implementation`

---

## O que NÃO fazer

- Não executar cycle Large (usar `/execute-stage`)
- Não atualizar `spec/` final
- Não adicionar features fora do escopo
- Não refatorar código não relacionado ao cycle
- Não commitar sem instrução explícita
- Não fazer push
