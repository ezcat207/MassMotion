# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name: `massmotion` (or your preferred name)
4. Database password: (generate a strong one)
5. Region: Choose closest to your users
6. Wait for project to finish provisioning (~2 minutes)

## 2. Get API Credentials

1. Go to Project Settings → API
2. Copy these values:
   - **Project URL**: `https://YOUR_PROJECT.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)

3. Create `.env` file in project root:
```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your_anon_key
```

## 3. Create Database Tables

Run this SQL in Supabase SQL Editor (Dashboard → SQL Editor → New Query):

```sql
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

-- Index for fast queries
CREATE INDEX idx_reactions_drama_id ON reactions(drama_id);
CREATE INDEX idx_reactions_created_at ON reactions(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for reactions)
CREATE POLICY "Allow anonymous inserts"
  ON reactions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow public reads (to show reaction counts)
CREATE POLICY "Allow public reads"
  ON reactions
  FOR SELECT
  TO anon
  USING (true);

-- Function to get reaction counts per drama
CREATE OR REPLACE FUNCTION get_reaction_counts(target_drama_id text)
RETURNS TABLE (
  reaction_type text,
  count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.reaction_type,
    COUNT(*) as count
  FROM reactions r
  WHERE r.drama_id = target_drama_id
  GROUP BY r.reaction_type;
END;
$$ LANGUAGE plpgsql;
```

## 4. Test Connection

After adding `.env` file, restart dev server:
```bash
npm run dev
```

Open browser console and check for Supabase connection status.

## 5. Verify Tables

In Supabase Dashboard:
1. Go to Table Editor
2. You should see `reactions` table
3. Try clicking a reaction in the app
4. Refresh table to see the new row

## Security Notes

- ✅ RLS is enabled (only anon users can insert/read)
- ✅ Unique constraint prevents double-voting per session
- ✅ No authentication required (anonymous reactions)
- ✅ `anon` key is safe to expose in frontend (it's public)

## Rate Limiting (Optional)

To prevent abuse, consider adding rate limiting in Supabase Functions or using Cloudflare.

For MVP, the session-based unique constraint is sufficient.
