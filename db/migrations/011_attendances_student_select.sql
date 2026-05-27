-- Stage 3: aluno pode ler próprios attendances (SPT-13, SEC-3.7)

DROP POLICY IF EXISTS attendances_student_select ON public.attendances;

CREATE POLICY attendances_student_select ON public.attendances FOR SELECT TO authenticated USING (
  public.current_profile_role () = 'student'::public.profile_role
  AND student_id = public.current_student_id ()
);
