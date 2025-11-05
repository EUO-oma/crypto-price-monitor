-- RLS 정책 수정 - 모든 사용자가 읽기 가능하도록 설정

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON links;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON links;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON links;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON links;

-- 새 정책 생성
-- 1. 모든 사용자가 읽기 가능 (anon 키로도 접근 가능)
CREATE POLICY "Enable read access for all users" ON links
    FOR SELECT 
    USING (true);

-- 2. 인증된 사용자만 추가 가능
CREATE POLICY "Enable insert for authenticated users" ON links
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- 3. 인증된 사용자만 수정 가능
CREATE POLICY "Enable update for authenticated users" ON links
    FOR UPDATE 
    TO authenticated
    USING (true);

-- 4. 인증된 사용자만 삭제 가능
CREATE POLICY "Enable delete for authenticated users" ON links
    FOR DELETE 
    TO authenticated
    USING (true);

-- RLS 상태 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'links';

-- 테이블의 RLS 상태 확인
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'links';