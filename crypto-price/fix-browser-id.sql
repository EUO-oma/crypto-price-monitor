-- browser_id 컬럼 추가 (없으면)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS browser_id VARCHAR(100);

-- 테이블 구조 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- RLS 정책 재확인
SELECT * FROM pg_policies WHERE tablename = 'messages';

-- 테스트 메시지
INSERT INTO messages (message, browser_id) 
VALUES ('테스트 메시지 - browser_id 추가 확인', 'test-user-123');

-- 확인
SELECT * FROM messages ORDER BY created_at DESC LIMIT 5;