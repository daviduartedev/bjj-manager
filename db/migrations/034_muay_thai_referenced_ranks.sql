-- #31: tabela CBMTT adotada em 22/10/2026, 19 khan; sem equivalência IFMA.
BEGIN;
INSERT INTO public.graduation_references(id,modality,title,source_url,consulted_at,limitation) VALUES
('cbmtt-19-khan','muay_thai','CBMTT — Tabela de graduação de 19 khan',
 'https://www.cbmtt.org.br/images/graduacoes-cbmtt.jpg','2026-10-22',
 'A tabela consultada não informa edição, idades ou carências. Não declara equivalência com os 15 khan IFMA 2025. O registro no Casca não certifica homologação federativa. Títulos esportivos não concedem permissões de acesso.') ON CONFLICT DO NOTHING;
INSERT INTO public.graduation_ranks(reference_id,code,ordinal,label) VALUES
('cbmtt-19-khan','khan-1',0,'1º khan — Branco (iniciante)'),
('cbmtt-19-khan','khan-2',1,'2º khan — Amarelo'),
('cbmtt-19-khan','khan-3',2,'3º khan — Amarelo e branco'),
('cbmtt-19-khan','khan-4',3,'4º khan — Verde'),
('cbmtt-19-khan','khan-5',4,'5º khan — Verde e branco'),
('cbmtt-19-khan','khan-6',5,'6º khan — Azul'),
('cbmtt-19-khan','khan-7',6,'7º khan — Azul e branco'),
('cbmtt-19-khan','khan-8',7,'8º khan — Marrom'),
('cbmtt-19-khan','khan-9',8,'9º khan — Marrom e branco'),
('cbmtt-19-khan','khan-10',9,'10º khan — Vermelho'),
('cbmtt-19-khan','khan-11',10,'11º khan — Vermelho e branco — Instrutor / Kru Fueng Sorn'),
('cbmtt-19-khan','khan-12',11,'12º khan — Vermelho e amarelo — Professor / Kru'),
('cbmtt-19-khan','khan-13',12,'13º khan — Vermelho e prata — Mestrando / Kru Yai'),
('cbmtt-19-khan','khan-14',13,'14º khan — Prata — Mestre / Arjarn'),
('cbmtt-19-khan','khan-15',14,'15º khan — Prata e dourado — Grão Mestre / Arjarn Yai'),
('cbmtt-19-khan','khan-16',15,'16º khan — Dourado — Grão Mestre / Arjarn Yai (honraria)'),
('cbmtt-19-khan','khan-17',16,'17º khan — Dourado — Grão Mestre / Arjarn Yai (honraria)'),
('cbmtt-19-khan','khan-18',17,'18º khan — Dourado — Grão Mestre / Arjarn Yai (honraria)'),
('cbmtt-19-khan','khan-19',18,'19º khan — Dourado — Grão Mestre / Arjarn Yai (honraria)') ON CONFLICT DO NOTHING;

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
  IF v_modality IN ('judo', 'muay_thai') THEN
    IF NEW.current_belt_id IS NOT NULL OR NEW.current_degree IS NOT NULL
       OR NEW.graduation_reference_id IS DISTINCT FROM (CASE v_modality WHEN 'judo' THEN 'cbj-2023' ELSE 'cbmtt-19-khan' END)
       OR NEW.current_rank_code IS NULL
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
COMMIT;
