# Next.js 배포 가이드

## 로컬 테스트

1. 개발 서버 실행:
```bash
npm run dev
```

2. http://localhost:3000 에서 확인

## Netlify 배포

### 방법 1: Git 연동 (권장)

1. 이 폴더를 새로운 Git 저장소로 만들기:
```bash
git init
git add .
git commit -m "Initial Next.js migration"
```

2. GitHub에 새 저장소 생성 후 연결:
```bash
git remote add origin https://github.com/YOUR_USERNAME/crypto-price-monitor-nextjs.git
git push -u origin main
```

3. Netlify에서:
   - "Add new site" → "Import an existing project"
   - GitHub 저장소 선택
   - Build settings는 자동으로 감지됨
   - 환경 변수 설정 (이미 netlify.toml에 포함됨)

### 방법 2: 수동 배포

1. 빌드:
```bash
npm run build
```

2. Netlify CLI 설치:
```bash
npm install -g netlify-cli
```

3. 배포:
```bash
netlify deploy --prod
```

## 주의사항

- 기존 사이트와 도메인을 공유할 경우 주의
- Supabase 환경 변수가 올바른지 확인
- schedules 테이블이 Supabase에 생성되어 있어야 함

## 문제 해결

### 로딩 스피너 문제
- Next.js는 서버사이드 렌더링을 사용하므로 클라이언트 사이드 로딩 문제가 해결됨

### 인증 문제
- Supabase Auth가 제대로 설정되어 있는지 확인
- 로그인 후 새로고침해도 세션이 유지되는지 확인

### 데이터 로딩 문제
- 브라우저 개발자 도구에서 네트워크 탭 확인
- Supabase RLS 정책 확인