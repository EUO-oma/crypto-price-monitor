# Supabase 설정 체크리스트

## 1. Supabase Dashboard 확인사항

### A. Authentication → Providers → Google
1. Google Provider가 **활성화** 되어 있는지 확인
2. Client ID와 Client Secret이 올바르게 입력되어 있는지 확인

### B. Authentication → URL Configuration
1. **Site URL**: `https://euo.netlify.app` 
2. **Redirect URLs**에 다음이 포함되어 있는지 확인:
   ```
   https://euo.netlify.app/auth-callback.html
   ```

### C. Authentication → Settings
1. **Disable email confirmations**: 활성화 (선택사항)
2. **JWT expiry limit**: 3600 (기본값)

## 2. Google Cloud Console 확인사항

[Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials

### OAuth 2.0 Client ID 설정:
1. **Authorized JavaScript origins**:
   ```
   https://euo.netlify.app
   ```

2. **Authorized redirect URIs**:
   ```
   https://ddfnxbkiewolgweivomv.supabase.co/auth/v1/callback
   ```

## 3. Netlify 환경변수 확인

Netlify Dashboard → Site settings → Environment variables

필수 환경변수:
```
SUPABASE_URL=https://ddfnxbkiewolgweivomv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. 브라우저에서 디버그

1. 개발자 도구 열기 (F12)
2. Network 탭에서 실패하는 요청 확인
3. Console에서 에러 메시지 확인

### 자주 발생하는 에러:

**"Invalid Redirect URL"**
- Supabase의 Redirect URLs 설정 확인

**"OAuth error: redirect_uri_mismatch"**
- Google Cloud Console의 Authorized redirect URIs 확인

**"No provider found for this request"**
- Supabase에서 Google Provider 활성화 확인

## 5. 테스트 순서

1. 브라우저 캐시 삭제 (Ctrl+Shift+Delete)
2. https://euo.netlify.app/admin-v3.html 접속
3. Google 로그인 버튼 클릭
4. 에러 발생 시 Console 로그 확인