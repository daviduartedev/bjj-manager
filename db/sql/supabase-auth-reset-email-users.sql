-- =====================================================
-- Supabase Auth , apagar utilizadores por email e criar novos (login email/senha)
-- =====================================================
-- Executar no **SQL Editor** do projeto Supabase, com role **postgres**.
-- Ajusta os emails e as senhas **no próprio editor** antes de correr (não commits).
--
-- Notas:
-- - JWTs antigos continuam válidos até expirarem (comportamento normal do Auth).
-- - Se `DELETE FROM auth.users` falhar por FK, apaga primeiro filhos deste bloco
--   alternativo (descomenta só se necessário):
--     DELETE FROM auth.identities WHERE user_id IN (
--       SELECT id FROM auth.users WHERE email IN ('...')
--     );
-- - `public.profiles` com FK a `auth.users` em CASCADE é apagado com o utilizador.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- 1) Apagar utilizadores pelos emails ----------
DELETE FROM auth.users
WHERE
  email IN (
    'maikon@aslam.com.br',
    'rls-validation-b@aslam.com.br'
  );

-- ---------- 2) Criar utilizador A (edita email + senha) ----------
DO $$
DECLARE
  v_user_id uuid := gen_random_uuid ();
  v_instance_id uuid := COALESCE(
    (
      SELECT
        instance_id
      FROM
        auth.users
      LIMIT
        1
    ),
    '00000000-0000-0000-0000-000000000000'::uuid
  );
  v_email text := 'maikon@aslam.com.br';
  v_password text := 'TROCAR_SENHA_FORTE_AQUI';
  v_encrypted_pw text := crypt(v_password, gen_salt ('bf'));
BEGIN
  IF v_password = 'TROCAR_SENHA_FORTE_AQUI' THEN
    RAISE EXCEPTION 'Define uma senha real em v_password antes de executar.';
  END IF;

  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES
    (
      v_user_id,
      v_instance_id,
      'authenticated',
      'authenticated',
      v_email,
      v_encrypted_pw,
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES
    (
      gen_random_uuid (),
      v_user_id,
      jsonb_build_object(
        'sub',
        v_user_id::text,
        'email',
        v_email
      ),
      'email',
      v_user_id::text,
      NOW(),
      NOW(),
      NOW()
    );
END
$$;

-- ---------- 3) Criar utilizador B (edita email + senha) ----------
DO $$
DECLARE
  v_user_id uuid := gen_random_uuid ();
  v_instance_id uuid := COALESCE(
    (
      SELECT
        instance_id
      FROM
        auth.users
      LIMIT
        1
    ),
    '00000000-0000-0000-0000-000000000000'::uuid
  );
  v_email text := 'rls-validation-b@aslam.com.br';
  v_password text := 'TROCAR_SENHA_FORTE_AQUI';
  v_encrypted_pw text := crypt(v_password, gen_salt ('bf'));
BEGIN
  IF v_password = 'TROCAR_SENHA_FORTE_AQUI' THEN
    RAISE EXCEPTION 'Define uma senha real em v_password antes de executar.';
  END IF;

  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES
    (
      v_user_id,
      v_instance_id,
      'authenticated',
      'authenticated',
      v_email,
      v_encrypted_pw,
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES
    (
      gen_random_uuid (),
      v_user_id,
      jsonb_build_object(
        'sub',
        v_user_id::text,
        'email',
        v_email
      ),
      'email',
      v_user_id::text,
      NOW(),
      NOW(),
      NOW()
    );
END
$$;

-- ---------- 4) Verificar ----------
SELECT
  id,
  email,
  created_at
FROM
  auth.users
WHERE
  email IN (
    'maikon@aslam.com.br',
    'rls-validation-b@aslam.com.br'
  );

-- ---------- 5) Depois disto ----------
-- Os UUIDs em auth.users mudaram: volta a criar `public.accounts` + `public.profiles`
-- (e dados de domínio) conforme docs/security/rls.md , ou corre `pnpm db:validate-rls`
-- com VALIDATION_TEST_PASSWORD para perfis/alunos de teste RLS.
