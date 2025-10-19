-- links 테이블의 youtube-playlist 카테고리 RLS 정책
-- 특정 사용자만 추가/수정/삭제 가능하도록 설정

-- 기존 links 테이블 정책이 있는지 확인하고 youtube-playlist 카테고리에 대한 정책 추가

-- 1. 모든 사용자가 links 테이블 읽기 가능 (기존 정책 유지)
-- 이미 존재할 것으로 예상

-- 2. 특정 이메일 사용자만 youtube-playlist 카테고리 추가 가능
CREATE POLICY "Only specific users can insert youtube playlist links" 
ON links FOR INSERT 
WITH CHECK (
    category = 'youtube-playlist' AND
    auth.email() IN (
        'icandoit13579@gmail.com'  -- 메인 사용자 이메일
    )
);

-- 3. 특정 이메일 사용자만 youtube-playlist 카테고리 수정 가능
CREATE POLICY "Only specific users can update youtube playlist links" 
ON links FOR UPDATE 
USING (
    category = 'youtube-playlist' AND
    auth.email() IN (
        'icandoit13579@gmail.com'  -- 메인 사용자 이메일
    )
);

-- 4. 특정 이메일 사용자만 youtube-playlist 카테고리 삭제 가능
CREATE POLICY "Only specific users can delete youtube playlist links" 
ON links FOR DELETE 
USING (
    category = 'youtube-playlist' AND
    auth.email() IN (
        'icandoit13579@gmail.com'  -- 메인 사용자 이메일
    )
);

-- 또는 역할(role) 기반으로 관리하려면:
-- 먼저 profiles 테이블에 role 컬럼이 있어야 합니다
/*
CREATE POLICY "Only admins can insert youtube playlists" 
ON youtube_playlists FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);
*/

-- 또는 특정 user ID로 관리하려면:
/*
CREATE POLICY "Only specific user ids can insert youtube playlists" 
ON youtube_playlists FOR INSERT 
WITH CHECK (
    auth.uid() IN (
        'user-uuid-1',  -- Supabase Auth의 사용자 ID
        'user-uuid-2'
    )
);
*/