-- 암호화폐 가격 동기화 관련 테이블 및 설정 제거

-- 1. 트리거가 있다면 먼저 제거
DROP TRIGGER IF EXISTS update_price_history_updated_at ON price_history;

-- 2. 함수가 있다면 제거
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 3. RLS 정책 제거
DROP POLICY IF EXISTS "Anyone can read price history" ON price_history;
DROP POLICY IF EXISTS "Anyone can insert price history" ON price_history;
DROP POLICY IF EXISTS "Anyone can update price history" ON price_history;
DROP POLICY IF EXISTS "Enable read access for all users" ON price_history;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON price_history;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON price_history;

-- 4. 인덱스 제거
DROP INDEX IF EXISTS idx_price_history_symbol;
DROP INDEX IF EXISTS idx_price_history_date;
DROP INDEX IF EXISTS idx_price_history_symbol_date;

-- 5. 테이블 제거
DROP TABLE IF EXISTS price_history CASCADE;

-- 6. 관련 스케줄된 작업이 있다면 제거 (pg_cron 사용 시)
-- SELECT cron.unschedule('price-history-sync');

-- 7. 확인
SELECT 'Price history table and related objects have been removed successfully' as message;