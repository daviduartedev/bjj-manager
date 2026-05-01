# Plano , Ciclo 05: RLS e segurança (delta)

## Baseline

- Schema multi-tenant em [`db/schema.sql`](../../../db/schema.sql) (**ENT-***, **BR-***, **GR-***).
- Pedido original: [`request.md`](./request.md).
- Schema documentado em [`spec/features/supabase-schema/readme.md`](../../../spec/features/supabase-schema/readme.md) (RLS era ciclo seguinte).

## Decisões incorporadas (refino)

1. **Bootstrap em produção:** utilizador **Auth** `maikon@aslam.com.br` criado no dashboard Supabase; **primeira** linha de `accounts` + `profiles` associada por **SQL operacional** (conexão `postgres` / SQL Editor), **sem** password ou segredos versionados no repositório. Após o primeiro login, **rodar a senha** (trocar palavra-passe genérica inicial).
2. **Professor autenticado:** pode **gerir todo o domínio da própria conta** (alunos, graduações, planos, vínculos, pagamentos, dados da academia e perfis **da mesma** `account_id`) via políticas RLS; **não** há `INSERT` em `accounts` nem em `profiles` pelo papel `authenticated` no MVP (evita o problema da galinha e do ovo sem convites).
3. **Função de contexto:** uma única função canónica em **`public.current_account_id()`** , `sql`, **`SECURITY DEFINER`**, `search_path = public`, **`STABLE`**, corpo apenas `SELECT account_id FROM profiles WHERE user_id = auth.uid()`; `REVOKE ALL … FROM PUBLIC`; `GRANT EXECUTE … TO authenticated`. **Não** se usa o schema `auth` para funções ad hoc (higiene e compatibilidade Supabase).
4. **`belts`:** RLS ativo; **`anon`** sem políticas ⇒ **zero linhas**; **`authenticated`** só **`SELECT`**; **sem** escrita via cliente.
5. **`student_plans`:** políticas exigem aluno **e** plano na **mesma** `account_id` (subconsulta a `students` + `plans`).
6. **Fonte de verdade do Postgres:** a partir deste ciclo, o **projeto Supabase usado em produção** é o **Postgres canónico** da app; variáveis de ambiente e `pnpm db:apply` devem apontar para esse projeto (**SPEC-11.1**). Quem implementa **não** introduz segundo “Postgres de mentira” sem cópia documentada.
7. **`service_role`:** só rotas server-side controladas; **nunca** no browser , reforçado em spec e em [`docs/security/rls.md`](../../../docs/security/rls.md).

## Entregáveis

| Artefato | Descrição |
|----------|-----------|
| [`db/policies.sql`](../../../db/policies.sql) | RLS + função + políticas idempotentes (`DROP POLICY IF EXISTS` onde fizer sentido). |
| [`scripts/apply-db.cjs`](../../../scripts/apply-db.cjs) | Ordem: `schema.sql` → `seed.sql` → `policies.sql`. |
| [`spec/features/rls-security/readme.md`](../../../spec/features/rls-security/readme.md) | Contrato canónico RLS (**SEC-/** referência interna na feature). |
| [`docs/security/rls.md`](../../../docs/security/rls.md) | Prosa por tabela + bootstrap + validação A/B; sem credenciais. |
| [`spec/product/spec.md`](../../../spec/product/spec.md) + [`docs/product/spec.md`](../../../docs/product/spec.md) | **SPEC-11.x** infraestrutura de dados / Supabase produção. |
| Hub [`spec/README.md`](../../../spec/README.md) | Entrada da feature RLS. |
| [`spec/features/supabase-schema/readme.md`](../../../spec/features/supabase-schema/readme.md) | Remeter ao ciclo RLS como estado atual. |

## Fora deste ciclo

- Self-service “criar academia” só com cliente (exigiria `SECURITY DEFINER` ou fluxo com convite).
- Testes automatizados contra Postgres (opcional); validação manual **dois utilizadores** permanece obrigatória no pedido original.
