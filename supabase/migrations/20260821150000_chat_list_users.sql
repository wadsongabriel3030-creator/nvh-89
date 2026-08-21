-- =====================================================
-- 1. Función chat_list_users: lista usuarios del chat
--    Cualquier usuario autenticado puede llamarla.
--    Solo retorna usuarios que tienen un role en user_roles
--    (es decir, cuentas creadas via "Cuentas de usuario").
-- =====================================================
CREATE OR REPLACE FUNCTION public.chat_list_users()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  email text,
  avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Solo usuarios autenticados
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  RETURN QUERY
  SELECT
    u.id AS user_id,
    COALESCE(p.display_name, split_part(u.email::text, '@', 1)) AS display_name,
    u.email::text AS email,
    p.avatar_url::text AS avatar_url
  FROM auth.users u
  INNER JOIN public.user_roles ur ON ur.user_id = u.id
  LEFT JOIN public.profiles p ON p.user_id = u.id
  WHERE u.id != auth.uid()
  GROUP BY u.id, u.email, p.display_name, p.avatar_url
  ORDER BY COALESCE(p.display_name, u.email::text);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.chat_list_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.chat_list_users() TO authenticated;

-- =====================================================
-- 2. Actualizar la política RLS de profiles para que
--    TODOS los usuarios autenticados puedan ver los
--    perfiles (necesario para el chat y otras funciones).
--    Solo contiene nombre, email, avatar - no es sensible.
-- =====================================================
DROP POLICY IF EXISTS "Users read own profile or staff read all" ON public.profiles;

CREATE POLICY "Authenticated users can read all profiles"
ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);
