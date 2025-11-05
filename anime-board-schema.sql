-- Create anime_board table
CREATE TABLE IF NOT EXISTS anime_board (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    year INTEGER,
    episodes VARCHAR(100),
    platform VARCHAR(50) NOT NULL,
    genres TEXT[],
    director VARCHAR(255),
    studio VARCHAR(255),
    original VARCHAR(255),
    cast_info TEXT,  -- renamed from 'cast' to avoid reserved word
    rating INTEGER CHECK (rating >= 0 AND rating <= 5),
    age_rating VARCHAR(20),
    synopsis TEXT,
    highlights TEXT,
    memorable_scenes TEXT,
    quotes TEXT,
    art_style VARCHAR(255),
    color_mood VARCHAR(255),
    music TEXT,
    poster_url TEXT,
    trailer_url TEXT,
    screenshots TEXT[],
    review TEXT,
    recommend_to TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create RLS policies
ALTER TABLE anime_board ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read
CREATE POLICY "Anyone can view anime" ON anime_board
    FOR SELECT USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can add anime" ON anime_board
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users to update their own entries
CREATE POLICY "Users can update own anime" ON anime_board
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow authenticated users to delete their own entries
CREATE POLICY "Users can delete own anime" ON anime_board
    FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('anime-screenshots', 'anime-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to screenshots
CREATE POLICY "Public Access" ON storage.objects 
    FOR ALL USING (bucket_id = 'anime-screenshots');