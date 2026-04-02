-- MassMotion - Supabase Database Schema
-- Run this in Supabase SQL Editor

-- Table for anonymous reactions
CREATE TABLE reactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  drama_id text NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('hype', 'cry', 'sweet', 'laugh')),
  session_id text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Prevent duplicate reactions from same session
  UNIQUE(drama_id, session_id)
);

-- Indexes for performance
CREATE INDEX idx_reactions_drama_id ON reactions(drama_id);
CREATE INDEX idx_reactions_created_at ON reactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for adding reactions)
CREATE POLICY "Allow anonymous inserts"
  ON reactions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow public reads (to show reaction counts)
CREATE POLICY "Allow public reads"
  ON reactions
  FOR SELECT
  TO anon
  USING (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Reactions table created successfully!';
  RAISE NOTICE 'Now run: node test-supabase.js';
END $$;
