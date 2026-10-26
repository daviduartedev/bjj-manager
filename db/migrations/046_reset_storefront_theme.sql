-- Volta as cores do catálogo para o padrão. Aditivo se a coluna ainda não existir.

ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS storefront_theme jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.accounts
  SET storefront_theme = '{}'::jsonb
  WHERE storefront_theme IS DISTINCT FROM '{}'::jsonb;

NOTIFY pgrst, 'reload schema';
