# /validate-cycle

Roda as validações disponíveis do projeto, mapeia cenários de aceite para evidências e atualiza `validation.md`.

---

## Passos

### 1. Ler os artefatos do cycle

- `cycles/{path}/scenarios.feature` — cenários de aceite
- `cycles/{path}/validation.md` — preencher com evidências
- `cycles/{path}/tasks.md` — verificar tasks concluídas

### 2. Descobrir comandos disponíveis

Verificar `package.json` para identificar os scripts disponíveis:

```bash
cat package.json | grep -A 30 '"scripts"'
```

### 3. Rodar os comandos disponíveis

Executar na ordem:

```bash
# Lint
pnpm lint

# Type check
pnpm typecheck

# Testes unitários / integração
pnpm test

# Build
pnpm build

# E2E (quando aplicável e configurado)
pnpm e2e
```

Adaptar conforme scripts reais do projeto. Se um comando não existir, registrar como N/A.

### 4. Registrar resultados em validation.md

Para cada comando, registrar:
- Resultado: PASS / FAIL / N/A
- Observações relevantes (número de testes, warnings, etc.)

Para falhas:
- Identificar se é **falha nova** (introduzida por este cycle) ou **falha baseline** (pré-existente)
- Falhas novas devem ser resolvidas antes do fechamento
- Falhas baseline devem ser documentadas explicitamente

### 5. Mapear scenarios.feature para evidências

Para cada cenário em `scenarios.feature`, registrar em `validation.md`:
- Tipo de evidência: `automated test` / `smoke manual`
- Resultado: PASS / FAIL
- Referência (nome do teste, output, etc.)

### 6. Documentar smoke manual quando necessário

Quando E2E não estiver disponível ou configurado, documentar o smoke manual:
- Passos executados
- Resultado observado
- Data e ambiente

### 7. Reportar ao humano

Apresentar resumo:
1. Resultado de cada comando (PASS / FAIL / N/A)
2. Cenários cobertos vs. não cobertos
3. Falhas novas encontradas (se houver)
4. Falhas baseline documentadas (se houver)
5. Próximo passo: `/update-spec` (se specs afetadas) → `/close-cycle` ou `/close-stage`

---

## O que NÃO fazer

- Não implementar código para fazer testes passar
- Não marcar cenário como PASS sem evidência real
- Não ignorar falhas novas
- Não confundir falha baseline com falha nova
- Não atualizar `spec/` — isso é papel do `/update-spec`
