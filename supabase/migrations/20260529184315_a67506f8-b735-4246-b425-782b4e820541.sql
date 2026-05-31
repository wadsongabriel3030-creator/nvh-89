-- Fix 1: leaders_list - remove public read access (exposes phone numbers)
DROP POLICY IF EXISTS "Anyone read leaders" ON public.leaders_list;

CREATE POLICY "Authenticated read leaders"
ON public.leaders_list
FOR SELECT
TO authenticated
USING (true);

REVOKE SELECT ON public.leaders_list FROM anon;

-- Fix 2: profiles - remove public read access (exposes emails/phones)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated read profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

REVOKE SELECT ON public.profiles FROM anon;