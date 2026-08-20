-- Add cargo (Curso a impartir) column to leaders_list
ALTER TABLE public.leaders_list
  ADD COLUMN IF NOT EXISTS cargo TEXT[] DEFAULT '{}';
