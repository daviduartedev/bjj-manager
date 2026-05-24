# validation.md — Small Cycle

## Cycle: {slug}
## Data de validação: YYYY-MM-DD

---

## Resultado dos comandos

| Comando | Resultado | Observações |
|---|---|---|
| `pnpm lint` | PASS / FAIL / N/A | {observação} |
| `pnpm typecheck` | PASS / FAIL / N/A | {observação} |
| `pnpm test` | PASS / FAIL / N/A | {observação} |
| `pnpm build` | PASS / FAIL / N/A | {observação} |

---

## Smoke manual

> Preencher quando não há testes automatizados cobrindo o cenário.

| Passo | Ação | Resultado esperado | Resultado observado |
|---|---|---|---|
| 1 | {ação} | {esperado} | PASS / FAIL |

---

## Critérios de aceite

| Critério | Status | Evidência |
|---|---|---|
| {critério do request.md} | PASS / FAIL | {evidência ou "smoke manual acima"} |

---

## Falhas baseline (pré-existentes)

> Liste aqui falhas que existiam antes deste cycle e não foram introduzidas por ele.

- {falha baseline, se houver}

---

## Conclusão

- [ ] Todos os critérios de aceite atendidos
- [ ] Nenhuma falha nova introduzida (ou justificada acima)
- [ ] Pronto para `/close-cycle`
