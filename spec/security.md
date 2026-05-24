# spec/security.md — Checklist e Padrões de Segurança

## Princípio base

> O servidor nunca confia no cliente. Toda autorização e validação ocorre server-side.

---

## Checklist de segurança

### Autenticação (Auth)
- [ ] Rotas protegidas verificam sessão/token válido antes de qualquer operação
- [ ] Sessões expiram corretamente
- [ ] Logout invalida a sessão server-side
- [ ] Não expor stack traces ou detalhes internos em respostas de erro

### Autorização
- [ ] Cada operação verifica se o usuário autenticado tem permissão para aquele recurso
- [ ] Não confiar em `role`, `is_admin`, `status` vindo do client — sempre verificar server-side
- [ ] Permissões verificadas na camada de serviço/action, não apenas na UI

### IDOR (Insecure Direct Object Reference)
- [ ] Nunca retornar recurso apenas pelo ID sem verificar que pertence ao usuário/tenant/owner correto
- [ ] Queries sempre escopadas: `WHERE id = ? AND owner_id = ?` (ou equivalente)

### Mass Assignment
- [ ] Nunca usar spread de body completo em criação/atualização de registros
- [ ] Whitelist explícita dos campos aceitos em cada operação
- [ ] Campos sensíveis (`amount`, `status`, `role`, `is_admin`, `created_at`, `updated_at`) nunca atualizados via input direto do client

### Validação de payload
- [ ] Todo input validado com schema strict (Zod, Joi, ou equivalente)
- [ ] Tipos, formatos, tamanhos e ranges validados
- [ ] Rejeitar campos inesperados
- [ ] Sanitizar inputs quando aplicável (HTML, SQL)

### Scoping por owner/tenant/user
- [ ] Nunca confiar em `user_id`, `tenant_id`, `owner_id` vindo do client
- [ ] Esses valores sempre extraídos da sessão autenticada server-side
- [ ] Queries sempre filtram pelo contexto do usuário autenticado

### Dados sensíveis
- [ ] Senhas nunca armazenadas em plaintext (bcrypt ou equivalente)
- [ ] Tokens, API keys, secrets nunca retornados em respostas desnecessárias
- [ ] Dados sensíveis nunca logados
- [ ] PII minimizado: coletar apenas o necessário

### Logs
- [ ] Logs não contêm: senhas, tokens, API keys, DATABASE_URL, CPF, dados bancários, dados de sessão
- [ ] Logs de erro não expõem stack trace para o client

### LGPD (quando aplicável)
- [ ] Dados pessoais coletados apenas com base legal adequada
- [ ] Usuário pode solicitar exclusão dos próprios dados
- [ ] Dados não compartilhados com terceiros sem consentimento
- [ ] Retenção de dados tem prazo definido

### Server Actions / API Routes (Next.js ou equivalente)
- [ ] Server Actions validam autenticação e autorização antes de qualquer operação
- [ ] Não expor Server Actions como endpoints públicos sem proteção
- [ ] Revalidação de cache não expõe dados de outro usuário

### Testes de acesso negado
- [ ] Testar que usuário A não acessa recursos de usuário B
- [ ] Testar que usuário sem permissão recebe 401/403
- [ ] Testar que campos protegidos não são alterados via mass assignment

---

## Campos que NUNCA devem vir do client

Os seguintes campos devem ser **sempre** definidos server-side, nunca aceitos do client:

- `user_id`, `tenant_id`, `owner_id`
- `role`, `is_admin`, `permissions`
- `status` (quando controla fluxo de negócio sensível)
- `amount`, `price`, `discount` (valores financeiros)
- `created_at`, `updated_at`

---

## Classificação de findings

| Classificação | Descrição |
|---|---|
| **Blocker** | Vulnerabilidade crítica — impede fechamento do cycle |
| **Warning** | Risco real mas com mitigação — deve ser resolvido ou documentado |
| **Recommendation** | Melhoria de postura — pode ser registrada como tech debt |

---

_Harness version: 1.0.0_
