-- 채팅 테이블 및 권한 수정 스크립트

-- 1. 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns  
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- 2. 현재 RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'messages';

-- 3. RLS 비활성화 후 다시 활성화
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 4. 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can read messages" ON messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON messages;
DROP POLICY IF EXISTS "Anyone can do anything" ON messages;

-- 5. 새로운 간단한 정책 생성
CREATE POLICY "Enable all access for everyone" ON messages
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- 6. browser_id 컬럼이 없으면 추가
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS browser_id VARCHAR(100);

-- 7. 테스트 메시지 삽입
INSERT INTO messages (message) VALUES 
('시스템: 채팅 테이블이 수정되었습니다.'),
('테스트: 이 메시지가 보이면 성공입니다.');

-- 8. 최근 메시지 확인
SELECT * FROM messages 
ORDER BY created_at DESC 
LIMIT 5;

-- 9. 총 메시지 수 확인
SELECT COUNT(*) as total_messages FROM messages;