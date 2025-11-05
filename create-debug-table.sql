-- 디버깅 로그 테이블 생성
CREATE TABLE IF NOT EXISTS debug_logs (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    level VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
    source VARCHAR(100), -- 'fetch-historical', 'daily-collection', 'test', etc.
    message TEXT,
    data JSONB, -- 추가 데이터를 JSON 형태로 저장
    user_agent TEXT,
    ip_address INET,
    session_id VARCHAR(100)
);

-- 인덱스 생성 (빠른 검색을 위해)
CREATE INDEX idx_debug_logs_created_at ON debug_logs(created_at DESC);
CREATE INDEX idx_debug_logs_level ON debug_logs(level);
CREATE INDEX idx_debug_logs_source ON debug_logs(source);

-- RLS (Row Level Security) 활성화
ALTER TABLE debug_logs ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 로그를 추가할 수 있도록 정책 생성
CREATE POLICY "Allow anonymous inserts" ON debug_logs
    FOR INSERT TO anon
    WITH CHECK (true);

-- 모든 사용자가 로그를 읽을 수 있도록 정책 생성 (디버깅용)
CREATE POLICY "Allow anonymous reads" ON debug_logs
    FOR SELECT TO anon
    USING (true);

-- 7일 이상 된 로그를 자동으로 삭제하는 함수
CREATE OR REPLACE FUNCTION delete_old_debug_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM debug_logs 
    WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- 매일 실행되는 cron job 설정 (pg_cron extension 필요)
-- SELECT cron.schedule('delete-old-debug-logs', '0 0 * * *', 'SELECT delete_old_debug_logs();');