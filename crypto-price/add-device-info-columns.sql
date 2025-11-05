-- 메시지 테이블에 디바이스 정보 컬럼 추가

-- 1. 새 컬럼들 추가
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS device_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS browser_name VARCHAR(50),
ADD COLUMN IF NOT EXISTS os_name VARCHAR(50),
ADD COLUMN IF NOT EXISTS screen_size VARCHAR(20);

-- 2. 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns  
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- 3. 테스트 메시지
INSERT INTO messages (message, device_type, browser_name, os_name) VALUES 
('디바이스 정보 테스트', 'Desktop', 'Chrome', 'Windows');

-- 4. 최근 메시지 확인 (디바이스 정보 포함)
SELECT id, message, device_type, browser_name, os_name, screen_size, created_at
FROM messages 
ORDER BY created_at DESC 
LIMIT 10;