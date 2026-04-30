# QA and Hardening

## Context
Antes de subir para produção, varremos o app em busca de buracos de
segurança, validação e edge cases. Este ciclo é o "ensaio geral".

## Intent
- Re-testar RLS com 2 contas reais cobrindo cada tabela.
- Validar todas as Server Actions com payloads inválidos / maliciosos.
- Verificar que `account_id` nunca vem do cliente.
- Conferir que `service_role_key` não vaza em bundle do cliente.
- Cobrir edge cases:
  - aluno sem plano (não deve quebrar billing UI).
  - aluno com `due_day = 31` legado (forçar 1..28; se houver, migrar).
  - graduação com data futura (proibir).
  - pagamento de mês futuro (proibir ou alertar).
  - alunos com nomes muito longos (não quebra layout).
- Conferir tipagem strict do TypeScript em todo o repo.
- `pnpm lint`, `pnpm type-check`, `pnpm build` limpos.
- Lighthouse mobile ≥ 90 nas rotas principais.

## Taste / Constraints
- Sem novos features. Apenas robustez.
- Documentar achados em `docs/qa/findings-{MMDD}.md`.
- Tudo o que for corrigido entra na mesma branch (`develop`).

## References
- `cycles/Q22026/05-0430-rls-and-security/request.md`
- Todos os ciclos de feature anteriores.

## Attachments
- (nenhum)
