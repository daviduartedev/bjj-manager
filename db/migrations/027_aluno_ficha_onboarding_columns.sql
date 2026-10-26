-- Aluno só altera o aceite do portal e o e-mail do responsável na própria ficha.
-- O gatilho corre em todo UPDATE, mas só recusa quando o ator é aluno
-- (can_use_portal_self). Professor passa sem alteração.
-- updated_at pode mudar junto com os dois campos. Qualquer outra coluna
-- recusa o UPDATE inteiro. Sem policy de INSERT ou DELETE para o aluno.
-- Sem alteração de dados, enum ou tabela.
-- Mesma definição que db/policies.sql.

CREATE OR REPLACE FUNCTION public.guard_student_self_ficha_columns () RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  old_rest jsonb;
  new_rest jsonb;
BEGIN
  IF NOT public.can_use_portal_self () THEN
    RETURN NEW;
  END IF;

  old_rest := to_jsonb (OLD) - ARRAY[
    'portal_terms_accepted_at',
    'guardian_email',
    'updated_at'
  ];
  new_rest := to_jsonb (NEW) - ARRAY[
    'portal_terms_accepted_at',
    'guardian_email',
    'updated_at'
  ];

  IF old_rest IS DISTINCT FROM new_rest THEN
    RAISE EXCEPTION 'Aluno só pode alterar o aceite do portal e o e-mail do responsável.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_student_self_ficha_columns () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.guard_student_self_ficha_columns () TO authenticated;

COMMENT ON FUNCTION public.guard_student_self_ficha_columns () IS 'On a student self-update of students, allows only portal_terms_accepted_at, guardian_email, and updated_at; other roles are unchanged';

DROP TRIGGER IF EXISTS students_guard_self_ficha_columns ON public.students;

CREATE TRIGGER students_guard_self_ficha_columns
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.guard_student_self_ficha_columns ();
