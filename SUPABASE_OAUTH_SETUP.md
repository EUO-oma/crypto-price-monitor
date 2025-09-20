# Supabase OAuth 리다이렉트 URL 설정

## 문제
Google 로그인 후 무한 루프 발생 - admin-v3.html로 직접 리다이렉트하면 인증 체크에서 다시 login.html로 보내짐

## 해결책
OAuth 콜백을 처리하는 전용 페이지(auth-callback.html) 사용

## Supabase 대시보드 설정

1. [Supabase 대시보드](https://app.supabase.com) 로그인
2. 프로젝트 선택
3. **Authentication** → **URL Configuration**
4. **Redirect URLs**에 다음 URL 추가:
   ```
   https://euo.netlify.app/auth-callback.html
   http://localhost:8000/auth-callback.html
   http://localhost:5500/auth-callback.html
   ```

5. **Save** 클릭

## 작동 흐름

1. 사용자가 관리자 페이지 접근 시도
2. `admin-links.html`에서 인증 확인
3. 미인증 시 `login.html?redirect=목적페이지`로 이동
4. Google 로그인 클릭
5. Google OAuth 진행
6. `auth-callback.html`로 리다이렉트
7. 세션 확인 및 관리자 권한 체크
8. 원래 목적 페이지로 최종 리다이렉트

## 관련 파일
- `/auth-callback.html` - OAuth 콜백 처리 페이지
- `/login.html` - 로그인 페이지 (redirect 파라미터 지원)
- `/admin-links.html` - 관리자 인증 게이트웨이