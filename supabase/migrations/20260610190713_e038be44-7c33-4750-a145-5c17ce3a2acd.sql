
-- 1. user_permissions table
CREATE TABLE IF NOT EXISTS public.user_permissions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  permissions text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_permissions TO authenticated;
GRANT ALL ON public.user_permissions TO service_role;

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own permissions" ON public.user_permissions;
CREATE POLICY "Users read own permissions" ON public.user_permissions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage permissions" ON public.user_permissions;
CREATE POLICY "Admins manage permissions" ON public.user_permissions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_user_permissions_updated_at
  BEFORE UPDATE ON public.user_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Admin list accounts function
CREATE OR REPLACE FUNCTION public.admin_list_accounts()
RETURNS TABLE (
  user_id uuid,
  email text,
  display_name text,
  role public.app_role,
  permissions text[],
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Solo administradores pueden listar cuentas';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    COALESCE(up.display_name, p.display_name, split_part(u.email::text, '@', 1)) AS display_name,
    COALESCE(
      (SELECT ur.role FROM public.user_roles ur
        WHERE ur.user_id = u.id
        ORDER BY CASE ur.role
          WHEN 'admin' THEN 1
          WHEN 'pastor' THEN 2
          WHEN 'leader' THEN 3
          WHEN 'server' THEN 4
          WHEN 'member' THEN 5
        END
        LIMIT 1),
      'member'::public.app_role
    ) AS role,
    COALESCE(up.permissions, '{}'::text[]) AS permissions,
    u.created_at
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  LEFT JOIN public.user_permissions up ON up.user_id = u.id
  ORDER BY u.created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_accounts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_accounts() TO authenticated;

-- 3. Garantizar admin para silvio si ya existe
DO $$
DECLARE silvio_id uuid;
BEGIN
  SELECT id INTO silvio_id FROM auth.users WHERE email = 'silvio@nuevoshechos.com' LIMIT 1;
  IF silvio_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (silvio_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;
