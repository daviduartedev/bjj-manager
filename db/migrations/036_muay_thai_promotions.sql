-- #33: amplia a RPC atômica de graduação referenciada para Muay Thai CBMTT.
BEGIN;
CREATE OR REPLACE FUNCTION public.promote_referenced_student(
  p_student_id uuid, p_reference_id text, p_rank_code text, p_granted_on date, p_reason text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
  s public.students%ROWTYPE;
  v_from smallint; v_to smallint; v_modality text;
  v_skip boolean;
  v_reason text := nullif(regexp_replace(p_reason,
    '^[[:space:]' || chr(160) || chr(8199) || chr(8239) || chr(65279) || ']+|[[:space:]' || chr(160) || chr(8199) || chr(8239) || chr(65279) || ']+$', '', 'g'),'');
  v_age integer; v_year_age integer; v_dan integer; v_min_age integer; v_months integer := 0;
  v_exceptions text[] := '{}'; v_basis text; v_id uuid;
BEGIN
  IF NOT public.can_manage_graduations() OR auth.uid() IS NULL THEN
    RAISE EXCEPTION 'promotion unavailable' USING ERRCODE='42501';
  END IF;
  SELECT * INTO s FROM public.students WHERE id=p_student_id AND account_id=public.current_account_id() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'promotion unavailable' USING ERRCODE='42501'; END IF;
  SELECT modality INTO v_modality FROM public.accounts WHERE id=s.account_id FOR SHARE;
  IF v_modality NOT IN ('judo','muay_thai')
    OR p_reference_id IS DISTINCT FROM (CASE v_modality WHEN 'judo' THEN 'cbj-2023' ELSE 'cbmtt-19-khan' END)
    OR s.graduation_reference_id IS DISTINCT FROM p_reference_id THEN
    RAISE EXCEPTION 'invalid promotion rank' USING ERRCODE='23514';
  END IF;
  SELECT ordinal INTO v_from FROM public.graduation_ranks WHERE reference_id=p_reference_id AND code=s.current_rank_code;
  SELECT ordinal INTO v_to FROM public.graduation_ranks WHERE reference_id=p_reference_id AND code=p_rank_code;
  IF v_from IS NULL OR v_to IS NULL OR v_to <= v_from THEN
    RAISE EXCEPTION 'promotion must advance' USING ERRCODE='23514';
  END IF;
  IF p_granted_on IS NULL OR p_granted_on > (now() AT TIME ZONE 'America/Sao_Paulo')::date
    OR p_granted_on < s.current_rank_date OR p_granted_on < s.birth_date THEN
    RAISE EXCEPTION 'invalid promotion date' USING ERRCODE='23514';
  END IF;
  v_skip := v_to-v_from>1;
  IF v_modality = 'muay_thai' THEN
    v_basis := 'CBMTT — Tabela de graduação de 19 khan; https://www.cbmtt.org.br/images/graduacoes-cbmtt.jpg; consulta 22/10/2026. A tabela não informa edição, idades ou carências. Sem equivalência declarada com IFMA 15 khan; o Casca não atribui créditos. Registro de graduação concedida, sem exame, SNG, homologação ou certificação CBMTT/IFMA. Títulos esportivos não concedem permissões de acesso.';
  ELSE
  v_age := extract(year FROM age(p_granted_on,s.birth_date));
  v_year_age := extract(year FROM p_granted_on)-extract(year FROM s.birth_date);
  -- CBJ 2023 p7 §5/tabela1: dispensa adulta nas básicas; tabela2 intermediárias permanece explícita.
  v_basis := 'CBJ 2023, p.7, tabela 1 e §5: básicas acima de 16 anos dispensam sequência/carência; salto justificado é rastreabilidade Casca.';
  IF v_to BETWEEN 1 AND 7 AND v_age<=16 THEN
    v_months := (ARRAY[3,3,6,6,6,6,12])[v_to];
    v_min_age := (ARRAY[4,5,6,7,8,9,10])[v_to];
    v_basis := 'CBJ 2023, p.7, tabela 1, linha ' || p_rank_code || ': idade mínima ' || v_min_age
      || ' anos por ano de nascimento (§2), interstício ' || v_months || ' meses na graduação anterior; §5 dispensa apenas acima de 16 anos.';
    IF v_year_age < v_min_age THEN v_exceptions:=array_append(v_exceptions,'age'); END IF;
  ELSIF v_to BETWEEN 8 AND 11 THEN
    v_months := 12;
    v_min_age := v_to+3;
    v_basis := 'CBJ 2023, p.7, tabela 2, linha ' || p_rank_code || ': idade mínima ' || v_min_age || ' anos por ano de nascimento (§2), interstício 12 meses na graduação anterior.';
    IF v_year_age < v_min_age THEN v_exceptions:=array_append(v_exceptions,'age'); END IF;
  ELSIF v_to >= 12 THEN
    v_dan := v_to-11;
    v_min_age := (ARRAY[16,20,25,30,36,44,52,59,66,74])[v_dan];
    v_months := (ARRAY[CASE WHEN v_age>20 THEN 12 ELSE 24 END,48,60,60,72,72,84,84,96,96])[v_dan];
    v_basis := 'CBJ 2023, p.8, tabela ' || CASE WHEN v_dan<=5 THEN '3' WHEN v_dan<=7 THEN '4' ELSE '5' END
      || ', linha ' || v_dan || 'º dan: idade mínima ' || v_min_age || ' anos; interstício ' || v_months
      || ' meses; p.7 §2: idade por ano de nascimento, salvo 1º dan aos 16 completos; no 1º dan acima de 20 completos reduz a 1 ano.';
    IF (CASE WHEN v_dan=1 THEN v_age ELSE v_year_age END) < v_min_age THEN v_exceptions:=array_append(v_exceptions,'age'); END IF;
  END IF;
  IF v_months>0 THEN
    IF s.current_rank_date IS NULL THEN
      v_basis:=v_basis || ' Carência indeterminável: data anterior desconhecida, sem usar matrícula.';
    ELSIF p_granted_on < (s.current_rank_date + make_interval(months=>v_months))::date THEN
      v_exceptions:=array_append(v_exceptions,'waiting');
    END IF;
    IF v_skip THEN v_basis:=v_basis || ' Salto não comprova permanência na graduação imediatamente anterior ao destino.'; END IF;
  END IF;
  v_basis:=v_basis || ' p.9 §§7–9: categorias/regimes especiais não aferidos pelo Casca. Orientação padrão, sem homologação, exame ou certificação.';
  END IF;
  IF (v_skip OR cardinality(v_exceptions)>0) AND v_reason IS NULL THEN
    RAISE EXCEPTION 'promotion reason required' USING ERRCODE='23514';
  END IF;
  IF length(v_reason)>2000 THEN RAISE EXCEPTION 'promotion reason too long' USING ERRCODE='23514'; END IF;
  UPDATE public.students SET current_rank_code=p_rank_code,current_rank_date=p_granted_on WHERE id=s.id;
  INSERT INTO public.student_rank_promotions(student_id,reference_id,from_rank_code,from_rank_date,to_rank_code,granted_on,was_skip,reason,guidance_exceptions,guidance_basis,recorded_by)
  VALUES(s.id,p_reference_id,s.current_rank_code,s.current_rank_date,p_rank_code,p_granted_on,v_skip,v_reason,v_exceptions,v_basis,auth.uid()) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
REVOKE ALL ON FUNCTION public.promote_referenced_student(uuid,text,text,date,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.promote_referenced_student(uuid,text,text,date,text) TO authenticated;
COMMIT;
