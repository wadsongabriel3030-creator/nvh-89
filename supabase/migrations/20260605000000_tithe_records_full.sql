-- Reinicia diezmos/ofrendas y crea tabla completa para registro detallado
-- Ejecutar en Supabase SQL Editor

DROP TABLE IF EXISTS public.tithes CASCADE;

DO $$ BEGIN
  CREATE TYPE public.tithe_currency AS ENUM ('GTQ', 'USD');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.tithe_payment_form AS ENUM ('efectivo', 'transferencia', 'cheque');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE public.tithe_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_name TEXT NOT NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  tithe_date DATE NOT NULL,
  currency public.tithe_currency NOT NULL DEFAULT 'GTQ',

  tithe_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  tithe_payment_method public.tithe_payment_form NOT NULL DEFAULT 'efectivo',
  tithe_transfer_number TEXT,

  offering_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  offering_payment_method public.tithe_payment_form NOT NULL DEFAULT 'efectivo',
  offering_transfer_number TEXT,

  first_fruits_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  first_fruits_payment_method public.tithe_payment_form NOT NULL DEFAULT 'efectivo',
  first_fruits_transfer_number TEXT,

  pro_templo_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  pro_templo_payment_method public.tithe_payment_form NOT NULL DEFAULT 'efectivo',
  pro_templo_transfer_number TEXT,

  special_offering_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  special_offering_payment_method public.tithe_payment_form NOT NULL DEFAULT 'efectivo',
  special_offering_transfer_number TEXT,

  notes TEXT,
  recorded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tithe_records_date ON public.tithe_records (tithe_date DESC);
CREATE INDEX idx_tithe_records_member_name ON public.tithe_records (member_name);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tithe_records TO authenticated;
GRANT ALL ON public.tithe_records TO service_role;

ALTER TABLE public.tithe_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read tithe_records" ON public.tithe_records
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Auth write tithe_records" ON public.tithe_records
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER trg_tithe_records_updated_at
  BEFORE UPDATE ON public.tithe_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
