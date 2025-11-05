-- Supabase에서 실행할 SQL
-- links 테이블 생성

CREATE TABLE IF NOT EXISTS links (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'youtube', 'favorite', 'gpt'
    position INT DEFAULT 999,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 기본 데이터 삽입
INSERT INTO links (name, url, category, position) VALUES
-- YouTube 채널
('사또', 'https://www.youtube.com/@live-streamersatto/live', 'youtube', 1),
('짭구', 'https://www.youtube.com/@zzap9/live', 'youtube', 2),
('박호두', 'https://www.youtube.com/@852hodoo/live', 'youtube', 3),
('자두두', 'https://www.youtube.com/@jadoodoo/live', 'youtube', 4),

-- Favorite 사이트
('CoinSect.io', 'https://coinsect.io', 'favorite', 1),

-- GPT 도구
('GPT 공손화', 'https://chatgpt.com/g/g-6806fd8c48b481919be4a862d7397855-gongsonhan-pyohyeon-doumi', 'gpt', 1),
('핵심만 발췌', 'https://chatgpt.com/g/g-68b5288a57188191a2f6fd5b4dda9e89-haegsimman-balcwe', 'gpt', 2),
('밴드홍보글 마법사', 'https://chatgpt.com/g/g-6892fc320bd48191b2b451d16a6b29c8-baendeuhongbogeul-mabeobsa', 'gpt', 3);

-- RLS (Row Level Security) 설정
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- 읽기는 모두 가능
CREATE POLICY "Enable read access for all users" ON links
    FOR SELECT USING (true);

-- 쓰기는 인증된 사용자만 (필요시)
CREATE POLICY "Enable insert for authenticated users only" ON links
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON links
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON links
    FOR DELETE USING (auth.role() = 'authenticated');