-- Storage RLS policies para os buckets privados usados pelo app.
-- Aplicar UMA VEZ no SQL Editor do Supabase (idempotente, pode rodar de novo sem efeito).
--
-- Buckets cobertos (todos privados, criados no painel Supabase):
--   * documents-dev                  -> PDFs gerados (recibos, certificados, ...)
--   * lesson-plans-attachments-dev   -> anexos dos planos pedagógicos
--   * branding-dev                   -> assinatura/logo da academia
--
-- Convenção de path em todos eles: o primeiro segmento é o account_id.
--   ex.: <account_id>/<document_id>/v1.pdf
--   ex.: <account_id>/signature.png
--
-- Mecanismo: storage.objects tem RLS ligado por defeito. Sem policy, qualquer
-- INSERT/SELECT/UPDATE/DELETE é negado. Estas policies permitem operações
-- apenas quando o primeiro segmento do path (storage.foldername(name)[1])
-- bate com public.current_account_id() do utilizador autenticado.
--
-- IMPORTANTE: public.current_account_id() vem de db/policies.sql e deriva
-- de profiles.user_id = auth.uid(). Se não estiver criada, aplicar policies.sql
-- primeiro.

-- Reaplicação limpa
drop policy if exists "documents read own account"   on storage.objects;
drop policy if exists "documents insert own account" on storage.objects;
drop policy if exists "documents update own account" on storage.objects;
drop policy if exists "documents delete own account" on storage.objects;

drop policy if exists "lesson-plans read own account"   on storage.objects;
drop policy if exists "lesson-plans insert own account" on storage.objects;
drop policy if exists "lesson-plans update own account" on storage.objects;
drop policy if exists "lesson-plans delete own account" on storage.objects;

drop policy if exists "branding read own account"   on storage.objects;
drop policy if exists "branding insert own account" on storage.objects;
drop policy if exists "branding update own account" on storage.objects;
drop policy if exists "branding delete own account" on storage.objects;

-- documents-dev
create policy "documents read own account" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'documents-dev'
    and (storage.foldername(name))[1] = public.current_account_id()::text
  );

create policy "documents insert own account" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'documents-dev'
    and (storage.foldername(name))[1] = public.current_account_id()::text
  );

create policy "documents update own account" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'documents-dev'
    and (storage.foldername(name))[1] = public.current_account_id()::text
  )
  with check (
    bucket_id = 'documents-dev'
    and (storage.foldername(name))[1] = public.current_account_id()::text
  );

create policy "documents delete own account" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'documents-dev'
    and (storage.foldername(name))[1] = public.current_account_id()::text
  );

-- lesson-plans-attachments-dev
create policy "lesson-plans read own account" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'lesson-plans-attachments-dev'
    and (storage.foldername(name))[1] = public.current_account_id()::text
  );

create policy "lesson-plans insert own account" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'lesson-plans-attachments-dev'
    and (storage.foldername(name))[1] = public.current_account_id()::text
  );

create policy "lesson-plans update own account" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'lesson-plans-attachments-dev'
    and (storage.foldername(name))[1] = public.current_account_id()::text
  )
  with check (
    bucket_id = 'lesson-plans-attachments-dev'
    and (storage.foldername(name))[1] = public.current_account_id()::text
  );

create policy "lesson-plans delete own account" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'lesson-plans-attachments-dev'
    and (storage.foldername(name))[1] = public.current_account_id()::text
  );

-- branding-dev
create policy "branding read own account" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'branding-dev'
    and (storage.foldername(name))[1] = public.current_account_id()::text
  );

create policy "branding insert own account" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'branding-dev'
    and (storage.foldername(name))[1] = public.current_account_id()::text
  );

create policy "branding update own account" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'branding-dev'
    and (storage.foldername(name))[1] = public.current_account_id()::text
  )
  with check (
    bucket_id = 'branding-dev'
    and (storage.foldername(name))[1] = public.current_account_id()::text
  );

create policy "branding delete own account" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'branding-dev'
    and (storage.foldername(name))[1] = public.current_account_id()::text
  );

-- Verificação rápida (deve listar 12 linhas: 3 buckets x 4 ops)
-- select polname from pg_policies where schemaname = 'storage' and tablename = 'objects'
--   and polname like '%own account%';
