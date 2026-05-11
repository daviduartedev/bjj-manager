# Row Level Security (RLS) , Casca - Gestão de Academias de BJJ

Documento operacional: o que está ligado no Postgres, como arrancar o primeiro professor em **produção**, e como validar isolamento. O contrato normativo está em [`spec/features/rls-security/readme.md`](../../spec/features/rls-security/readme.md).

## Princípios

1. **Multi-tenant por `account_id`:** tudo o que é da academia filtra por `public.current_account_id()`, derivado de `profiles.user_id = auth.uid()`.
2. **Anon não vê dados:** o papel `anon` não tem políticas em `belts` nem em tabelas de domínio ⇒ zero linhas com a anon key.
3. **Escrita no catálogo de faixas:** professores não alteram `belts` pela API pública; só leitura quando autenticados.
4. **Sem segredos no git:** passwords de utilizadores existem apenas no Supabase Auth e gestores seguros; este ficheiro **não** contém passwords.

## O que aplicar

Ordem recomendada (alinhada a `pnpm db:apply`):

1. [`db/schema.sql`](../../db/schema.sql)
2. [`db/seed.sql`](../../db/seed.sql) , em **produção**, avaliar se o seed de demo deve correr ou ser adaptado (conta fixa de dev pode não ser desejável).
3. [`db/policies.sql`](../../db/policies.sql)

`public.current_account_id()` está definida em `policies.sql`: **não** duplicar definições noutros ficheiros.

## Bootstrap do primeiro professor (produção)

Utilizador de referência: **`maikon@aslam.com.br`**.

- **Alternativa só SQL** (apagar por email + criar com bcrypt): modelo em [`db/sql/supabase-auth-reset-email-users.sql`](../../db/sql/supabase-auth-reset-email-users.sql) , edita senhas **no editor** antes de correr; depois recria `accounts`/`profiles` porque os UUIDs de Auth mudam.

1. **Authentication → Users → Add user** no dashboard Supabase: criar o utilizador com **password forte** (pode ser temporária); **alterar a password** após o primeiro login.
2. Obter o **`id`** (UUID) desse utilizador em `auth.users` (UI ou `select id, email from auth.users where email = 'maikon@aslam.com.br'` com role privilegiada).
3. No **SQL Editor**, com permissões de administração da base, criar a academia e o perfil. O editor **não** aceita placeholders tipo `:user_id` , usa por exemplo:

```sql
-- Ajusta email, nome da academia e display_name. O utilizador tem de existir em auth.users.
DO $$
DECLARE
  v_user_id uuid;
  v_account_id uuid;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'maikon@aslam.com.br'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilizador não encontrado em auth.users , cria em Auth primeiro.';
  END IF;

  INSERT INTO public.accounts (name)
  VALUES ('Nome da academia')
  RETURNING id INTO v_account_id;

  INSERT INTO public.profiles (user_id, account_id, display_name)
  VALUES (v_user_id, v_account_id, 'Maikon');
END $$;
```

Sem estes passos, `current_account_id()` é `NULL` e o utilizador autenticado não vê dados de domínio.

Com a aplicação em execução, o professor abre **`/login`**, entra com o e-mail e a senha definidos no Supabase Auth, e a sessão leva-o ao **`/painel`** (área autenticada; **AUTH-** / **SHELL-** em `spec/features/authentication/readme.md` e `spec/features/app-shell/readme.md`).

## Segundo utilizador (teste de isolamento)

1. Criar outro utilizador em Auth (email distinto).
2. Repetir `insert` em `accounts` + `profiles` para uma **segunda** conta.
3. Inserir um aluno de teste em cada conta (via Table Editor como cada utilizador, ou SQL assumindo identidade , ver documentação Supabase para “test as user”).
4. Confirmar: sessão **A** não lista alunos/planos/pagamentos da conta **B**.

## Lista de políticas (resumo em prosa)

| Tabela | Comportamento para `authenticated` |
|--------|--------------------------------------|
| `accounts` | Só a linha cuja `id` é a conta do perfil atual: ler, atualizar, apagar. |
| `profiles` | Ler todos os perfis da mesma conta; atualizar/apagar só o próprio (`auth.uid()`). |
| `students`, `plans` | CRUD só quando `account_id` é a conta do utilizador. |
| `student_graduations`, `payments` | CRUD só quando o `student_id` aponta para aluno dessa conta. |
| `student_plans` | CRUD só quando o aluno é da conta **e** o plano escolhido pertence à **mesma** conta que o aluno. |
| `belts` | Só leitura. |
| `document_templates` | Leitura quando `account_id IS NULL` (templates globais) ou `account_id = current_account_id()`. Escrita apenas para a conta. |
| `generated_documents` | CRUD só quando `account_id = current_account_id()`. |
| `generated_document_deliveries` | Via parent: o `document_id` tem de pertencer à conta. |
| `document_sequences` | CRUD só quando `account_id = current_account_id()`. |
| `lesson_plans` | CRUD só quando `account_id = current_account_id()`. |
| `lesson_plan_revisions`, `lesson_plan_attachments` | Via parent: o `lesson_plan_id` tem de pertencer à conta. |
| `anon` | Sem acesso às tabelas acima (RLS sem política ⇒ nega). |

Detalhe exato: ver [`db/policies.sql`](../../db/policies.sql).

## Buckets Supabase Storage (DOC- / PED-)

Criar manualmente no painel Supabase **com `Public bucket = OFF`**:

- `documents-{env}` — PDFs/HTMLs gerados (`generated_documents.pdf_path`, `html_path`).
- `lesson-plans-attachments-{env}` — anexos de planos pedagógicos.
- `branding-{env}` — logos e assinaturas (referenciados por `accounts.signature_url` / `accounts.logo_url`).

Após criar, **aplicar policies de Storage** (sem elas, `INSERT` em bucket privado é negado mesmo para utilizadores autenticados): correr o SQL em [`db/sql/storage-policies.sql`](../../db/sql/storage-policies.sql) no SQL Editor. As policies permitem CRUD apenas quando o primeiro segmento do path (`storage.foldername(name)[1]`) bate com `public.current_account_id()`.

Acesso é sempre via **signed URL** (`createSignedUrl`) gerada por Server Action com filtro de `account_id`. Caminhos seguem o padrão `account_id/...` para reforço defensivo.

## Service role

A **service_role key** contorna RLS. Usar só em **servidor** (Edge Functions, scripts internos, webhooks). Nunca embutir em builds de browser ou apps móveis expostas.

## Verificação automatizada

Na raiz do repositório, com `.env.local` preenchido (`DATABASE_URL`, chaves Supabase e **`VALIDATION_TEST_PASSWORD`** para login JWT): **`pnpm db:validate-rls`** , confirma `anon` sem linhas em `students`/`belts`, isolamento para `maikon@aslam.com.br` vs `rls-validation-b@aslam.com.br`, e rejeição de `INSERT` com `account_id` alheio.

## Referências

- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- Ciclo: `cycles/Q22026/05-0430-rls-and-security/`
