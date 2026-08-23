-- Allow anonymous users (public forms like /compromiso-vnh) to INSERT into class_reports.
-- They should NOT be able to SELECT, UPDATE, or DELETE.

GRANT INSERT ON public.class_reports TO anon;

-- Policy: anon can only INSERT
CREATE POLICY "Anon insert class_reports"
ON public.class_reports
FOR INSERT
TO anon
WITH CHECK (true);
