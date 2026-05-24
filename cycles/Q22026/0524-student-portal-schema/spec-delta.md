# spec-delta.md — Medium Cycle

## Cycle: 0524-student-portal-schema
## Status: PROPOSTA (não promovida)

> ⚠️ Este arquivo é uma PROPOSTA. Só é promovido para `spec/` via `/update-spec` após validação.

---

## Specs afetadas

### `spec/features/supabase-schema/readme.md`

**Seção:** Convenções / extensão `students` e `profiles`

**Mudança proposta:**

```diff
 | `student_status` | `active`, `inactive`, `trial`, `paused` |
+| `profile_role` | `professor`, `student` — papel de aplicação (**AUTH-8**, **SPT-2.2**); default `professor` |
 | Ciclo‑vida extra (`students`) | `archived_at`, `removed_at` (timestamptz nullable); opcional `lifecycle_updated_by` → `profiles` (**STU-10**, **STU-11**, **BR-9**). |
+| Portal Fase 1 (`students`) | `user_id uuid NULL` → `auth.users` (**SPT-2.3**); `portal_terms_accepted_at timestamptz NULL`; `guardian_email text NULL` (**SPT-2.4**). Unicidade: no máximo um `students` por `(account_id, user_id)` quando `user_id IS NOT NULL`. |
+| Portal Fase 1 (`profiles`) | `role public.profile_role NOT NULL DEFAULT 'professor'`. |
```

**Motivo:** Documentar DDL entregue neste cycle; alinha contrato **SPT-10.3** e decisão D2 da fundação.

---

### `spec/features/rls-security/readme.md`

**Seção:** SEC-1 (funções de contexto) + SEC-3.7 (implementação parcial Fase 1)

**Mudança proposta:**

```diff
 **SEC-1.3.** Não são criadas funções personalizadas no schema **`auth`** ...
+
+**SEC-1.4.** `public.current_profile_role()` → `public.profile_role`: implementação **`LANGUAGE sql`**, **`STABLE`**, **`SECURITY DEFINER`**, `SET search_path = public`, devolve `profiles.role` para `profiles.user_id = auth.uid()`, ou `NULL` se não existir linha. Permissões: `REVOKE ALL` de `PUBLIC`; `GRANT EXECUTE` a `authenticated`.
```

```diff
 **SEC-3.2. `profiles`:** `SELECT` onde `account_id = public.current_account_id()` ...
+
+> **Fase 1 portal:** quando `current_profile_role() = 'student'`, `SELECT` em `profiles` restringe-se a `user_id = auth.uid()`. `UPDATE`/`DELETE` permanecem só na própria linha; **`role` não pode ser alterado** via policy (`WITH CHECK`).
```

```diff
 **SEC-3.3. `students`, `plans`:** todas as operações permitidas ...
+
+> **Fase 1 portal:** quando `current_profile_role() = 'student'`, em `students`: `SELECT` e `UPDATE` apenas onde `user_id = auth.uid()`; sem `INSERT`/`DELETE`. Professor (`professor`) mantém CRUD por `account_id = current_account_id()` como antes.
```

```diff
-> DDL e políticas concretas entram nos cycles `student-portal-auth` (Fase 1) e seguintes. Até lá, **SEC-3.1–3.6** cobrem o schema actual.
+> **Fase 1 (`0524-student-portal-schema`):** políticas concretas para `profiles` e `students` acima. Políticas para `class_*`, `check_ins`, `products`, etc. entram nos cycles Fase 2–3 quando as tabelas existirem.
```

**Motivo:** Promover **SEC-3.7** de contrato futuro para comportamento implementado nas tabelas existentes.

---

### `spec/features/student-portal/readme.md`

**Seção:** SPT-10.3–10.4 e SPT-12 (estado Fase 1 schema)

**Mudança proposta:**

```diff
 **SPT-10.3.** Extensão de `students`: **`user_id`** nullable ...
+  Campos onboarding Fase 1 na mesma tabela: **`portal_terms_accepted_at`**, **`guardian_email`** (validação app **SPT-2.4**).
```

```diff
-| 1 | `student-portal-auth` | Auth, shell, onboarding, PIX layout | Pendente |
+| 1 schema | `0524-student-portal-schema` | DDL + RLS mínima Fase 1 | Implementado (validar) |
+| 1 app | `0524-student-portal-auth` | Auth, shell, onboarding, PIX layout | Em curso (Stage 2 aguardava schema) |
```

**Motivo:** Separar entrega DDL da entrega app; reflectir dependência resolvida.

---

### `docs/security/rls.md`

**Seção:** Lista de políticas + bootstrap aluno

**Mudança proposta:**

```diff
 | `profiles` | Ler todos os perfis da mesma conta; atualizar/apagar só o próprio (`auth.uid()`). |
+| `profiles` (role `student`) | Ler e atualizar **apenas** o próprio perfil; não alterar `role`. |
 | `students`, `plans` | CRUD só quando `account_id` é a conta do utilizador. |
+| `students` (role `student`) | Ler e atualizar **apenas** a linha com `students.user_id = auth.uid()` (onboarding); sem criar/apagar alunos. |
```

Adicionar subsecção **Bootstrap aluno (teste / provisionamento manual)** com passos SQL: criar user Auth → `profiles.role = 'student'` → `UPDATE students SET user_id = ...`.

**Motivo:** Procedimento operacional alinhado a **AUTH-8.3** e testes RLS.

---

## Checklist antes de promover

- [ ] Validação concluída (`validation.md` atualizado)
- [ ] Comportamento implementado (não intenção)
- [ ] Revisão humana confirmada
- [ ] Pronto para `/update-spec`
