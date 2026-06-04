-- ============================================================
-- Foto de perfil PNG salva no banco (coluna profiles.avatar_url)
-- COLE TODO ESTE CÓDIGO no SQL Editor do Supabase e clique Run.
-- NÃO cole o caminho do arquivo — cole o SQL abaixo.
-- ============================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN public.profiles.avatar_url IS
  'Foto de perfil em PNG (data:image/png;base64,...)';
