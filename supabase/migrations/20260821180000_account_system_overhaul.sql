-- ============================================================
-- 1. Add 'mini_admin' to app_role enum
-- ============================================================
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'mini_admin' AFTER 'admin';

-- ============================================================
-- 2. Add member_id column to user_permissions
-- ============================================================
ALTER TABLE public.user_permissions
  ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES public.members(id) ON DELETE SET NULL;

-- ============================================================
-- 3. Delete wadson and vivian accounts
--    CASCADE from auth.users removes profiles, user_roles, user_permissions
-- ============================================================
DELETE FROM auth.users WHERE email IN (
  'wadson123@gmail.com',
  'pastoravivisrod@nuevoshechos.com'
);

-- ============================================================
-- 4. Change Silvio's email from .com to .gt
-- ============================================================
UPDATE auth.users
  SET email = 'silvio@nuevoshechos.gt',
      raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{email}',
        '"silvio@nuevoshechos.gt"'
      )
  WHERE email = 'silvio@nuevoshechos.com';

UPDATE public.profiles
  SET email = 'silvio@nuevoshechos.gt'
  WHERE email = 'silvio@nuevoshechos.com';

-- ============================================================
-- 5. Helper: check if user has admin OR mini_admin role
-- ============================================================
CREATE OR REPLACE FUNCTION public.has_admin_or_mini(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'mini_admin')
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_admin_or_mini(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_admin_or_mini(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_admin_or_mini(uuid) TO service_role;

-- ============================================================
-- 6. Update admin_list_accounts() to support mini_admin + member_id
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_list_accounts()
RETURNS TABLE (
  user_id uuid,
  email text,
  display_name text,
  role public.app_role,
  permissions text[],
  created_at timestamptz,
  member_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_admin_or_mini(auth.uid()) THEN
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
          WHEN 'admin'      THEN 1
          WHEN 'mini_admin' THEN 2
          WHEN 'pastor'     THEN 3
          WHEN 'leader'     THEN 4
          WHEN 'server'     THEN 5
          WHEN 'member'     THEN 6
        END
        LIMIT 1),
      'member'::public.app_role
    ) AS role,
    COALESCE(up.permissions, '{}'::text[]) AS permissions,
    u.created_at,
    up.member_id
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  LEFT JOIN public.user_permissions up ON up.user_id = u.id
  ORDER BY u.created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_accounts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_accounts() TO authenticated;

-- ============================================================
-- 7. Update RLS policies on user_permissions for mini_admin
-- ============================================================
DROP POLICY IF EXISTS "Users read own permissions" ON public.user_permissions;
CREATE POLICY "Users read own permissions" ON public.user_permissions
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'mini_admin')
  );

DROP POLICY IF EXISTS "Admins manage permissions" ON public.user_permissions;
CREATE POLICY "Admins manage permissions" ON public.user_permissions
  FOR ALL TO authenticated
  USING (public.has_admin_or_mini(auth.uid()))
  WITH CHECK (public.has_admin_or_mini(auth.uid()));
