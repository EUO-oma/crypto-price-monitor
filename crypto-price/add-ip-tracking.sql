-- IP 추적 및 브라우저 fingerprint 추가

-- 1. messages 테이블에 컬럼 추가
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS ip_hash VARCHAR(64),
ADD COLUMN IF NOT EXISTS browser_id VARCHAR(64),
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- 2. IP 해시를 자동으로 저장하는 함수 (Supabase Edge Function에서 IP 가져오기)
CREATE OR REPLACE FUNCTION get_client_ip()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    client_ip TEXT;
BEGIN
    -- Supabase는 request.headers에서 IP를 가져올 수 있음
    client_ip := current_setting('request.headers', true)::json->>'x-forwarded-for';
    
    IF client_ip IS NULL THEN
        client_ip := current_setting('request.headers', true)::json->>'x-real-ip';
    END IF;
    
    IF client_ip IS NULL THEN
        client_ip := 'unknown';
    END IF;
    
    -- IP의 첫 번째 부분만 가져오기 (프록시 체인의 경우)
    client_ip := split_part(client_ip, ',', 1);
    
    RETURN client_ip;
END;
$$;

-- 3. 메시지 삽입시 자동으로 IP 해시 생성하는 트리거
CREATE OR REPLACE FUNCTION set_message_metadata()
RETURNS TRIGGER AS $$
DECLARE
    client_ip TEXT;
BEGIN
    -- IP 가져오기
    client_ip := get_client_ip();
    
    -- IP를 SHA256으로 해시 (프라이버시 보호)
    -- 같은 IP는 같은 해시값을 가지므로 같은 사용자 식별 가능
    NEW.ip_hash := encode(digest(client_ip, 'sha256'), 'hex');
    
    -- User-Agent 저장 (브라우저 정보)
    NEW.user_agent := current_setting('request.headers', true)::json->>'user-agent';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 트리거 생성
DROP TRIGGER IF EXISTS set_message_metadata_trigger ON messages;
CREATE TRIGGER set_message_metadata_trigger
    BEFORE INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION set_message_metadata();

-- 5. 스팸 방지: 같은 IP에서 1분에 5개 이상 메시지 차단
CREATE OR REPLACE FUNCTION check_spam_limit()
RETURNS TRIGGER AS $$
DECLARE
    recent_count INTEGER;
    user_ip_hash TEXT;
BEGIN
    -- 현재 사용자의 IP 해시 계산
    user_ip_hash := encode(digest(get_client_ip(), 'sha256'), 'hex');
    
    -- 같은 IP에서 최근 1분간 메시지 수 확인
    SELECT COUNT(*) INTO recent_count
    FROM messages
    WHERE ip_hash = user_ip_hash
    AND created_at > NOW() - INTERVAL '1 minute';
    
    -- 5개 이상이면 차단
    IF recent_count >= 5 THEN
        RAISE EXCEPTION '너무 많은 메시지를 보내고 있습니다. 잠시 후 다시 시도해주세요.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. 스팸 체크 트리거
DROP TRIGGER IF EXISTS check_spam_trigger ON messages;
CREATE TRIGGER check_spam_trigger
    BEFORE INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION check_spam_limit();

-- 7. 통계 뷰: IP별 메시지 수 (관리자용)
CREATE OR REPLACE VIEW message_stats AS
SELECT 
    SUBSTRING(ip_hash, 1, 8) as ip_prefix,  -- IP 해시의 일부만 표시
    COUNT(*) as message_count,
    MAX(created_at) as last_message_time,
    MIN(created_at) as first_message_time
FROM messages
WHERE ip_hash IS NOT NULL
GROUP BY ip_hash
ORDER BY message_count DESC;

-- 8. 테스트
SELECT * FROM messages ORDER BY created_at DESC LIMIT 5;
SELECT * FROM message_stats LIMIT 10;