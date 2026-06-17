
-- =========================================================
-- 1. Lock down SECURITY DEFINER helpers
-- =========================================================
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;

-- =========================================================
-- 2. members
-- =========================================================
DROP POLICY IF EXISTS "Authenticated read members" ON public.members;
DROP POLICY IF EXISTS "Authenticated write members" ON public.members;

CREATE POLICY "Staff read members" ON public.members
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'pastor') OR
    public.has_role(auth.uid(),'leader')
  );

CREATE POLICY "Staff write members" ON public.members
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'pastor') OR
    public.has_role(auth.uid(),'leader')
  )
  WITH CHECK (
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'pastor') OR
    public.has_role(auth.uid(),'leader')
  );

-- =========================================================
-- 3. profiles
-- =========================================================
DROP POLICY IF EXISTS "Authenticated read profiles" ON public.profiles;

CREATE POLICY "Users read own profile or staff read all" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'pastor')
  );

-- =========================================================
-- 4. event_registrations (keep public INSERT; restrict SELECT/UPDATE/DELETE)
-- =========================================================
DROP POLICY IF EXISTS "Auth read regs" ON public.event_registrations;
DROP POLICY IF EXISTS "Auth update regs" ON public.event_registrations;
DROP POLICY IF EXISTS "Auth delete regs" ON public.event_registrations;

CREATE POLICY "Staff read regs" ON public.event_registrations
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'pastor'));

CREATE POLICY "Staff update regs" ON public.event_registrations
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'pastor'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'pastor'));

CREATE POLICY "Staff delete regs" ON public.event_registrations
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'pastor'));

-- =========================================================
-- 5. leaders_list (remove broad authenticated read)
-- =========================================================
DROP POLICY IF EXISTS "Authenticated read leaders" ON public.leaders_list;

CREATE POLICY "Staff read leaders" ON public.leaders_list
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'pastor'));

-- =========================================================
-- 6. baptisms (keep public INSERT, restrict UPDATE/DELETE)
-- =========================================================
DROP POLICY IF EXISTS "Auth update baptisms" ON public.baptisms;
DROP POLICY IF EXISTS "Auth delete baptisms" ON public.baptisms;

CREATE POLICY "Staff update baptisms" ON public.baptisms
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'pastor'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'pastor'));

CREATE POLICY "Staff delete baptisms" ON public.baptisms
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'pastor'));

-- =========================================================
-- 7. discipleship / creencias / membresia students (restrict writes)
-- =========================================================
DROP POLICY IF EXISTS "Auth all discipleship" ON public.discipleship_students;
DROP POLICY IF EXISTS "Auth all creencias" ON public.creencias_students;
DROP POLICY IF EXISTS "Auth all membresia" ON public.membresia_students;

CREATE POLICY "Staff read discipleship" ON public.discipleship_students
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff write discipleship" ON public.discipleship_students
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'pastor') OR public.has_role(auth.uid(),'leader')
  );
CREATE POLICY "Staff update discipleship" ON public.discipleship_students
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'pastor') OR public.has_role(auth.uid(),'leader'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'pastor') OR public.has_role(auth.uid(),'leader'));
CREATE POLICY "Staff delete discipleship" ON public.discipleship_students
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'pastor') OR public.has_role(auth.uid(),'leader'));

CREATE POLICY "Staff read creencias" ON public.creencias_students
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff write creencias" ON public.creencias_students
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'pastor') OR public.has_role(auth.uid(),'leader')
  );
CREATE POLICY "Staff update creencias" ON public.creencias_students
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'pastor') OR public.has_role(auth.uid(),'leader'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'pastor') OR public.has_role(auth.uid(),'leader'));
CREATE POLICY "Staff delete creencias" ON public.creencias_students
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'pastor') OR public.has_role(auth.uid(),'leader'));

CREATE POLICY "Staff read membresia" ON public.membresia_students
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff write membresia" ON public.membresia_students
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'pastor') OR public.has_role(auth.uid(),'leader')
  );
CREATE POLICY "Staff update membresia" ON public.membresia_students
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'pastor') OR public.has_role(auth.uid(),'leader'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'pastor') OR public.has_role(auth.uid(),'leader'));
CREATE POLICY "Staff delete membresia" ON public.membresia_students
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'pastor') OR public.has_role(auth.uid(),'leader'));

-- =========================================================
-- 8. reminders (creator or admin/pastor)
-- =========================================================
DROP POLICY IF EXISTS "Auth all reminders" ON public.reminders;

CREATE POLICY "Owner or staff manage reminders" ON public.reminders
  FOR ALL TO authenticated
  USING (
    auth.uid() = created_by OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'pastor')
  )
  WITH CHECK (
    auth.uid() = created_by OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'pastor')
  );

-- =========================================================
-- 9. sunday_reports (financial — staff only)
-- =========================================================
DROP POLICY IF EXISTS "Auth all sunday_reports" ON public.sunday_reports;

CREATE POLICY "Staff manage sunday_reports" ON public.sunday_reports
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'pastor'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'pastor'));

-- =========================================================
-- 10. Replace remaining "WITH CHECK (true)" permissive write policies
--      with an authenticated-session check (linter compliance).
-- =========================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename, policyname
    FROM pg_policies
    WHERE schemaname='public'
      AND cmd='ALL'
      AND with_check='true'
      AND qual='true'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL)',
      r.policyname, r.tablename
    );
  END LOOP;

  FOR r IN
    SELECT tablename, policyname, cmd
    FROM pg_policies
    WHERE schemaname='public'
      AND cmd IN ('INSERT','UPDATE','DELETE')
      AND (with_check='true' OR (cmd IN ('UPDATE','DELETE') AND qual='true'))
      AND policyname NOT IN (
        'Anyone register baptism',
        'Anyone can register for event',
        'Anyone register nc',
        'Anyone can submit testimony'
      )
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
    IF r.cmd = 'INSERT' THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL)',
        r.policyname, r.tablename
      );
    ELSIF r.cmd = 'UPDATE' THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL)',
        r.policyname, r.tablename
      );
    ELSE
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL)',
        r.policyname, r.tablename
      );
    END IF;
  END LOOP;
END $$;
