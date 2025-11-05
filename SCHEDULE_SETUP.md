# 일정관리 시스템 설정 가이드

## 1. Supabase 설정

### 1.1 테이블 생성
Supabase Dashboard에서 SQL Editor로 이동하여 `schedule-table.sql` 파일의 내용을 실행하세요.

또는 아래 SQL을 직접 실행하세요:

```sql
-- UUID 익스텐션 활성화 (UUID 생성을 위해 필요)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 일정 관리 테이블 생성
CREATE TABLE IF NOT EXISTS schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    location VARCHAR(255),
    category VARCHAR(50) DEFAULT 'general',
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    reminder_enabled BOOLEAN DEFAULT false,
    reminder_date TIMESTAMP,
    color VARCHAR(7) DEFAULT '#2196f3',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- 정책: 누구나 일정을 읽을 수 있음 (공개 캘린더인 경우)
CREATE POLICY "Schedules are viewable by everyone" ON schedules
    FOR SELECT USING (true);

-- 정책: 인증된 사용자만 일정을 추가할 수 있음
CREATE POLICY "Authenticated users can insert schedules" ON schedules
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 정책: 일정 작성자만 수정할 수 있음
CREATE POLICY "Users can update own schedules" ON schedules
    FOR UPDATE USING (auth.uid() = user_id);

-- 정책: 일정 작성자만 삭제할 수 있음
CREATE POLICY "Users can delete own schedules" ON schedules
    FOR DELETE USING (auth.uid() = user_id);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_schedules_event_date ON schedules(event_date);
CREATE INDEX idx_schedules_user_id ON schedules(user_id);
CREATE INDEX idx_schedules_category ON schedules(category);
CREATE INDEX idx_schedules_status ON schedules(status);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 1.2 인증 설정 확인
1. Supabase Dashboard → Authentication → Providers
2. Email 인증이 활성화되어 있는지 확인
3. 필요시 Google OAuth 등 추가 인증 방법 설정

## 2. 문제 해결

### 로그인이 안 되는 경우
1. Supabase Dashboard → Authentication → Users 확인
2. 이메일 인증이 활성화되어 있는지 확인
3. SMTP 설정이 완료되어 있는지 확인 (이메일 인증용)

### 일정이 저장되지 않는 경우
1. 브라우저 개발자 도구 콘솔에서 에러 확인
2. Supabase Dashboard → Table Editor → schedules 테이블 확인
3. RLS 정책이 올바르게 설정되어 있는지 확인

### "Table not found" 에러가 나는 경우
1. 위의 SQL을 Supabase SQL Editor에서 실행
2. 실행 후 브라우저 새로고침

## 3. 사용 방법

1. 사이트 접속: https://euo.netlify.app
2. 로그인 버튼 클릭
3. 이메일/비밀번호로 회원가입 또는 로그인
4. "일정 추가" 버튼으로 새 일정 등록
5. 목록/캘린더 뷰 전환 가능

## 4. 디버깅

브라우저 콘솔에서 다음 로그 확인 가능:
- Page loaded, initializing...
- Supabase library loaded
- Checking authentication...
- Loading schedules...
- 기타 상세 로그

문제 발생시 콘솔 로그를 확인하여 원인 파악 가능