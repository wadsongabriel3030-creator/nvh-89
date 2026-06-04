-- Cole este SQL no Supabase SQL Editor para habilitar reportes de clase
-- (necessário para o card "Desempeño de los Miembros" nas demais áreas)

CREATE TABLE IF NOT EXISTS public.class_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  area TEXT NOT NULL,
  leccion TEXT,
  report_date DATE,
  leader_name TEXT,
  attendee_ids UUID[] NOT NULL DEFAULT '{}',
  attendee_names TEXT[] NOT NULL DEFAULT '{}',
  extra JSONB,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_reports TO authenticated;
GRANT ALL ON public.class_reports TO service_role;

ALTER TABLE public.class_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth all class_reports" ON public.class_reports;
CREATE POLICY "Auth all class_reports"
ON public.class_reports
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_class_reports_area ON public.class_reports (area);

DROP TRIGGER IF EXISTS update_class_reports_updated_at ON public.class_reports;
CREATE TRIGGER update_class_reports_updated_at
BEFORE UPDATE ON public.class_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
