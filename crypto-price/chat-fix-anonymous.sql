-- 익명 채팅 권한 수정 및 IP 보호 설정

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Enable insert for all users" ON chat_messages;

-- 익명 사용자도 메시지 추가 가능하도록 수정
CREATE POLICY "Enable insert for anonymous users" ON chat_messages
    FOR INSERT 
    WITH CHECK (
        -- 메시지 길이 제한 (최대 200자)
        LENGTH(message) <= 200
        -- anon 키로도 삽입 가능
        AND true
    );

-- IP 해시를 자동으로 생성하는 함수 (클라이언트에서 IP를 보내지 않음)
CREATE OR REPLACE FUNCTION set_ip_hash()
RETURNS TRIGGER AS $$
BEGIN
    -- Supabase는 request.headers를 통해 IP를 가져올 수 있음
    -- IP를 SHA256으로 해시하여 저장 (IP 자체는 저장하지 않음)
    NEW.ip_hash := encode(
        digest(
            COALESCE(
                current_setting('request.headers', true)::json->>'x-forwarded-for',
                current_setting('request.headers', true)::json->>'x-real-ip',
                'anonymous'
            ),
            'sha256'
        ),
        'hex'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성 (메시지 삽입시 자동으로 IP 해시 생성)
DROP TRIGGER IF EXISTS set_ip_hash_trigger ON chat_messages;
CREATE TRIGGER set_ip_hash_trigger
    BEFORE INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION set_ip_hash();

-- 스팸 방지를 위한 Rate Limiting 함수
CREATE OR REPLACE FUNCTION check_message_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    recent_count INTEGER;
BEGIN
    -- 같은 IP 해시에서 1분 내 메시지 수 확인
    SELECT COUNT(*) INTO recent_count
    FROM chat_messages
    WHERE ip_hash = NEW.ip_hash
    AND created_at > NOW() - INTERVAL '1 minute';
    
    -- 1분에 5개 이상 메시지 차단
    IF recent_count >= 5 THEN
        RAISE EXCEPTION 'Too many messages. Please wait a moment.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Rate Limiting 트리거
DROP TRIGGER IF EXISTS check_rate_limit_trigger ON chat_messages;
CREATE TRIGGER check_rate_limit_trigger
    BEFORE INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION check_message_rate_limit();

-- 테스트: 익명으로 메시지 삽입 가능한지 확인
-- INSERT INTO chat_messages (message) VALUES ('테스트 메시지');