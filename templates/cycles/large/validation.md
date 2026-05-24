# validation.md — Large Cycle

## Cycle: {slug}

---

## Stage 1 — {nome}
### Data: YYYY-MM-DD

| Comando | Resultado | Observações |
|---|---|---|
| `pnpm lint` | PASS / FAIL / N/A | {observação} |
| `pnpm typecheck` | PASS / FAIL / N/A | {observação} |
| `pnpm test` | PASS / FAIL / N/A | {observação} |
| `pnpm build` | PASS / FAIL / N/A | {observação} |

| Cenário | Evidência | Resultado |
|---|---|---|
| {cenário stage 1} | automated / smoke | PASS / FAIL |

**Falhas baseline:** {nenhuma / lista}

---

## Stage 2 — {nome}
### Data: YYYY-MM-DD

| Comando | Resultado | Observações |
|---|---|---|
| `pnpm lint` | PASS / FAIL / N/A | {observação} |
| `pnpm typecheck` | PASS / FAIL / N/A | {observação} |
| `pnpm test` | PASS / FAIL / N/A | {observação} |
| `pnpm build` | PASS / FAIL / N/A | {observação} |

| Cenário | Evidência | Resultado |
|---|---|---|
| {cenário stage 2} | automated / smoke | PASS / FAIL |

**Falhas baseline:** {nenhuma / lista}

---

## Stage 3 — {nome}
### Data: YYYY-MM-DD

| Comando | Resultado | Observações |
|---|---|---|
| `pnpm lint` | PASS / FAIL / N/A | {observação} |
| `pnpm typecheck` | PASS / FAIL / N/A | {observação} |
| `pnpm test` | PASS / FAIL / N/A | {observação} |
| `pnpm build` | PASS / FAIL / N/A | {observação} |
| `pnpm e2e` | PASS / FAIL / N/A | {observação} |

| Cenário | Evidência | Resultado |
|---|---|---|
| {cenário stage 3} | automated / smoke | PASS / FAIL |
| {cenário E2E ponta a ponta} | e2e / smoke | PASS / FAIL |

**Falhas baseline:** {nenhuma / lista}

---

## Conclusão geral

- [ ] Todos os cenários de aceite com evidência
- [ ] Nenhuma falha nova não explicada
- [ ] Lint, typecheck e build passando em todas as stages
- [ ] Pronto para `/update-spec` e `/close-cycle`
