# review.md — Large Cycle

## Cycle: {slug}

---

## Stage 1 — {nome}
### Data: YYYY-MM-DD | Revisor: {agente / humano}

#### Escopo
- [ ] Tasks da stage 1 implementadas completamente
- [ ] Nada implementado fora do escopo da stage 1

#### Código
- [ ] Sem código morto
- [ ] Naming claro e consistente
- [ ] Sem abstrações prematuras

#### Segurança (quando aplicável)
- [ ] Validação de input
- [ ] Autorização server-side
- [ ] Sem dados sensíveis expostos

#### Findings Stage 1
- **Blockers:** {nenhum / lista}
- **Warnings:** {nenhum / lista}
- **Recommendations:** {nenhum / lista}

---

## Stage 2 — {nome}
### Data: YYYY-MM-DD | Revisor: {agente / humano}

#### Escopo
- [ ] Tasks da stage 2 implementadas completamente
- [ ] Nada implementado fora do escopo da stage 2

#### Código
- [ ] Sem código morto
- [ ] Sem regressões visíveis em relação à stage 1

#### Segurança (quando aplicável)
- [ ] Validação e autorização presentes

#### Findings Stage 2
- **Blockers:** {nenhum / lista}
- **Warnings:** {nenhum / lista}
- **Recommendations:** {nenhum / lista}

---

## Stage 3 — {nome}
### Data: YYYY-MM-DD | Revisor: {agente / humano}

#### Escopo
- [ ] Tasks da stage 3 implementadas completamente
- [ ] Fluxo ponta a ponta funcionando

#### Código
- [ ] Sem código morto ou temporário esquecido
- [ ] Integração entre stages consistente

#### Segurança
- [ ] Revisão de segurança completa (`/security-review` executado)

#### Testes e E2E
- [ ] Cenários críticos cobertos
- [ ] E2E executado ou smoke documentado

#### Findings Stage 3
- **Blockers:** {nenhum / lista}
- **Warnings:** {nenhum / lista}
- **Recommendations:** {nenhum / lista}

---

## Conclusão geral

- [ ] Sem blockers em nenhuma stage
- [ ] Warnings resolvidos ou documentados como tech debt
- [ ] Pronto para `/update-spec` e `/close-cycle`
