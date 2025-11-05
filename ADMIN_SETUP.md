# 🔐 관리자 설정 가이드

## 1. 관리자 이메일 설정하기

`auth-helper.js` 파일을 열고 29-31번 줄에서 관리자 이메일을 설정하세요:

```javascript
const allowedEmails = [
    'your-email@gmail.com',  // 여기에 관리자 이메일을 추가하세요
];
```

예시:
```javascript
const allowedEmails = [
    'admin@gmail.com',
    'manager@gmail.com'  // 여러 명의 관리자 추가 가능
];
```

## 2. 변경사항 적용하기

1. 파일을 저장합니다
2. Git에 커밋하고 푸시합니다:
   ```bash
   git add auth-helper.js
   git commit -m "관리자 이메일 설정"
   git push origin main
   ```
3. Netlify가 자동으로 배포됩니다

## 3. 관리자 전용 페이지 접근

이제 다음 페이지들은 관리자만 접근 가능합니다:
- 링크 모음 (`/links.html`)
- 즐겨찾기 (`/supabase-links.html`)
- 관리자 설정 (`/admin-v3.html`)

## 4. 문제 해결

### 로그인이 안 되는 경우
1. Supabase 대시보드에서 Authentication > Providers 확인
2. Google OAuth가 활성화되어 있는지 확인
3. 이메일/비밀번호 로그인이 활성화되어 있는지 확인

### 관리자 인증이 안 되는 경우
1. `auth-helper.js`에 이메일이 정확히 입력되었는지 확인
2. 브라우저 캐시를 지우고 다시 시도
3. 개발자 도구 콘솔에서 에러 메시지 확인

## 5. 보안 권장사항

1. **이메일 목록은 절대 공개하지 마세요**
2. **정기적으로 관리자 목록을 검토하세요**
3. **불필요한 관리자는 제거하세요**

## 6. 추가 설정 (선택사항)

### 환경변수 사용하기
더 안전한 방법은 환경변수를 사용하는 것입니다:

1. Netlify 대시보드 > Site settings > Environment variables
2. `ADMIN_EMAILS` 변수 추가 (쉼표로 구분)
3. 코드에서 환경변수 사용하도록 수정

### Supabase RLS (Row Level Security) 설정
1. Supabase 대시보드에서 각 테이블의 RLS 활성화
2. 관리자만 데이터를 수정할 수 있도록 정책 설정

---

⚠️ **중요**: 이 파일(`ADMIN_SETUP.md`)은 배포하지 마세요. `.gitignore`에 추가하는 것을 권장합니다.