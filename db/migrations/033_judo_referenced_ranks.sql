-- #30: catálogo fechado referenciado, sem reescrever IDs/histórico de Jiu-Jitsu.
BEGIN;
CREATE TABLE IF NOT EXISTS public.graduation_references (
  id text PRIMARY KEY,
  modality text NOT NULL CHECK (modality IN ('judo','muay_thai')),
  title text NOT NULL,
  source_url text NOT NULL,
  consulted_at date NOT NULL,
  limitation text NOT NULL
);
CREATE TABLE IF NOT EXISTS public.graduation_ranks (
  reference_id text NOT NULL REFERENCES public.graduation_references(id) ON DELETE RESTRICT,
  code text NOT NULL,
  ordinal smallint NOT NULL CHECK (ordinal >= 0),
  label text NOT NULL,
  PRIMARY KEY (reference_id, code),
  UNIQUE (reference_id, ordinal)
);
INSERT INTO public.graduation_references(id,modality,title,source_url,consulted_at,limitation) VALUES
('cbj-2023','judo','CBJ — Regulamento para exame e outorga de faixas e graus 2023',
 'https://cbj.com.br/public/uploads/regulamentos_esportivos/arquivo_cbj_180223310123.pdf','2026-10-22',
 'Referência CBJ 2023 adotada pelo Casca. Não certifica homologação federativa nem conformidade com comunicados posteriores.') ON CONFLICT DO NOTHING;
INSERT INTO public.graduation_ranks(reference_id,code,ordinal,label) VALUES
('cbj-2023','beginner',0,'Iniciante — Branca'),
('cbj-2023','kyu-11',1,'11º kyū — Branca e cinza'),
('cbj-2023','kyu-10',2,'10º kyū — Cinza'),
('cbj-2023','kyu-9',3,'9º kyū — Cinza e azul'),
('cbj-2023','kyu-8',4,'8º kyū — Azul'),
('cbj-2023','kyu-7',5,'7º kyū — Azul e amarela'),
('cbj-2023','kyu-6',6,'6º kyū — Amarela'),
('cbj-2023','kyu-5',7,'5º kyū — Amarela e laranja'),
('cbj-2023','kyu-4',8,'4º kyū — Laranja'),
('cbj-2023','kyu-3',9,'3º kyū — Verde'),
('cbj-2023','kyu-2',10,'2º kyū — Roxa'),
('cbj-2023','kyu-1',11,'1º kyū — Marrom'),
('cbj-2023','dan-1',12,'1º dan — Preta'),
('cbj-2023','dan-2',13,'2º dan — Preta'),
('cbj-2023','dan-3',14,'3º dan — Preta'),
('cbj-2023','dan-4',15,'4º dan — Preta'),
('cbj-2023','dan-5',16,'5º dan — Preta'),
('cbj-2023','dan-6',17,'6º dan — Vermelha e branca'),
('cbj-2023','dan-7',18,'7º dan — Vermelha e branca'),
('cbj-2023','dan-8',19,'8º dan — Vermelha e branca'),
('cbj-2023','dan-9',20,'9º dan — Vermelha'),
('cbj-2023','dan-10',21,'10º dan — Vermelha') ON CONFLICT DO NOTHING;
ALTER TABLE public.graduation_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graduation_ranks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.graduation_references, public.graduation_ranks FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.graduation_references, public.graduation_ranks TO authenticated;
DROP POLICY IF EXISTS graduation_references_read ON public.graduation_references;
CREATE POLICY graduation_references_read ON public.graduation_references FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS graduation_ranks_read ON public.graduation_ranks;
CREATE POLICY graduation_ranks_read ON public.graduation_ranks FOR SELECT TO authenticated USING (true);

ALTER TABLE public.students ADD COLUMN IF NOT EXISTS graduation_reference_id text NULL;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS current_rank_code text NULL;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS current_rank_date date NULL;
DO $$ BEGIN
  ALTER TABLE public.students ADD CONSTRAINT students_referenced_rank_fkey
    FOREIGN KEY (graduation_reference_id,current_rank_code) REFERENCES public.graduation_ranks(reference_id,code) ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
COMMENT ON COLUMN public.students.current_rank_date IS 'Data civil da graduação atual referenciada. NULL explícito = data preexistente desconhecida; nunca inferir da matrícula.';

CREATE OR REPLACE FUNCTION public.guard_student_modality () RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE v_modality text; v_today date;
BEGIN
  SELECT a.modality INTO v_modality FROM public.accounts a WHERE a.id = NEW.account_id;
  IF v_modality IS NULL THEN RAISE EXCEPTION 'student unavailable' USING ERRCODE = '42501'; END IF;
  v_today := (pg_catalog.now() AT TIME ZONE 'America/Sao_Paulo')::date;
  IF v_modality <> 'jiu_jitsu' AND (NEW.kind <> 'adult'::public.student_kind OR NEW.birth_date IS NULL
     OR NEW.birth_date > (v_today - interval '18 years')::date) THEN
    RAISE EXCEPTION 'modality requires adult aged eighteen' USING ERRCODE = '23514';
  END IF;
  IF v_modality = 'judo' THEN
    IF NEW.current_belt_id IS NOT NULL OR NEW.current_degree IS NOT NULL
       OR NEW.graduation_reference_id IS DISTINCT FROM 'cbj-2023' OR NEW.current_rank_code IS NULL
       OR NOT EXISTS (SELECT 1 FROM public.graduation_ranks r JOIN public.graduation_references ref ON ref.id=r.reference_id
                      WHERE r.reference_id=NEW.graduation_reference_id AND r.code=NEW.current_rank_code AND ref.modality=v_modality)
       OR NEW.current_rank_date > v_today THEN
      RAISE EXCEPTION 'invalid referenced graduation' USING ERRCODE = '23514';
    END IF;
  ELSE
    IF NEW.graduation_reference_id IS NOT NULL OR NEW.current_rank_code IS NOT NULL OR NEW.current_rank_date IS NOT NULL THEN
      RAISE EXCEPTION 'foreign referenced graduation' USING ERRCODE = '23514';
    END IF;
    IF v_modality = 'boxing' THEN
      IF NEW.current_belt_id IS NOT NULL OR NEW.current_degree IS NOT NULL THEN
        RAISE EXCEPTION 'boxing has no graduation' USING ERRCODE = '23514';
      END IF;
    ELSIF NEW.current_belt_id IS NULL OR NEW.current_degree IS NULL THEN
      RAISE EXCEPTION 'graduation required for graded sport' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_student_modality () FROM PUBLIC, anon, authenticated;

-- Histórico legado recebe apenas eventos de JJ. Judô terá eventos próprios em #32.
CREATE OR REPLACE FUNCTION public.guard_graduation_modality () RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE v_modality text;
BEGIN
  SELECT a.modality INTO v_modality FROM public.students s JOIN public.accounts a ON a.id = s.account_id WHERE s.id = NEW.student_id;
  IF v_modality IS NULL THEN RAISE EXCEPTION 'student unavailable' USING ERRCODE = '42501'; END IF;
  IF v_modality <> 'jiu_jitsu' THEN RAISE EXCEPTION 'legacy graduation requires jiu jitsu' USING ERRCODE = '23514'; END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_graduation_modality () FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.guard_student_plan_modality () RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE v_modality text; v_plan_kind public.plan_kind;
BEGIN
  SELECT a.modality, p.kind INTO v_modality, v_plan_kind
  FROM public.students s JOIN public.accounts a ON a.id = s.account_id
  JOIN public.plans p ON p.id = NEW.plan_id AND p.account_id = s.account_id WHERE s.id = NEW.student_id;
  IF v_modality IS NULL THEN RAISE EXCEPTION 'student or plan unavailable' USING ERRCODE = '42501'; END IF;
  IF v_modality <> 'jiu_jitsu' AND v_plan_kind <> 'adult'::public.plan_kind THEN
    RAISE EXCEPTION 'modality requires adult plan' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_student_plan_modality () FROM PUBLIC, anon, authenticated;
COMMIT;
