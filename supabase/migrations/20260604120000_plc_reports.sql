-- ============================================================
-- Reportes PLC → página Resumen (/resumen-plc)
-- Cole este SQL no Supabase SQL Editor e clique Run.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.plc_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plc_group_id TEXT NOT NULL,
  plc_name TEXT NOT NULL,
  leader_id UUID,
  leader_name TEXT,
  report_date DATE,
  meeting_day TEXT,
  attendee_ids UUID[] NOT NULL DEFAULT '{}',
  attendee_names TEXT[] NOT NULL DEFAULT '{}',
  expected_member_ids UUID[] NOT NULL DEFAULT '{}',
  cantidad_invitados TEXT,
  nombres_invitados TEXT,
  hubo_convertidos BOOLEAN,
  convertidos_info TEXT,
  hubo_reconciliados BOOLEAN,
  reconciliados_info TEXT,
  hubo_incorporados BOOLEAN,
  incorporados_info TEXT,
  testimonio_milagros TEXT,
  ofrenda_recolectada TEXT,
  todos_recibieron_anuncios BOOLEAN,
  comentarios TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.plc_reports TO authenticated;
GRANT ALL ON public.plc_reports TO service_role;

ALTER TABLE public.plc_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth all plc_reports" ON public.plc_reports;
CREATE POLICY "Auth all plc_reports"
ON public.plc_reports
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_plc_reports_plc_group_id ON public.plc_reports (plc_group_id);
CREATE INDEX IF NOT EXISTS idx_plc_reports_created_at ON public.plc_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_plc_reports_report_date ON public.plc_reports (report_date DESC);

DROP TRIGGER IF EXISTS update_plc_reports_updated_at ON public.plc_reports;
CREATE TRIGGER update_plc_reports_updated_at
BEFORE UPDATE ON public.plc_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
