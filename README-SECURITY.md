# 🔐 보안 가이드

## API 키 관리

이 프로젝트는 Supabase와 Firebase API 키를 사용합니다. 보안을 위해 다음 사항을 반드시 지켜주세요:

### 1. config.js 설정

1. `config.example.js`를 복사해서 `config.js`로 이름 변경
2. 실제 API 키 값 입력
3. **절대 GitHub에 커밋하지 마세요!** (`.gitignore`에 추가됨)

### 2. Netlify 환경 변수 설정 (권장)

더 안전한 방법은 Netlify 환경 변수를 사용하는 것입니다:

1. Netlify 대시보드에서 Site settings → Environment variables
2. 다음 변수들 추가:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `FIREBASE_API_KEY`
   - 기타 필요한 변수들

3. `config.js`를 수정해서 환경 변수 사용:
```javascript
window.APP_CONFIG = {
    SUPABASE: {
        URL: process.env.SUPABASE_URL || 'fallback-url',
        ANON_KEY: process.env.SUPABASE_ANON_KEY || 'fallback-key'
    }
    // ...
};
```

### 3. 클라이언트 측 API 키 보안

현재 사용 중인 키들은 클라이언트 측에서 사용되는 공개 키입니다:
- **Supabase anon key**: Row Level Security(RLS)로 보호됨
- **Firebase API key**: Security Rules로 보호됨

이 키들이 노출되어도 다음 설정이 되어있다면 안전합니다:
- Supabase RLS 정책이 올바르게 설정됨
- Firebase Security Rules가 올바르게 설정됨
- 관리자 이메일 화이트리스트 사용

### 4. 이미 노출된 경우

만약 실수로 API 키가 GitHub에 커밋된 경우:

1. **즉시 키 재생성**:
   - Supabase: Project Settings → API → Regenerate anon key
   - Firebase: Project Settings → General → Web API Key (재생성 불가, 프로젝트 재생성 필요)

2. **Git 기록에서 제거**:
   ```bash
   # BFG Repo-Cleaner 사용 (권장)
   bfg --delete-files config.js
   
   # 또는 git filter-branch 사용
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch config.js" \
   --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push**:
   ```bash
   git push origin --force --all
   git push origin --force --tags
   ```

### 5. 추가 보안 조치

- 정기적으로 API 키 순환
- 최소 권한 원칙 적용
- 프로덕션과 개발 환경 키 분리
- 접근 로그 모니터링

### 6. 관리자 이메일 설정

`config.js`의 `ADMIN.ALLOWED_EMAILS`에 관리자 이메일을 추가하세요:

```javascript
ADMIN: {
    ALLOWED_EMAILS: [
        'your-email@gmail.com'
    ],
    DEV_MODE: false  // 프로덕션에서는 반드시 false로 설정
}
```