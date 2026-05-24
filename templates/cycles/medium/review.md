# review.md — Medium Cycle

## Cycle: {slug}
## Revisor: {agente / humano}
## Data: YYYY-MM-DD

---

## Escopo

- [ ] Implementação cobre tudo que está em `tasks.md`
- [ ] Nada foi implementado fora do escopo do `request.md`
- [ ] Sem features extras não solicitadas

---

## Código

- [ ] Sem código morto ou comentado sem justificativa
- [ ] Sem imports não utilizados
- [ ] Naming claro e consistente com o projeto
- [ ] Sem abstrações prematuras introduzidas

---

## Segurança

- [ ] Validação de input server-side
- [ ] Autorização verificada antes de operar
- [ ] Sem `user_id` / `tenant_id` / `role` aceitos do client
- [ ] Sem dados sensíveis expostos em logs ou respostas

---

## Testes

- [ ] Cenários de aceite cobertos
- [ ] Cenário de acesso negado coberto
- [ ] Sem testes frágeis ou dependentes de ordem

---

## Findings

### Blockers (impedem fechamento)
- {nenhum / descrição}

### Warnings (devem ser resolvidos ou documentados)
- {nenhum / descrição}

### Recommendations (tech debt / melhoria futura)
- {nenhum / descrição}

---

## Conclusão

- [ ] Sem blockers
- [ ] Warnings resolvidos ou documentados
- [ ] Pronto para `/validate-cycle`
