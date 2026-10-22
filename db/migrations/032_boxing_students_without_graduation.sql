-- #29 / expansão: ausência real de graduação em Boxe; JJ mantém campos obrigatórios.
BEGIN;
ALTER TABLE public.students ALTER COLUMN current_belt_id DROP NOT NULL;
ALTER TABLE public.students ALTER COLUMN current_degree DROP NOT NULL;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS weight_kg numeric(5,1) NULL;
DO $$ BEGIN
  ALTER TABLE public.students ADD CONSTRAINT students_weight_kg_check CHECK (weight_kg IS NULL OR weight_kg BETWEEN 20 AND 250);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
COMMENT ON COLUMN public.students.weight_kg IS 'Peso da ficha, independente de graduação; Boxe não cria evento esportivo para guardar peso.';

-- Invoker: respeita a visibilidade do tenant. Valores de outra conta não são expostos.
CREATE OR REPLACE FUNCTION public.guard_student_modality () RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE v_modality text; v_today date;
BEGIN
  SELECT a.modality INTO v_modality FROM public.accounts a WHERE a.id = NEW.account_id;
  IF v_modality IS NULL THEN
    RAISE EXCEPTION 'student unavailable' USING ERRCODE = '42501';
  END IF;
  IF v_modality = 'boxing' THEN
    IF NEW.current_belt_id IS NOT NULL OR NEW.current_degree IS NOT NULL THEN
      RAISE EXCEPTION 'boxing has no graduation' USING ERRCODE = '23514';
    END IF;
    v_today := (pg_catalog.now() AT TIME ZONE 'America/Sao_Paulo')::date;
    IF NEW.kind <> 'adult'::public.student_kind OR NEW.birth_date IS NULL
       OR NEW.birth_date > (v_today - interval '18 years')::date THEN
      RAISE EXCEPTION 'boxing requires adult aged eighteen' USING ERRCODE = '23514';
    END IF;
  ELSIF NEW.current_belt_id IS NULL OR NEW.current_degree IS NULL THEN
    RAISE EXCEPTION 'graduation required for graded sport' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_student_modality () FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS students_guard_modality ON public.students;
CREATE TRIGGER students_guard_modality BEFORE INSERT OR UPDATE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.guard_student_modality ();

CREATE OR REPLACE FUNCTION public.guard_graduation_modality () RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE v_modality text;
BEGIN
  SELECT a.modality INTO v_modality FROM public.students s JOIN public.accounts a ON a.id = s.account_id WHERE s.id = NEW.student_id;
  IF v_modality IS NULL THEN
    RAISE EXCEPTION 'student unavailable' USING ERRCODE = '42501';
  END IF;
  IF v_modality = 'boxing' THEN
    RAISE EXCEPTION 'boxing has no graduation' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_graduation_modality () FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS student_graduations_guard_modality ON public.student_graduations;
CREATE TRIGGER student_graduations_guard_modality BEFORE INSERT OR UPDATE ON public.student_graduations
FOR EACH ROW EXECUTE FUNCTION public.guard_graduation_modality ();

CREATE OR REPLACE FUNCTION public.guard_student_plan_modality () RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE v_modality text; v_plan_kind public.plan_kind;
BEGIN
  SELECT a.modality, p.kind INTO v_modality, v_plan_kind
  FROM public.students s JOIN public.accounts a ON a.id = s.account_id
  JOIN public.plans p ON p.id = NEW.plan_id AND p.account_id = s.account_id WHERE s.id = NEW.student_id;
  IF v_modality IS NULL THEN
    RAISE EXCEPTION 'student or plan unavailable' USING ERRCODE = '42501';
  END IF;
  IF v_modality = 'boxing' AND v_plan_kind <> 'adult'::public.plan_kind THEN
    RAISE EXCEPTION 'boxing requires adult plan' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_student_plan_modality () FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS student_plans_guard_modality ON public.student_plans;
CREATE TRIGGER student_plans_guard_modality BEFORE INSERT OR UPDATE ON public.student_plans
FOR EACH ROW EXECUTE FUNCTION public.guard_student_plan_modality ();
COMMIT;
