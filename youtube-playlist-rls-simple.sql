-- links 테이블의 youtube-playlist 카테고리 RLS 정책 (간단 버전)
-- 로그인한 모든 사용자가 youtube-playlist 카테고리를 관리할 수 있도록 설정

-- 1. 모든 사용자가 links 테이블 읽기 가능 (기존 정책 유지)
-- 이미 존재할 것으로 예상

-- 2. 로그인한 사용자만 youtube-playlist 카테고리 추가 가능
CREATE POLICY "Authenticated users can insert youtube playlist links" 
ON links FOR INSERT 
WITH CHECK (
    category = 'youtube-playlist' AND
    auth.uid() IS NOT NULL
);

-- 3. 로그인한 사용자만 youtube-playlist 카테고리 수정 가능
CREATE POLICY "Authenticated users can update youtube playlist links" 
ON links FOR UPDATE 
USING (
    category = 'youtube-playlist' AND
    auth.uid() IS NOT NULL
);

-- 4. 로그인한 사용자만 youtube-playlist 카테고리 삭제 가능
CREATE POLICY "Authenticated users can delete youtube playlist links" 
ON links FOR DELETE 
USING (
    category = 'youtube-playlist' AND
    auth.uid() IS NOT NULL
);

-- 또는 모든 카테고리에 대해 로그인한 사용자가 관리할 수 있도록 하려면:
/*
-- 모든 로그인 사용자가 links 추가 가능
CREATE POLICY "Authenticated users can insert links" 
ON links FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- 모든 로그인 사용자가 links 수정 가능
CREATE POLICY "Authenticated users can update links" 
ON links FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- 모든 로그인 사용자가 links 삭제 가능
CREATE POLICY "Authenticated users can delete links" 
ON links FOR DELETE 
USING (auth.uid() IS NOT NULL);
*/