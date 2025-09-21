-- Supabase RLS Fix for links table
-- Run each section separately in Supabase SQL Editor

-- ===== STEP 1: Check if table exists =====
-- First, check if the links table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'links'
);

-- ===== STEP 2: Create table if needed =====
-- If the table doesn't exist (from step 1), create it:
CREATE TABLE IF NOT EXISTS public.links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_by TEXT,
    style JSONB DEFAULT '{}'::jsonb
);

-- ===== STEP 3: Check current RLS status =====
-- Check if RLS is enabled
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'links';

-- ===== STEP 4: Quick Fix - Disable RLS =====
-- This is the fastest solution (run this and skip to step 8)
ALTER TABLE public.links DISABLE ROW LEVEL SECURITY;

-- ===== STEP 5: Alternative - Enable RLS with policies =====
-- If you want to keep RLS enabled, run these instead of step 4:

-- Enable RLS
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$ 
BEGIN
    -- Drop policies if they exist
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.links;
    DROP POLICY IF EXISTS "Enable insert for all users" ON public.links;
    DROP POLICY IF EXISTS "Enable update for all users" ON public.links;
    DROP POLICY IF EXISTS "Enable delete for all users" ON public.links;
    DROP POLICY IF EXISTS "Public links are viewable by everyone" ON public.links;
    DROP POLICY IF EXISTS "Anyone can insert links" ON public.links;
    DROP POLICY IF EXISTS "Anyone can update links" ON public.links;
    DROP POLICY IF EXISTS "Anyone can delete links" ON public.links;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if policies don't exist
        NULL;
END $$;

-- ===== STEP 6: Create new permissive policies =====
-- Allow all operations for anonymous users
CREATE POLICY "Enable read access for all users" 
ON public.links FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for all users" 
ON public.links FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
ON public.links FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for all users" 
ON public.links FOR DELETE 
USING (true);

-- ===== STEP 7: Create indexes =====
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_links_category ON public.links(category);
CREATE INDEX IF NOT EXISTS idx_links_position ON public.links(position);

-- ===== STEP 8: Verify setup =====
-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'links'
ORDER BY ordinal_position;

-- Check if there are any records
SELECT COUNT(*) as total_records FROM public.links;

-- Check policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'links';

-- ===== STEP 9: Insert test data (optional) =====
-- Only if table is empty
INSERT INTO public.links (name, url, category, position) 
SELECT 'Test Link', 'https://example.com', 'favorite', 0
WHERE NOT EXISTS (SELECT 1 FROM public.links LIMIT 1);

-- ===== TROUBLESHOOTING =====
-- If still getting errors, try:
-- 1. Make sure you're using the correct schema (public)
-- 2. Check if you have permissions: 
SELECT has_table_privilege('anon', 'public.links', 'SELECT');
-- 3. Try a simple query:
SELECT 1;