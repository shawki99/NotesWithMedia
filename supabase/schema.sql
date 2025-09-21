-- Visual Notes Database Schema
-- Run this in your Supabase SQL editor

-- Create notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS notes_user_id_created_at_idx 
ON public.notes(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "read own notes" ON public.notes
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "insert own notes" ON public.notes
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "update own notes" ON public.notes
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "delete own notes" ON public.notes
FOR DELETE USING (user_id = auth.uid());
