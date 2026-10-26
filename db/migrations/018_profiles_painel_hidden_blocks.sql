-- Preferência de blocos ocultos no Painel, por perfil do professor (issue #11).
-- SEGURANÇA DE DADOS: apenas DDL aditivo. Sem UPDATE, INSERT, DELETE, TRUNCATE
-- ou backfill em linhas existentes. Linhas actuais recebem default '{}' (tudo visível).
-- RLS: profiles_update_self já permite o próprio perfil; não se altera política.
-- Idempotente: ADD COLUMN IF NOT EXISTS.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS painel_hidden_blocks text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.profiles.painel_hidden_blocks IS
  'Ids dos blocos do Painel escondidos neste perfil; lista vazia = todos visíveis.';
