-- ============================================================
-- Migración: Tablas para módulo Discipulador
-- ============================================================

-- 1) discipuladores — miembros que tienen el cargo de discipulador
CREATE TABLE IF NOT EXISTS public.discipuladores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT discipuladores_member_id_unique UNIQUE (member_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.discipuladores TO authenticated;
GRANT ALL ON public.discipuladores TO service_role;
ALTER TABLE public.discipuladores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth all discipuladores" ON public.discipuladores;
CREATE POLICY "Auth all discipuladores"
ON public.discipuladores FOR ALL TO authenticated
USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_discipuladores_member ON public.discipuladores (member_id);

DROP TRIGGER IF EXISTS update_discipuladores_updated_at ON public.discipuladores;
CREATE TRIGGER update_discipuladores_updated_at
BEFORE UPDATE ON public.discipuladores
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) discipulador_discipulos — relación discipulador ↔ discípulo
CREATE TABLE IF NOT EXISTS public.discipulador_discipulos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discipulador_id UUID NOT NULL REFERENCES public.discipuladores(id) ON DELETE CASCADE,
  discipulo_member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT discipulador_discipulos_unique UNIQUE (discipulador_id, discipulo_member_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.discipulador_discipulos TO authenticated;
GRANT ALL ON public.discipulador_discipulos TO service_role;
ALTER TABLE public.discipulador_discipulos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth all discipulador_discipulos" ON public.discipulador_discipulos;
CREATE POLICY "Auth all discipulador_discipulos"
ON public.discipulador_discipulos FOR ALL TO authenticated
USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_dd_discipulador ON public.discipulador_discipulos (discipulador_id);
CREATE INDEX IF NOT EXISTS idx_dd_discipulo ON public.discipulador_discipulos (discipulo_member_id);

DROP TRIGGER IF EXISTS update_discipulador_discipulos_updated_at ON public.discipulador_discipulos;
CREATE TRIGGER update_discipulador_discipulos_updated_at
BEFORE UPDATE ON public.discipulador_discipulos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) discipulo_progreso — progreso del discípulo en la ruta
CREATE TABLE IF NOT EXISTS public.discipulo_progreso (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discipulo_member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  marked_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT discipulo_progreso_unique UNIQUE (discipulo_member_id, step_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.discipulo_progreso TO authenticated;
GRANT ALL ON public.discipulo_progreso TO service_role;
ALTER TABLE public.discipulo_progreso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth all discipulo_progreso" ON public.discipulo_progreso;
CREATE POLICY "Auth all discipulo_progreso"
ON public.discipulo_progreso FOR ALL TO authenticated
USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_dp_discipulo ON public.discipulo_progreso (discipulo_member_id);
CREATE INDEX IF NOT EXISTS idx_dp_step ON public.discipulo_progreso (step_key);

DROP TRIGGER IF EXISTS update_discipulo_progreso_updated_at ON public.discipulo_progreso;
CREATE TRIGGER update_discipulo_progreso_updated_at
BEFORE UPDATE ON public.discipulo_progreso
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
