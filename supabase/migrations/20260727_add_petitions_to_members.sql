-- Add petitions column to members table for prayer requests
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS petitions TEXT;
