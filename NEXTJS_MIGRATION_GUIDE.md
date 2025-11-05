# Next.js 마이그레이션 가이드

## 현재 상황
- 현재: 정적 HTML/CSS/JS 사이트
- Supabase를 백엔드로 사용 중
- Netlify에서 호스팅 중

## Next.js로 마이그레이션하는 이유
1. 더 나은 성능 (SSR/SSG)
2. 더 나은 개발 경험
3. TypeScript 지원
4. API Routes를 통한 백엔드 로직
5. 더 나은 에러 처리

## 마이그레이션 단계

### 1단계: Next.js 프로젝트 생성
```bash
npx create-next-app@latest crypto-price-monitor-next --typescript --tailwind --app
```

### 2단계: 주요 페이지 구조
```
app/
├── layout.tsx          # 공통 레이아웃
├── page.tsx           # 홈페이지 (일정 관리)
├── info-hub/
│   └── page.tsx       # 정보 허브
├── crypto/
│   └── page.tsx       # 암호화폐
├── youtube/
│   └── page.tsx       # YouTube 플레이어
├── world-clock/
│   └── page.tsx       # 세계 시계
├── bookmarks/
│   └── page.tsx       # 즐겨찾기
└── chat/
    └── page.tsx       # 채팅

components/
├── Navigation.tsx     # 네비게이션 바
├── ScheduleCard.tsx   # 일정 카드
├── LoadingSpinner.tsx # 로딩 스피너
└── AuthModal.tsx      # 인증 모달
```

### 3단계: 환경 변수 설정
`.env.local` 파일:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ddfnxbkiewolgweivomv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4단계: Supabase 클라이언트 설정
`lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### 5단계: 일정 관리 페이지 예시
`app/page.tsx`:
```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import ScheduleCard from '@/components/ScheduleCard'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadSchedules()
  }, [])

  async function loadSchedules() {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('event_date', { ascending: true })
      
      if (error) throw error
      setSchedules(data || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div>Error: {error}</div>
  if (schedules.length === 0) return <div>일정이 없습니다</div>

  return (
    <div className="grid gap-4">
      {schedules.map(schedule => (
        <ScheduleCard key={schedule.id} schedule={schedule} />
      ))}
    </div>
  )
}
```

### 6단계: Netlify 배포 설정
`netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### 7단계: 마이그레이션 순서
1. 프로젝트 구조 설정
2. 공통 컴포넌트 이전
3. 페이지별 기능 이전
4. 스타일 이전 (Tailwind CSS 사용)
5. 테스트 및 디버깅
6. 배포

## 예상 작업 시간
- 전체 마이그레이션: 2-3일
- 기본 기능만 이전: 1일

## 주의사항
1. 모든 클라이언트 사이드 코드는 'use client' 지시문 필요
2. 환경 변수는 NEXT_PUBLIC_ 접두사 필요
3. 정적 파일은 public/ 폴더로 이동
4. API 호출은 API Routes로 이전 권장

## 대안
현재 JavaScript 오류만 해결하고 싶다면:
1. `simple-index.html` 사용하여 문제 진단
2. 기존 `index.html`의 초기화 로직 수정
3. 에러 처리 개선