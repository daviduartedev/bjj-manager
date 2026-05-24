# spec/testing.md — Política de Testes

## Princípios fundamentais

- Testes são evidência, não formalidade.
- `validation.md` mapeia cenários de aceite para evidências reais.
- Não fechar cycle com falha crítica não explicada.
- Falhas baseline (pré-existentes) registradas separadamente de falhas novas.

---

## Tipos de teste e quando usar

### Unit tests
- Para regras de negócio puras, funções utilitárias, transformações.
- Sem dependências externas (banco, rede, file system).
- Rápidos, determinísticos, fáceis de manter.
- **Quando criar:** toda função com lógica de negócio não trivial.

### Integration / API tests
- Para endpoints e server actions: validação de input, autorização, resposta correta.
- Usam banco de teste ou mocks de repositório.
- Verificam o contrato entre camadas.
- **Quando criar:** todo novo endpoint ou action com lógica de negócio.

### E2E tests
- Para fluxos críticos de usuário de ponta a ponta.
- Rodam no browser simulando interação real.
- Mais lentos e frágeis — usar com critério.
- **Quando criar:** fluxos de autenticação, pagamento, submissão de formulário crítico.

### Smoke manual
- Quando E2E automatizado não for viável no cycle.
- Documentado em `validation.md` com passos e resultado observado.
- Suficiente para ciclos Small; insuficiente como substituto permanente de E2E em fluxos críticos.

---

## Mapeamento scenarios.feature → validation.md

Cada cenário em `scenarios.feature` deve ter correspondência em `validation.md`:

```
Scenario: Usuário acessa recurso sem autenticação
→ validation.md: "PASS — curl /api/resource sem token retorna 401 (evidência: output do test:integration)"
```

Cenários sem evidência = ciclo não validado.

---

## Registro de falhas

- **Falha nova:** falha introduzida pelo cycle atual. Deve ser resolvida antes do fechamento.
- **Falha baseline:** falha pré-existente, não relacionada ao cycle. Deve ser documentada explicitamente em `validation.md`.
- Não aceitar falha nova como "já existia" sem verificação.

---

## Comandos de validação (adaptar ao projeto)

```bash
# Lint
pnpm lint

# Type check
pnpm typecheck

# Unit + integration tests
pnpm test

# Build
pnpm build

# E2E
pnpm e2e
```

Adaptar conforme scripts disponíveis no `package.json` do projeto.

---

## Critérios para fechar cycle

- [ ] Todos os cenários de aceite têm evidência em `validation.md`.
- [ ] Nenhuma falha nova introduzida pelo cycle (ou documentada com justificativa).
- [ ] Lint e typecheck passando (ou falhas baseline documentadas).
- [ ] Build passando.
- [ ] Smoke manual documentado quando E2E não foi executado.

---

## O que não fazer

- Não fechar cycle com teste crítico falhando sem explicação.
- Não marcar cenário como "PASS" sem evidência real.
- Não pular testes de acesso negado (auth/authz).
- Não confundir falha baseline com falha nova.

---

_Harness version: 1.0.0_
