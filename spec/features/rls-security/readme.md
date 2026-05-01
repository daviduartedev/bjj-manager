# Feature: RLS e segurança (Postgres / Supabase)

Contrato canónico para **isolamento multi-tenant** no banco: cada professor autenticado acede **apenas** à `account_id` do seu `profiles` ligado a `auth.uid()`.

## Relação com outras specs

- Modelo de dados: [`spec/features/supabase-schema/readme.md`](../supabase-schema/readme.md), [`spec/product/entities.md`](../../product/entities.md).
- Sessão e rotas na app: [`spec/features/authentication/readme.md`](../authentication/readme.md) (**AUTH-**).
- Infraestrutura e ambiente: **SPEC-11.x** em [`spec/product/spec.md`](../../product/spec.md).
- Prosa operacional (bootstrap, testes A/B): [`docs/security/rls.md`](../../../docs/security/rls.md).

## Implementação

| Artefato | Função |
|----------|--------|
| [`db/policies.sql`](../../../db/policies.sql) | Função `public.current_account_id()`, `ENABLE ROW LEVEL SECURITY`, políticas. |
| [`scripts/apply-db.cjs`](../../../scripts/apply-db.cjs) | `pnpm db:apply` executa `schema.sql` → `seed.sql` → `policies.sql`. |

## SEC-1. Função de contexto

**SEC-1.1.** `public.current_account_id()` → `uuid`: implementação **`LANGUAGE sql`**, **`STABLE`**, **`SECURITY DEFINER`**, `SET search_path = public`, corpo único que devolve `profiles.account_id` para `profiles.user_id = auth.uid()`, ou `NULL` se não existir linha.

**SEC-1.2.** Permissões: `REVOKE ALL ON FUNCTION public.current_account_id() FROM PUBLIC`; `GRANT EXECUTE ON FUNCTION public.current_account_id() TO authenticated`.

**SEC-1.3.** Não são criadas funções personalizadas no schema **`auth`** (reduz superfície e evita permissões especiais); o nome canónico no projeto é **`public.current_account_id()`**.

## SEC-2. Papéis e princípios

**SEC-2.1.** Pedidos com **anon key** (papel `anon`): **nenhuma** política que conceda leitura em tabelas de domínio nem em `belts` ⇒ **zero linhas** nessas tabelas.

**SEC-2.2.** Papel **`authenticated`**: políticas abaixo; **não** há política de `INSERT` em `accounts` nem em `profiles` (bootstrap da primeira conta + perfil via SQL com role **postgres** / manutenção documentada em [`docs/security/rls.md`](../../../docs/security/rls.md)).

**SEC-2.3.** Chave **`service_role`** contorna RLS no Supabase; uso **apenas** server-side (webhooks, jobs). **Proibido** expor no cliente — ver **SPEC-11.2**.

## SEC-3. Políticas por tabela

**SEC-3.1. `accounts`:** `SELECT`, `UPDATE`, `DELETE` apenas onde `id = public.current_account_id()`.

**SEC-3.2. `profiles`:** `SELECT` onde `account_id = public.current_account_id()` (colegas na mesma academia no futuro). `UPDATE` e `DELETE` apenas na própria linha: `user_id = auth.uid()` e `account_id = public.current_account_id()`.

**SEC-3.3. `students`, `plans`:** todas as operações permitidas pelo produto desde que `account_id = public.current_account_id()` em `USING` e `WITH CHECK`.

**SEC-3.4. `student_graduations`, `payments`:** `USING` / `WITH CHECK` via existência de `students` com `students.id` igual ao FK da linha e `students.account_id = public.current_account_id()`.

**SEC-3.5. `student_plans`:** além do aluno pertencer à conta, o `plan_id` referenciado tem de ser um `plans` com **`plans.account_id` igual a `students.account_id`** do mesmo `student_id` (impede referenciar plano de outra academia).

**SEC-3.6. `belts`:** apenas `SELECT` para `authenticated`; sem políticas para `anon`; sem `INSERT`/`UPDATE`/`DELETE` para roles de aplicação (alterações só migrações/seed com role privilegiada).

## SEC-4. Validação

**SEC-4.1.** Dois utilizadores **A** e **B** com contas distintas: **A** não obtém linhas de **B** em consultas via cliente com JWT de **A**.

**SEC-4.2.** Tentativa de `INSERT`/`UPDATE` com `account_id` ou FKs que “saltam” de conta é **rejeitada pelo Postgres**, não só pela UI.

## Manutenção

Novas tabelas com `account_id` ou FK para `students` devem ter políticas adicionadas no **mesmo** commit que o DDL (ou no ciclo imediato), e este readme + `docs/security/rls.md` atualizados.
