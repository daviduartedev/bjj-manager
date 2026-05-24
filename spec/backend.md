# spec/backend.md — Padrões de Backend

## Princípios fundamentais

- O servidor nunca confia no cliente.
- Validação, autorização e regras de negócio vivem server-side.
- Não duplicar regra de negócio entre client e server.
- Separação clara de responsabilidades.

---

## Validação de entrada

- Todo input externo validado com schema explícito (Zod, Joi, ou equivalente do projeto).
- Validação ocorre na borda (action/route handler), antes de chegar à camada de serviço.
- Campos inesperados rejeitados (strict parsing).
- Tipos, formatos, tamanhos e ranges validados.
- Erros de validação retornam mensagem clara sem expor detalhes internos.

---

## Autorização server-side

- Verificar autenticação antes de qualquer operação.
- Verificar autorização (permissão sobre o recurso específico) após autenticação.
- `user_id`, `tenant_id`, `owner_id` sempre extraídos da sessão, nunca do body/params.
- Queries sempre escopadas ao contexto do usuário autenticado.
- Acesso negado retorna 401 (não autenticado) ou 403 (não autorizado), nunca 200 com dados vazios.

---

## Tratamento de erro

- Erros esperados (validação, not found, acesso negado) retornam status HTTP semântico.
- Erros inesperados logados server-side com contexto suficiente para debugging.
- Stack traces nunca retornados ao client.
- Mensagens de erro ao client são claras mas não expõem detalhes de implementação.

---

## Separação de responsabilidades

- **Route/Action handler:** parsing, validação de input, chamada ao serviço, formatação de resposta.
- **Service/Use case:** regra de negócio, orquestração, chamadas ao repositório.
- **Repository/Query:** acesso ao banco, queries escopadas, sem lógica de negócio.
- Não misturar acesso ao banco com lógica de negócio na mesma função.

---

## Não confiar no client

- Nunca usar valores do client para determinar permissões, ownership ou contexto de segurança.
- Nunca calcular valores financeiros no client e aceitar o resultado sem recalcular server-side.
- Nunca aceitar `role`, `is_admin`, `status`, `amount` do client como fonte de verdade.

---

## Idempotência (quando aplicável)

- Operações críticas (pagamento, envio de email, criação de recurso único) devem ser idempotentes.
- Use chave de idempotência ou deduplicação por hash quando o risco de duplicação for real.
- Documentar no `implementation-notes.md` quando idempotência for implementada.

---

## Transações (quando aplicável)

- Usar transações de banco quando múltiplas escritas devem ser atômicas.
- Não deixar o banco em estado inconsistente em caso de erro parcial.
- Rollback explícito em caso de falha.

---

## Contratos de API

- Documentar mudanças de contrato (novos campos, campos removidos, mudança de tipo) em `spec-delta.md`.
- Não quebrar contrato de API existente sem cycle e aprovação.
- Versionamento de API quando necessário.

---

## Regras de negócio

- Não duplicar regra de negócio entre client e server.
- A versão server-side é a fonte de verdade.
- Regras de negócio documentadas em `spec/features/{slug}.md` após validação.

---

_Harness version: 1.0.0_
