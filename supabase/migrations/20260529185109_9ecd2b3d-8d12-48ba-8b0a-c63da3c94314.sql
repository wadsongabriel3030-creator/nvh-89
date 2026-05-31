CREATE TABLE IF NOT EXISTS public.app_storage (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT 'null'::jsonb,
  category text NOT NULL DEFAULT 'general',
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_storage TO authenticated;
GRANT ALL ON public.app_storage TO service_role;

ALTER TABLE public.app_storage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth all app_storage" ON public.app_storage;
CREATE POLICY "Auth all app_storage"
ON public.app_storage
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP TRIGGER IF EXISTS update_app_storage_updated_at ON public.app_storage;
CREATE TRIGGER update_app_storage_updated_at
BEFORE UPDATE ON public.app_storage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.event_attendees (
  event_id uuid NOT NULL,
  member_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, member_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_attendees TO authenticated;
GRANT ALL ON public.event_attendees TO service_role;

ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth all event_attendees" ON public.event_attendees;
CREATE POLICY "Auth all event_attendees"
ON public.event_attendees
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON public.event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_app_storage_category ON public.app_storage(category);