# validation.md — Medium Cycle

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
| `pnpm e2e` | PASS / FAIL / N/A | {observação} |

---

## Mapeamento scenarios.feature → evidência

| Cenário | Tipo de evidência | Resultado |
|---|---|---|
| {nome do cenário 1} | automated test / smoke manual | PASS / FAIL |
| {nome do cenário 2} | automated test / smoke manual | PASS / FAIL |
| {nome do cenário — acesso negado} | automated test / smoke manual | PASS / FAIL |

---

## Smoke manual (quando E2E não disponível)

| Passo | Ação | Resultado esperado | Resultado observado |
|---|---|---|---|
| 1 | {ação} | {esperado} | PASS / FAIL |

---

## Falhas baseline (pré-existentes)

- {falha baseline, se houver — não introduzida por este cycle}

---

## Conclusão

- [ ] Todos os cenários de aceite com evidência
- [ ] Nenhuma falha nova (ou justificada acima)
- [ ] Lint, typecheck e build passando
- [ ] Pronto para `/update-spec` e `/close-cycle`
