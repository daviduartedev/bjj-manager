-- Peso corporal (kg) opcional por evento de graduação (cycle 0609 Stage 3).
ALTER TABLE public.student_graduations
ADD COLUMN IF NOT EXISTS weight_kg numeric(5, 1) NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'student_graduations_weight_kg_ck'
  ) THEN
    ALTER TABLE public.student_graduations
    ADD CONSTRAINT student_graduations_weight_kg_ck CHECK (
      weight_kg IS NULL
      OR (
        weight_kg >= 20.0
        AND weight_kg <= 250.0
      )
    );
  END IF;
END
$$;
