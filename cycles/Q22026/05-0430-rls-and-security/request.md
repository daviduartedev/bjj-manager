# RLS and Security

## Context
O schema existe, mas qualquer cliente autenticado consegue ler/escrever
qualquer linha enquanto o RLS não estiver ligado. Como o produto é
multi-tenant por design, ligar RLS antes de qualquer Server Action que
toca dados de domínio é não-negociável. Cada professor deve enxergar
**apenas** os dados da sua própria `account_id`.

## Intent
- Habilitar Row Level Security em: `accounts`, `profiles`, `students`,
  `student_graduations`, `plans`, `student_plans`, `payments`.
- `belts` permanece pública (catálogo global, leitura para
  autenticados; sem escrita).
- Função SQL utilitária `auth.account_id()` que devolve a `account_id`
  do `profile` do `auth.uid()`.
- Policies de `select`, `insert`, `update`, `delete` por tabela,
  todas filtrando por `account_id = auth.account_id()`.
- Para tabelas filhas (`student_graduations`, `student_plans`,
  `payments`), policy faz join com `students` para validar
  `account_id`.
- Documento `docs/security/rls.md` explicando cada policy em prosa.

## Taste / Constraints
- Validar com **dois** usuários reais no Supabase Auth: A não enxerga
  dados de B em hipótese alguma.
- Anon role retorna 0 linhas em tudo que tem `account_id`.
- Inserir com `account_id` alheio é rejeitado pelo banco, não pelo
  cliente.
- Service role só será usada em rotas server-side controladas (ex.:
  webhooks futuros). Nunca no cliente.

## References
- `cycles/Q22026/04-0430-supabase-schema/request.md`
- `db/policies.sql` (placeholder já criado).
- Docs Supabase RLS.

## Attachments
- (nenhum)
