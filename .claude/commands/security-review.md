# /security-review

Revisão de segurança review-first: lê, analisa e reporta findings sem alterar código.

> Pode ser rodado a qualquer momento, mas é obrigatório em cycles Medium e Large antes do `/close-cycle`.

---

## Passos

### 1. Ler os artefatos do cycle

- `cycles/{path}/request.md`
- `cycles/{path}/plan.md`
- `cycles/{path}/tasks.md`
- `cycles/{path}/spec-delta.md`

### 2. Ler specs de segurança e contexto

- `spec/security.md` — checklist completo
- `spec/backend.md` — padrões de backend
- `spec/database.md` — scoping e migrations
- `spec/features/{slug}.md` (se existir) — comportamento da feature

### 3. Ler o git diff

```bash
git diff main...HEAD
# ou
git diff HEAD~{N}
```

Analisar todas as mudanças com foco em segurança.

### 4. Verificar cada item do checklist

#### Autenticação
- [ ] Rotas/actions verificam sessão válida antes de qualquer operação?
- [ ] Logout invalida sessão server-side?
- [ ] Erros de auth não expõem detalhes internos?

#### Autorização
- [ ] Cada operação verifica permissão do usuário sobre o recurso?
- [ ] `role`, `is_admin`, `status` nunca aceitos do client?
- [ ] Permissão verificada na camada de serviço, não apenas na UI?

#### IDOR
- [ ] Recursos buscados sempre com filtro de owner/tenant/user?
- [ ] Nunca retorna recurso apenas pelo ID sem scoping?

#### Mass Assignment
- [ ] Whitelist explícita de campos aceitos em create/update?
- [ ] `amount`, `price`, `role`, `status`, `created_at`, `updated_at` nunca aceitos do client?

#### Validação de payload
- [ ] Input validado com schema strict (Zod ou equivalente)?
- [ ] Campos inesperados rejeitados?
- [ ] Tipos, formatos e ranges validados?

#### Scoping
- [ ] `user_id`, `tenant_id`, `owner_id` sempre extraídos da sessão?
- [ ] Queries sempre filtradas pelo contexto autenticado?

#### Dados sensíveis
- [ ] Senhas não armazenadas em plaintext?
- [ ] Tokens/API keys não retornados desnecessariamente?
- [ ] Dados sensíveis não logados?

#### Logs
- [ ] Logs não contêm senhas, tokens, CPF, dados bancários?
- [ ] Stack traces não retornados ao client?

#### LGPD (quando aplicável)
- [ ] Dados pessoais coletados apenas com base legal?
- [ ] PII minimizado?

#### Server Actions / API Routes
- [ ] Actions verificam auth e authz antes de operar?
- [ ] Nenhum endpoint público sem proteção intencional?

#### Testes de acesso negado
- [ ] Existe cobertura de teste para acesso negado?
- [ ] Testado que usuário A não acessa dados de usuário B?

### 5. Gerar relatório de findings

Classificar cada finding:

| Classificação | Critério |
|---|---|
| **Blocker** | Vulnerabilidade crítica — impede fechamento do cycle |
| **Warning** | Risco real com mitigação possível — deve ser resolvido ou documentado |
| **Recommendation** | Melhoria de postura de segurança — pode virar tech debt |

### 6. Atualizar review.md

Adicionar seção de segurança em `cycles/{path}/review.md` com os findings.

### 7. Reportar ao humano

1. Status geral: ✅ Sem blockers / ⚠️ Com warnings / ❌ Bloqueado
2. Blockers encontrados (se houver)
3. Warnings encontrados (se houver)
4. Recommendations registradas
5. Próximo passo se bloqueado: resolver blockers antes de `/validate-cycle`

---

## O que NÃO fazer

- Não alterar código sem autorização explícita do humano
- Não suprimir findings por "baixa probabilidade"
- Não ignorar mass assignment ou IDOR por parecerem "improvável"
- Não reportar como "ok" sem verificar o diff real
