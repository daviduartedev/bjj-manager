# /e2e-review

Revisão de cobertura E2E review-first: analisa cenários críticos, mapeia gaps e indica o que deve ser automatizado, sem implementar testes.

---

## Passos

### 1. Ler os artefatos do cycle

- `cycles/{path}/scenarios.feature` — cenários de aceite
- `cycles/{path}/validation.md` — evidências já registradas

### 2. Ler specs de testing e feature

- `spec/testing.md` — política de testes e E2E
- `spec/features/{slug}.md` (se existir) — fluxos críticos da feature

### 3. Ler testes E2E existentes (se houver)

```bash
# Verificar se há diretório de E2E
ls e2e/
ls tests/e2e/
ls cypress/
ls playwright/
```

Ler os arquivos de teste relevantes para entender cobertura atual.

### 4. Ler configuração de E2E (se houver)

```bash
# Exemplos comuns
cat playwright.config.ts
cat cypress.config.ts
```

Entender: autenticação nos testes, fixtures, base URL, ambientes disponíveis.

### 5. Mapear fluxos críticos

Identificar os fluxos de maior risco que precisam de cobertura E2E:

| Fluxo | Criticidade | Cobertura atual | Gap |
|---|---|---|---|
| {autenticação / login} | Alta | sim / não / parcial | {descrever} |
| {fluxo principal da feature} | Alta | sim / não / parcial | {descrever} |
| {fluxo de erro crítico} | Média | sim / não / parcial | {descrever} |

### 6. Identificar blockers de E2E

Problemas que impedem a escrita ou execução de testes E2E:

#### Auth / test data
- [ ] Como os testes fazem login? (cookie, fixture, bypass?)
- [ ] Há usuários de teste disponíveis?
- [ ] Banco de dados de teste isolado?
- [ ] Seeds/fixtures para dados necessários?

#### Flakiness
- [ ] Há elementos sem seletores estáveis (`data-testid`)?
- [ ] Há animações ou delays que podem causar flakiness?
- [ ] Há dependência de dados externos (APIs de terceiros)?

#### Ambiente
- [ ] E2E roda em CI?
- [ ] Base URL configurada para ambiente de teste?

### 7. Recomendar testes

Para cada gap identificado, recomendar:

```gherkin
# Teste recomendado — {fluxo}
Scenario: {nome}
  Given {pré-condição e setup necessário}
  When {ação do usuário}
  Then {resultado verificável}
  # Arquivo sugerido: e2e/{slug}.spec.ts
  # Pré-requisito: {auth fixture / seed / etc.}
```

### 8. Reportar ao humano

1. Fluxos críticos mapeados
2. Gaps de cobertura identificados
3. Blockers para implementação E2E (auth, dados, ambiente)
4. Testes recomendados (lista priorizada)
5. Próximo passo:
   - Se E2E necessário antes do close: aguardar autorização para `/execute-e2e` (cycle separado ou task adicional)
   - Se smoke manual suficiente: documentar em `validation.md` e prosseguir

---

## O que NÃO fazer

- Não implementar testes E2E sem autorização explícita do humano
- Não marcar gap como "coberto" por smoke manual quando E2E era obrigatório
- Não ignorar blockers de auth/test data
- Não criar testes frágeis sem estratégia de seletores estáveis
