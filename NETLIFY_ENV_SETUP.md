# Netlify 환경 변수 설정 가이드

## 🚨 중요: "인증처리중 로그인 실패" 오류 해결 방법

이 오류는 Netlify에서 환경 변수가 제대로 설정되지 않아서 발생합니다.

### 🔥 빠른 해결책 (이미 적용됨)
`supabase-init.js` 파일을 추가하여 환경 변수 없이도 작동하도록 fallback을 구현했습니다. 
하지만 보안을 위해 아래의 환경 변수 설정을 권장합니다.

## 필수 환경 변수 설정

### 1. Netlify 대시보드에서 설정하기

1. [Netlify](https://app.netlify.com) 로그인
2. 해당 사이트 선택
3. **Site configuration** → **Environment variables** 로 이동
4. 다음 환경 변수들을 추가:

```
SUPABASE_URL=https://ddfnxbkiewolgweivomv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZm54YmtpZXdvbGd3ZWl2b212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzI3NzYsImV4cCI6MjA2NzIwODc3Nn0.YCS2UH6YWarPX3C2ryFUUQnFA-3er_ZQomf_mccjmD8

FIREBASE_API_KEY=AIzaSyA6zB_snzOh_e5tG6_-uK64g6dwL5pzU4c
FIREBASE_AUTH_DOMAIN=crypto-monitor-84bdb.firebaseapp.com
FIREBASE_DATABASE_URL=https://crypto-monitor-84bdb-default-rtdb.firebaseio.com
FIREBASE_PROJECT_ID=crypto-monitor-84bdb
FIREBASE_STORAGE_BUCKET=crypto-monitor-84bdb.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=146592267275
FIREBASE_APP_ID=1:146592267275:web:916c54658889be5dab9b0e

ADMIN_EMAILS=your-email@gmail.com
DEV_MODE=false
```

### 2. Netlify CLI로 설정하기 (대안)

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 로그인
netlify login

# 사이트 연결
netlify link

# 환경 변수 설정
netlify env:set SUPABASE_URL "https://ddfnxbkiewolgweivomv.supabase.co"
netlify env:set SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZm54YmtpZXdvbGd3ZWl2b212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzI3NzYsImV4cCI6MjA2NzIwODc3Nn0.YCS2UH6YWarPX3C2ryFUUQnFA-3er_ZQomf_mccjmD8"
# ... (나머지 변수들도 동일하게 설정)
```

## 설정 확인 방법

### 1. 빌드 로그 확인
- Netlify 대시보드 → **Deploys** → 최신 배포 클릭
- 빌드 로그에서 다음과 같은 메시지 확인:

```
🔍 Checking for required environment variables:
  ✅ SUPABASE_URL: Set (https://dd...)
  ✅ SUPABASE_ANON_KEY: Set (eyJhbGciOi...)
```

### 2. 브라우저 개발자 도구에서 확인
1. 배포된 사이트 방문
2. F12 (개발자 도구) 열기
3. Console 탭에서 오류 메시지 확인
4. Network 탭에서 `config-env.js` 파일 내용 확인

## 문제 해결

### "Supabase 초기화 시간 초과" 오류가 계속 발생하는 경우:

1. **환경 변수가 제대로 설정되었는지 확인**
   - Netlify 대시보드에서 모든 필수 변수가 있는지 확인
   - 값에 따옴표가 포함되지 않았는지 확인 (따옴표 제거 필요)

2. **재배포 시도**
   - 환경 변수 설정 후 반드시 재배포 필요
   - Netlify 대시보드 → **Deploys** → **Trigger deploy** → **Deploy site**

3. **캐시 문제 해결**
   - 브라우저 캐시 삭제 (Ctrl+Shift+Delete)
   - 시크릿 모드에서 테스트

4. **빌드 명령어 확인**
   - `netlify.toml` 파일에 `command = "node build-config.js"` 확인

## 로컬 개발 vs 프로덕션

- **로컬 개발**: `config.js` 파일 사용
- **Netlify (프로덕션)**: 환경 변수 → `config-env.js` 자동 생성

## 보안 주의사항

⚠️ **중요**: 
- `config.js` 파일은 절대 Git에 커밋하지 마세요
- `.gitignore`에 `config.js`가 포함되어 있는지 확인
- 환경 변수는 Netlify 대시보드에서만 관리

## 추가 도움말

문제가 지속되면 다음을 확인하세요:
1. Supabase 대시보드에서 프로젝트가 활성화되어 있는지
2. API 키가 올바른지
3. Supabase URL이 정확한지

지원이 필요하면 Netlify 지원팀이나 Supabase 문서를 참조하세요.