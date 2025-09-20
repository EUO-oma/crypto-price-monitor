# 🔐 Netlify 환경 변수 설정 가이드

## 1. Netlify 대시보드에서 환경 변수 추가하기

1. [Netlify 대시보드](https://app.netlify.com)에 로그인
2. 해당 사이트 선택
3. **Site configuration** → **Environment variables** 클릭
4. **Add a variable** 버튼 클릭
5. 다음 환경 변수들을 추가:

### Supabase 설정
- `SUPABASE_URL`: https://ddfnxbkiewolgweivomv.supabase.co
- `SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### Firebase 설정  
- `FIREBASE_API_KEY`: AIzaSyA6zB_snzOh_e5tG6_-uK64g6dwL5pzU4c
- `FIREBASE_AUTH_DOMAIN`: crypto-monitor-84bdb.firebaseapp.com
- `FIREBASE_DATABASE_URL`: https://crypto-monitor-84bdb-default-rtdb.firebaseio.com
- `FIREBASE_PROJECT_ID`: crypto-monitor-84bdb
- `FIREBASE_STORAGE_BUCKET`: crypto-monitor-84bdb.firebasestorage.app
- `FIREBASE_MESSAGING_SENDER_ID`: 146592267275
- `FIREBASE_APP_ID`: 1:146592267275:web:916c54658889be5dab9b0e
- `FIREBASE_MEASUREMENT_ID`: G-TTGCF3YWWJ

### 관리자 설정
- `ADMIN_EMAILS`: your-email@gmail.com,other-admin@gmail.com (쉼표로 구분)
- `DEV_MODE`: false

## 2. 빌드 명령어 설정 확인

Site configuration → Build & deploy → Build settings:
- **Build command**: `node build-config.js`
- **Publish directory**: `.` (현재 디렉토리)

## 3. 배포 트리거

환경 변수를 추가한 후:
1. **Deploys** 탭으로 이동
2. **Trigger deploy** → **Deploy site** 클릭
3. 빌드 로그에서 "✅ config-env.js generated from environment variables" 확인

## 4. 로컬 개발 환경

로컬에서 개발할 때는 `config.js` 파일을 사용:

```bash
# config.example.js를 복사
cp config.example.js config.js

# config.js 편집하여 실제 키 값 입력
```

## 5. 보안 확인사항

✅ `config.js`가 `.gitignore`에 포함되어 있는지 확인
✅ GitHub에 API 키가 노출되지 않았는지 확인
✅ Netlify 환경 변수는 빌드 시에만 접근 가능
✅ 클라이언트 측 키만 사용 (서버 측 비밀 키 사용 금지)

## 6. 문제 해결

### 환경 변수가 적용되지 않을 때:
1. 캐시 클리어: Deploys → Trigger deploy → Clear cache and deploy site
2. 빌드 로그 확인: 환경 변수가 올바르게 로드되었는지 확인
3. 브라우저 캐시 삭제 후 재시도

### 로컬에서 테스트:
```bash
# 환경 변수를 설정하고 build-config.js 실행
SUPABASE_URL="your-url" SUPABASE_ANON_KEY="your-key" node build-config.js
```