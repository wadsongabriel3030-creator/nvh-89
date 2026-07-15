-- Allow anonymous users to read/write app_storage (needed for pages accessible without auth)
DROP POLICY IF EXISTS "Anon all app_storage" ON public.app_storage;
CREATE POLICY "Anon all app_storage"
ON public.app_storage
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Also grant permissions to anon role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_storage TO anon;
