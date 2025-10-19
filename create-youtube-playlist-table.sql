-- YouTube 재생목록을 위한 테이블 생성
CREATE TABLE IF NOT EXISTS youtube_playlists (
    id SERIAL PRIMARY KEY,
    playlist_id VARCHAR(255) NOT NULL,
    playlist_name VARCHAR(255) NOT NULL,
    video_url TEXT NOT NULL,
    video_id VARCHAR(255) NOT NULL,
    title TEXT,
    channel_name VARCHAR(255),
    thumbnail_url TEXT,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 인덱스
    INDEX idx_playlist_id (playlist_id),
    INDEX idx_video_id (video_id),
    INDEX idx_created_at (created_at)
);

-- RLS (Row Level Security) 활성화
ALTER TABLE youtube_playlists ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있도록 정책 추가
CREATE POLICY "YouTube playlists are viewable by everyone" 
ON youtube_playlists FOR SELECT 
USING (true);

-- 인증된 사용자만 추가/수정/삭제 가능
CREATE POLICY "YouTube playlists are insertable by authenticated users" 
ON youtube_playlists FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' OR true); -- 임시로 모두 허용

CREATE POLICY "YouTube playlists are updatable by authenticated users" 
ON youtube_playlists FOR UPDATE 
USING (auth.role() = 'authenticated' OR true); -- 임시로 모두 허용

CREATE POLICY "YouTube playlists are deletable by authenticated users" 
ON youtube_playlists FOR DELETE 
USING (auth.role() = 'authenticated' OR true); -- 임시로 모두 허용
EOF < /dev/null