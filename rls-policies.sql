-- RLS (Row Level Security) 정책 설정
-- Supabase SQL Editor에서 실행하세요

-- 1. links 테이블에 RLS 활성화
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- 2. 기존 정책 모두 삭제 (초기화)
DROP POLICY IF EXISTS "Enable read access for all users" ON links;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON links;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON links;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON links;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON links;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON links;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON links;

-- 3. 새로운 정책 생성

-- 모든 사용자가 읽기 가능 (메인 페이지에서 링크 보기)
CREATE POLICY "Enable read access for all users" ON links
    FOR SELECT 
    USING (true);

-- 로그인한 사용자만 추가 가능
CREATE POLICY "Enable insert for authenticated users" ON links
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- 로그인한 사용자만 수정 가능  
CREATE POLICY "Enable update for authenticated users" ON links
    FOR UPDATE 
    TO authenticated
    USING (true);

-- 로그인한 사용자만 삭제 가능
CREATE POLICY "Enable delete for authenticated users" ON links
    FOR DELETE 
    TO authenticated
    USING (true);

-- 4. 정책 확인 (선택사항)
-- 아래 쿼리를 실행하면 설정된 정책을 확인할 수 있습니다
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'links';