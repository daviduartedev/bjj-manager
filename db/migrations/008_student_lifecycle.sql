-- Ciclo-vida operacional (**STU-10**, **STU-11**, **BR-9**) — arquivo e remoção soft distintos de inactive/paused.

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS archived_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS removed_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS lifecycle_updated_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS lifecycle_updated_by uuid NULL REFERENCES public.profiles (id);

CREATE INDEX IF NOT EXISTS idx_students_account_archived_partial
  ON public.students (account_id)
  WHERE archived_at IS NOT NULL AND removed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_students_account_removed_partial
  ON public.students (account_id)
  WHERE removed_at IS NOT NULL;
