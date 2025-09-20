# 디버그 로깅 시스템 설정 가이드

## 1. Supabase 테이블 생성

Supabase 대시보드에서 SQL Editor를 열고 다음 SQL을 실행하세요:

```sql
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

-- 7일 이상 된 로그를 자동으로 삭제하는 함수 (선택사항)
CREATE OR REPLACE FUNCTION delete_old_debug_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM debug_logs 
    WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;
```

## 2. 사용 가능한 페이지들

### 디버그 로그 뷰어
- URL: `debug-viewer.html`
- 모든 디버그 로그를 실시간으로 확인
- 레벨, 소스별 필터링
- 검색 기능
- 자동 새로고침

### 테스트 페이지들
1. **Supabase 연결 테스트**: `test-supabase-simple.html`
   - 다양한 방법으로 Supabase 연결 테스트
   - 디버그 로그 자동 기록

2. **데이터 수집 테스트**: `test-data-collection.html`
   - Binance API 테스트
   - Supabase 연결 테스트
   - 데이터 저장 테스트
   - 기존 데이터 조회

3. **Historical 데이터 수집**: `fetch-historical-data.html`
   - 과거 데이터 수집 및 저장
   - 진행 상황 모니터링
   - 에러 로깅

## 3. 디버그 로거 사용법

JavaScript 코드에서:

```javascript
import { DebugLogger } from './debug-logger.js';

// 로거 초기화
const debugLogger = new DebugLogger(supabaseClient, 'your-source-name');

// 로그 기록
await debugLogger.info('정보 메시지');
await debugLogger.success('성공 메시지');
await debugLogger.warning('경고 메시지');
await debugLogger.error('에러 메시지', { errorCode: 500 });
```

## 4. 디버그 로그 확인

1. 메인 페이지(index.html)에서 우측 플로팅 버튼 중 터미널 아이콘 클릭
2. 또는 직접 `debug-viewer.html` 접속
3. 필터와 검색 기능으로 원하는 로그 찾기
4. 자동 새로고침 활성화로 실시간 모니터링

## 5. 주요 로그 소스

- `fetch-historical`: 과거 데이터 수집
- `daily-collection`: 일일 자동 수집
- `test`: 테스트 관련
- `supabase-test`: Supabase 연결 테스트
- `price-update`: 가격 업데이트
- `websocket`: WebSocket 연결 상태

## 6. 문제 해결

### 로그가 저장되지 않는 경우
1. Supabase 테이블이 제대로 생성되었는지 확인
2. RLS 정책이 올바르게 설정되었는지 확인
3. API 키가 올바른지 확인
4. 네트워크 연결 상태 확인

### 로그 뷰어가 작동하지 않는 경우
1. 브라우저 콘솔에서 에러 확인
2. Supabase 연결 상태 확인
3. 테이블 권한 확인