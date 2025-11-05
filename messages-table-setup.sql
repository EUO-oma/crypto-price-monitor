-- messages 테이블 사용을 위한 설정 (chat_messages 대신)

-- 1. 테이블 구조 확인 및 필요시 컬럼 추가
ALTER TABLE messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE messages ADD COLUMN IF NOT EXISTS ip_hash VARCHAR(64);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- 3. RLS 활성화
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 4. 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON messages;
DROP POLICY IF EXISTS "Enable insert for all users" ON messages;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON messages;
DROP POLICY IF EXISTS "Anyone can read messages" ON messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON messages;

-- 5. 새로운 정책 생성 (anon 키로도 작동하도록)
-- 읽기: 모든 사용자 허용
CREATE POLICY "Anyone can read messages" ON messages
    FOR SELECT 
    USING (true);

-- 쓰기: anon 키를 포함한 모든 사용자 허용
CREATE POLICY "Anyone can insert messages" ON messages
    FOR INSERT 
    WITH CHECK (
        LENGTH(message) <= 200
    );

-- 6. 7일 이상 된 메시지 자동 삭제 함수
CREATE OR REPLACE FUNCTION delete_old_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM messages
    WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$;

-- 7. 최대 100개 메시지만 유지하는 트리거 함수
CREATE OR REPLACE FUNCTION limit_messages()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM messages
    WHERE id IN (
        SELECT id FROM messages
        ORDER BY created_at DESC
        OFFSET 100
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. 트리거 생성
DROP TRIGGER IF EXISTS limit_messages_trigger ON messages;
CREATE TRIGGER limit_messages_trigger
    AFTER INSERT ON messages
    FOR EACH STATEMENT
    EXECUTE FUNCTION limit_messages();

-- 9. 테스트: 익명으로 메시지 삽입 가능한지 확인
INSERT INTO messages (message) VALUES ('테스트 메시지 - 이 메시지가 보이면 설정 성공!');

-- 10. 권한 확인 쿼리
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
WHERE tablename = 'messages';

-- 11. 테이블 RLS 상태 확인
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'messages';