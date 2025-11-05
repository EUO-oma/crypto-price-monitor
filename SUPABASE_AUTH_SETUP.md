# Supabase Google Auth 설정 가이드

## 1. Supabase에서 Google OAuth 활성화

### Supabase 대시보드에서:
1. **Authentication** → **Providers** 메뉴로 이동
2. **Google** 찾아서 클릭
3. **Enable Google** 토글 ON
4. 아래 정보를 복사해두기:
   - Callback URL (나중에 Google에 등록)

## 2. Google Cloud Console 설정

### Google Cloud Console에서:
1. https://console.cloud.google.com 접속
2. 프로젝트 생성 또는 선택
3. **API 및 서비스** → **사용자 인증 정보** 
4. **+ 사용자 인증 정보 만들기** → **OAuth 클라이언트 ID**
5. 설정:
   - 애플리케이션 유형: **웹 애플리케이션**
   - 이름: Crypto Price Monitor (원하는 이름)
   - 승인된 JavaScript 원본:
     - `https://ddfnxbkiewolgweivomv.supabase.co`
     - `https://euo.netlify.app`
     - `http://localhost:3000` (테스트용)
   - 승인된 리디렉션 URI:
     - Supabase에서 복사한 Callback URL 붙여넣기
     - 예: `https://ddfnxbkiewolgweivomv.supabase.co/auth/v1/callback`

6. **만들기** 클릭
7. 생성된 **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사

## 3. Supabase에 Google 인증 정보 입력

### Supabase 대시보드로 돌아가서:
1. **Google Provider** 설정에서:
   - **Client ID**: Google에서 복사한 클라이언트 ID 붙여넣기
   - **Client Secret**: Google에서 복사한 클라이언트 보안 비밀번호 붙여넣기
2. **Save** 클릭

## 4. URL 설정

### Supabase 대시보드에서:
1. **Authentication** → **URL Configuration**
2. 설정:
   - Site URL: `https://euo.netlify.app`
   - Redirect URLs에 추가:
     - `https://euo.netlify.app/crypto-price/admin-v3.html`
     - `https://euo.netlify.app/crypto-price/login.html`

## 5. RLS 정책 업데이트 (SQL Editor에서 실행)

```sql
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON links;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON links;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON links;

-- 새 정책: 로그인한 사용자만 수정 가능
CREATE POLICY "Enable insert for authenticated users" ON links
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON links
    FOR UPDATE TO authenticated
    USING (true);

CREATE POLICY "Enable delete for authenticated users" ON links
    FOR DELETE TO authenticated
    USING (true);
```

## 6. 특정 이메일만 허용 (선택사항)

`auth-helper.js` 파일에서 수정:
```javascript
const allowedEmails = [
    'your-email@gmail.com', // 본인 이메일로 변경
];
```

## 7. 테스트

1. https://euo.netlify.app/login.html 접속
2. Google로 로그인 시도
3. 성공하면 admin-v3.html로 자동 이동

## 문제 해결

### "Invalid Redirect URL" 오류
- Supabase URL Configuration에서 Redirect URLs 확인

### "Google 로그인 실패" 오류
- Google Cloud Console에서 승인된 JavaScript 원본 확인
- Supabase에서 Client ID/Secret 확인

### "접근 권한 없음" 오류
- auth-helper.js에서 allowedEmails 확인