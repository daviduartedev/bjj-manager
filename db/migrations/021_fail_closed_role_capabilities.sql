-- Papel ausente, nulo ou desconhecido não concede capacidade.
-- current_profile_role devolve o papel do perfil ou NULL (sem default professor).
-- Sem alteração de enum, sem tabela nova, sem backfill.
-- Mesmas definições que db/policies.sql.

CREATE OR REPLACE FUNCTION public.current_profile_role () RETURNS public.profile_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.role
  FROM public.profiles p
  WHERE p.user_id = auth.uid ()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.current_profile_role () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.current_profile_role () TO authenticated;

COMMENT ON FUNCTION public.current_profile_role () IS 'Returns profiles.role for auth.uid(), or NULL when the profile is missing; SEC-1.4 in spec/features/rls-security/readme.md';

CREATE OR REPLACE FUNCTION public.can_manage_finance () RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role () = 'professor'::public.profile_role, false);
$$;

REVOKE ALL ON FUNCTION public.can_manage_finance () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_manage_finance () TO authenticated;

COMMENT ON FUNCTION public.can_manage_finance () IS 'True only for professor; false when the role is missing';

CREATE OR REPLACE FUNCTION public.can_manage_students () RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role () = 'professor'::public.profile_role, false);
$$;

REVOKE ALL ON FUNCTION public.can_manage_students () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_manage_students () TO authenticated;

COMMENT ON FUNCTION public.can_manage_students () IS 'True only for professor; false when the role is missing';

CREATE OR REPLACE FUNCTION public.can_manage_graduations () RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role () = 'professor'::public.profile_role, false);
$$;

REVOKE ALL ON FUNCTION public.can_manage_graduations () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_manage_graduations () TO authenticated;

COMMENT ON FUNCTION public.can_manage_graduations () IS 'True only for professor; false when the role is missing';

CREATE OR REPLACE FUNCTION public.can_manage_classes () RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role () = 'professor'::public.profile_role, false);
$$;

REVOKE ALL ON FUNCTION public.can_manage_classes () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_manage_classes () TO authenticated;

COMMENT ON FUNCTION public.can_manage_classes () IS 'True only for professor; false when the role is missing';

CREATE OR REPLACE FUNCTION public.can_manage_documents () RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role () = 'professor'::public.profile_role, false);
$$;

REVOKE ALL ON FUNCTION public.can_manage_documents () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_manage_documents () TO authenticated;

COMMENT ON FUNCTION public.can_manage_documents () IS 'True only for professor; false when the role is missing';

CREATE OR REPLACE FUNCTION public.can_manage_commercial_plans () RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role () = 'professor'::public.profile_role, false);
$$;

REVOKE ALL ON FUNCTION public.can_manage_commercial_plans () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_manage_commercial_plans () TO authenticated;

COMMENT ON FUNCTION public.can_manage_commercial_plans () IS 'True only for professor; false when the role is missing';

CREATE OR REPLACE FUNCTION public.can_manage_lesson_plans () RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role () = 'professor'::public.profile_role, false);
$$;

REVOKE ALL ON FUNCTION public.can_manage_lesson_plans () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_manage_lesson_plans () TO authenticated;

COMMENT ON FUNCTION public.can_manage_lesson_plans () IS 'True only for professor; false when the role is missing. Plano de aula is its own capability';

CREATE OR REPLACE FUNCTION public.can_manage_account_settings () RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role () = 'professor'::public.profile_role, false);
$$;

REVOKE ALL ON FUNCTION public.can_manage_account_settings () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_manage_account_settings () TO authenticated;

COMMENT ON FUNCTION public.can_manage_account_settings () IS 'True only for professor; false when the role is missing';

CREATE OR REPLACE FUNCTION public.can_delete_account () RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role () = 'professor'::public.profile_role, false);
$$;

REVOKE ALL ON FUNCTION public.can_delete_account () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_delete_account () TO authenticated;

COMMENT ON FUNCTION public.can_delete_account () IS 'True only for professor; false when the role is missing';

CREATE OR REPLACE FUNCTION public.can_use_portal_self () RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role () = 'student'::public.profile_role, false);
$$;

REVOKE ALL ON FUNCTION public.can_use_portal_self () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_use_portal_self () TO authenticated;

COMMENT ON FUNCTION public.can_use_portal_self () IS 'True only for student; false when the role is missing';
