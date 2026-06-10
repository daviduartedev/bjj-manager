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

## Bootstrap aluno (teste RLS / provisionamento manual)

Para validar políticas **SEC-3.7** parcial (`profiles`, `students`):

1. Criar utilizador em Auth (email dedicado de teste, ex. conta `E2E_STUDENT_EMAIL` — **não** reutilizar o professor de produção).
2. Na **mesma** `account_id` da academia, criar perfil com `role = 'student'` (SQL Editor com role postgres / service role).
3. Ligar **um** registo `students` existente: `UPDATE students SET user_id = '<auth.users.id>' WHERE id = '<student_id>' AND account_id = '<account_id>'`.

Exemplo (substituir UUIDs; **não** correr em produção sem rever IDs):

```sql
-- Utilizador tem de existir em auth.users. Aluno e conta têm de ser da mesma academia.
UPDATE public.profiles
SET role = 'student'
WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid
  AND account_id = '00000000-0000-0000-0000-000000000002'::uuid;

UPDATE public.students
SET user_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE id = '00000000-0000-0000-0000-000000000003'::uuid
  AND account_id = '00000000-0000-0000-0000-000000000002'::uuid;
```

`pnpm db:validate-rls` com `E2E_STUDENT_EMAIL` cria fixture **só** com marcadores `RLS-V-*` na conta de teste A; não altera alunos reais.

## Bootstrap turma de teste (portal Fase 2)

Para testes manuais ou E2E de aulas/check-in (substituir UUIDs):

```sql
-- Pré-requisitos: account_id, profiles.id (professor), students.id (aluno)
INSERT INTO public.classes (account_id, name, kind, instructor_profile_id)
VALUES ('<account_id>', 'Turma teste', 'adult', '<professor_profile_id>')
RETURNING id;

-- Usar extract(isodow from current_date + 1) para day_of_week ISO (1=seg … 7=dom)
INSERT INTO public.class_recurring_schedules
  (account_id, class_id, day_of_week, start_time, end_time)
VALUES ('<account_id>', '<class_id>', 1, '19:00', '20:30');

INSERT INTO public.class_sessions
  (account_id, class_id, session_date, start_time, end_time)
VALUES ('<account_id>', '<class_id>', current_date + 1, '19:00', '20:30');

INSERT INTO public.student_class_enrollments (account_id, student_id, class_id)
VALUES ('<account_id>', '<student_id>', '<class_id>');
```

`pnpm db:validate-rls` cria automaticamente fixture `RLS-V-CLASS` quando `E2E_STUDENT_EMAIL` está definido.

Funções auxiliares em `db/policies.sql`:

- `public.current_student_id()` — devolve `students.id` para `auth.uid()` na conta actual (**SEC-3.7** Fase 2).
- `public.expire_stale_reservations(account_id)` — expira reservas `pending_payment` vencidas e repõe stock (**SPT-8.4**).
- `public.reserve_product_variant(variant_id)` — reserva atómica para aluno autenticado (**SPT-8.3**).

## Bootstrap produto portal (portal Fase 3)

Para testes manuais de loja/reservas (substituir UUIDs):

```sql
-- Pré-requisitos: account_id, students.id (aluno com user_id ligado)
INSERT INTO public.products (account_id, code, name, active, portal_visible, description)
VALUES ('<account_id>', 'kimono-teste', 'Kimono teste', true, true, 'Fixture manual')
RETURNING id;

INSERT INTO public.product_variants (product_id, size_label, stock_quantity, price_cents)
VALUES ('<product_id>', 'M', 3, 15000);
```

O aluno reserva via RPC `select * from public.reserve_product_variant('<variant_id>');` (sessão JWT `student`) ou pela UI `/portal/loja` (Stage 2).

`pnpm db:validate-rls` cria fixture `RLS-V-SHOP-PRODUCT` quando migration **012** aplicada e `E2E_STUDENT_EMAIL` definido.

## Lista de políticas (resumo em prosa)

| Tabela | Comportamento para `authenticated` |
|--------|--------------------------------------|
| `accounts` | Só a linha cuja `id` é a conta do perfil atual: ler, atualizar, apagar. |
| `profiles` | **Professor:** ler todos os perfis da mesma conta; atualizar/apagar só o próprio (`auth.uid()`). **Student:** ler/atualizar **apenas** o próprio perfil; `role` imutável via RLS. |
| `students`, `plans` | **Professor:** CRUD quando `account_id` é a conta do utilizador. **Student:** em `students`, ler/atualizar **apenas** a linha com `user_id = auth.uid()` (onboarding); sem criar/apagar alunos. |
| `student_graduations`, `payments` | CRUD só quando o `student_id` aponta para aluno dessa conta. |
| `student_plans` | CRUD só quando o aluno é da conta **e** o plano escolhido pertence à **mesma** conta que o aluno. |
| `belts` | Só leitura. |
| `document_templates` | Leitura quando `account_id IS NULL` (templates globais) ou `account_id = current_account_id()`. Escrita apenas para a conta. |
| `generated_documents` | CRUD só quando `account_id = current_account_id()`. |
| `generated_document_deliveries` | Via parent: o `document_id` tem de pertencer à conta. |
| `document_sequences` | CRUD só quando `account_id = current_account_id()`. |
| `lesson_plans` | CRUD só quando `account_id = current_account_id()`. |
| `lesson_plan_revisions`, `lesson_plan_attachments` | Via parent: o `lesson_plan_id` tem de pertencer à conta. |
| **Portal Fase 2** | |
| `classes` | **Professor:** CRUD na conta. **Student:** `SELECT` turmas em que está inscrito. |
| `class_recurring_schedules`, `class_sessions` | **Professor:** CRUD na conta. **Student:** `SELECT` via inscrição na turma. |
| `student_class_enrollments` | **Professor:** CRUD na conta. **Student:** `SELECT` inscrições próprias. |
| `check_ins` | **Professor:** CRUD na conta. **Student:** `SELECT`/`INSERT`/`DELETE` só na própria linha e turma inscrita. |
| `attendances` | **Professor:** CRUD na conta. **Student:** `SELECT` nas próprias presenças (**SPT-13**). |
| **Portal Fase 3** | |
| `products` | **Professor:** CRUD na conta. **Student:** `SELECT` produtos `active` + `portal_visible`. |
| `product_variants` | **Professor:** CRUD via produto da conta. **Student:** `SELECT` variantes com stock > 0 e preço definido em produto portal. |
| `reservations` | **Professor:** CRUD na conta. **Student:** `SELECT` próprias reservas; criação via `reserve_product_variant()` (sem INSERT directo). |
| `accounts` (PIX) | **Professor:** `UPDATE` (incl. `pix_*`). **Student:** `SELECT` apenas; sem alterar chave PIX. |
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

Na raiz do repositório, com `.env.local` preenchido (`DATABASE_URL`, chaves Supabase e **`VALIDATION_TEST_PASSWORD`** para login JWT): **`pnpm db:validate-rls`** , confirma `anon` sem linhas em `students`/`belts`, isolamento para contas A/B de teste, rejeição de `INSERT` com `account_id` alheio, e (com **`E2E_STUDENT_EMAIL`**) isolamento do papel `student`.

## Referências

- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- Ciclo: `cycles/Q22026/05-0430-rls-and-security/`
