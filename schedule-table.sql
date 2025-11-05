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

-- 샘플 카테고리 (참고용)
-- 'general' - 일반
-- 'meeting' - 회의
-- 'personal' - 개인
-- 'work' - 업무
-- 'family' - 가족
-- 'health' - 건강
-- 'education' - 교육
-- 'entertainment' - 엔터테인먼트