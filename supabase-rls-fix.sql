-- Supabase RLS Fix for links table
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

-- Option 1: Disable RLS completely (Quick fix, less secure)
ALTER TABLE links DISABLE ROW LEVEL SECURITY;

-- Option 2: Enable RLS with proper policies (Recommended)
-- First, enable RLS
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON links;
DROP POLICY IF EXISTS "Enable insert for all users" ON links;
DROP POLICY IF EXISTS "Enable update for all users" ON links;
DROP POLICY IF EXISTS "Enable delete for all users" ON links;

-- Create new policies for anonymous access
CREATE POLICY "Enable read access for all users" 
ON links FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for all users" 
ON links FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
ON links FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete for all users" 
ON links FOR DELETE 
USING (true);

-- Verify the table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'links';

-- Check if there are any records
SELECT COUNT(*) FROM links;

-- If the table doesn't exist, create it
CREATE TABLE IF NOT EXISTS links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT,
    style JSONB DEFAULT '{}'::jsonb
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_links_category ON links(category);
CREATE INDEX IF NOT EXISTS idx_links_position ON links(position);

-- Insert some test data if table is empty
INSERT INTO links (name, url, category, position) 
SELECT 'Test Link', 'https://example.com', 'favorite', 0
WHERE NOT EXISTS (SELECT 1 FROM links LIMIT 1);