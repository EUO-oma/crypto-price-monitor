# Crypto Price Monitor - Next.js Version

Next.js로 재구축된 일정 관리 및 정보 허브 애플리케이션입니다.

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Hosting**: Netlify

## 주요 기능

- 📅 일정 관리 (CRUD)
- 🔐 사용자 인증
- 📊 암호화폐 가격 모니터링
- 📺 YouTube 플레이리스트
- 🌍 세계 시계
- 🔖 즐겨찾기 관리
- 💬 실시간 채팅

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 빌드

```bash
npm run build
```

## 프로젝트 구조

```
src/
├── app/              # Next.js App Router 페이지
│   ├── page.tsx      # 홈페이지 (일정 관리)
│   ├── info-hub/     # 정보 허브
│   └── ...           # 기타 페이지
├── components/       # 재사용 가능한 컴포넌트
├── lib/             # 유틸리티 함수 및 설정
└── types/           # TypeScript 타입 정의
```

## 배포

Netlify에 자동 배포됩니다. `main` 브랜치에 push하면 자동으로 빌드 및 배포가 실행됩니다.

## 마이그레이션 노트

이 프로젝트는 기존 정적 HTML 사이트에서 Next.js로 마이그레이션되었습니다. 
주요 개선 사항:

- 더 나은 성능 (SSR/SSG)
- 향상된 에러 처리
- TypeScript 타입 안정성
- 모듈화된 컴포넌트 구조
- 더 나은 개발 경험