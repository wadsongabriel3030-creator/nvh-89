-- ============================================================
-- Add 'invitado' status to member_status enum
-- Add 'zona' column to members table
-- ============================================================

-- 1. Add 'invitado' value to the member_status enum
ALTER TYPE public.member_status ADD VALUE IF NOT EXISTS 'invitado';

-- 2. Add zona column to members table
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS zona TEXT;
