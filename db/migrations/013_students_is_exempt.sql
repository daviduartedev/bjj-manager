-- Isenção persistente de mensalidade (cycle 0609 Stage 2).
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS is_exempt boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.students.is_exempt IS
  'Quando true, aluno isento de cobrança persistente; fora do recorte /mensalidades (BR-9).';
