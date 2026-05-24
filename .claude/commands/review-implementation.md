# /review-implementation

Revisão crítica da implementação do cycle ou stage. Review-first: lê e analisa, não altera código sem autorização.

---

## Passos

### 1. Ler os artefatos do cycle / stage

- `cycles/{path}/request.md` — intenção original
- `cycles/{path}/plan.md` — o que deveria ser feito
- `cycles/{path}/tasks.md` — tasks e status atual
- `cycles/{path}/scenarios.feature` — aceite esperado
- `cycles/{path}/spec-delta.md` — mudanças de spec propostas

### 2. Ler specs relevantes

As specs listadas no plan que foram afetadas por esta implementação.

### 3. Ler o git diff

```bash
git diff main...HEAD
# ou, se já estiver na branch correta:
git diff HEAD~{N}
```

Analisar todas as mudanças introduzidas pelo cycle / stage.

### 4. Verificar escopo

- [ ] Tudo que está em `tasks.md` foi implementado?
- [ ] Algo foi implementado fora do escopo do `request.md`?
- [ ] Houve feature extra não solicitada?
- [ ] Houve refactor não solicitado?
- [ ] Houve mudança de formatação misturada com mudança funcional?

### 5. Verificar qualidade do código

- [ ] Código morto ou comentado sem justificativa?
- [ ] Imports não utilizados?
- [ ] Naming inconsistente com o projeto?
- [ ] Abstração prematura introduzida?
- [ ] Console.log / debug esquecido?

### 6. Verificar segurança (quando aplicável)

- [ ] Validação de input server-side presente?
- [ ] Autorização verificada antes de operar sobre dados?
- [ ] `user_id` / `tenant_id` / `role` aceitos do client?
- [ ] Dados sensíveis em logs ou respostas?
- [ ] Mass assignment possível?

### 7. Verificar testes

- [ ] Cenários de aceite têm cobertura?
- [ ] Cenário de acesso negado coberto?
- [ ] Testes frágeis ou dependentes de ordem?

### 8. Atualizar review.md

Preencher `cycles/{path}/review.md` com:
- Checklist de cada seção acima
- Findings classificados:
  - **Blocker** — impede fechamento do cycle/stage
  - **Warning** — risco real, deve ser resolvido ou documentado
  - **Recommendation** — melhoria futura / tech debt

### 9. Reportar ao humano

Apresentar o review resumido com:
1. Status geral (aprovado / bloqueado)
2. Blockers (se houver)
3. Warnings (se houver)
4. Próximo passo recomendado: `/validate-cycle`

---

## O que NÃO fazer

- Não alterar código sem autorização explícita do humano
- Não fechar o review como "aprovado" com blockers não resolvidos
- Não ignorar mudanças fora de escopo
- Não misturar review com implementação
