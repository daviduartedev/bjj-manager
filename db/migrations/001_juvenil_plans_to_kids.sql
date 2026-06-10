-- =====================================================
-- Migração: normalizar rótulos/preços dos planos Kids (idempotente).
-- Política (cycle 0609): NUNCA reatribuir vínculos abertos em student_plans
-- entre kids_1 e kids_2. O bloco destrutivo foi removido em 2026-06-09.
-- =====================================================

-- Nomes por defeito (sem sobrescrever personalizações já distintas)
UPDATE public.plans
SET
  name = 'Kids 1',
  updated_at = now()
WHERE
  kind = 'kids_1'
  AND name IN ('Kid 1', 'Kids 1');

UPDATE public.plans
SET
  name = 'Kids 2',
  updated_at = now()
WHERE
  kind = 'kids_2';

-- Preço legado Juvenil → Kids 2 (só se ainda estiver no valor antigo 12000)
UPDATE public.plans
SET
  price_cents = 10000,
  updated_at = now()
WHERE
  kind = 'kids_2'
  AND price_cents = 12000;
