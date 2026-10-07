-- Baby pode pesar menos de 20 kg. O tecto de 250 kg permanece.
ALTER TABLE public.student_graduations
  DROP CONSTRAINT IF EXISTS student_graduations_weight_kg_ck;

ALTER TABLE public.student_graduations
  ADD CONSTRAINT student_graduations_weight_kg_ck CHECK (
    weight_kg IS NULL
    OR (
      weight_kg >= 0.1
      AND weight_kg <= 250.0
    )
  );
