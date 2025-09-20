# 🔧 문제 해결 기록

## Supabase 초기화 시간 초과 문제 (2025-09-20)

### 문제 상황
- **증상**: 로그인 시도 시 "Supabase 초기화 시간 초과" 오류 발생
- **원인**: Netlify 환경 변수가 제대로 로드되지 않음

### 근본 원인 분석

1. **환경 변수 미설정**
   - Netlify에 환경 변수가 설정되어 있지만 빌드 시 사용되지 않음
   - `config-env.js` 파일이 생성되지 않아 Supabase 초기화 실패

2. **빌드 명령어 누락**
   - `netlify.toml`이 없어서 빌드 스크립트가 실행되지 않음
   - `node build-config.js` 명령어가 실행되지 않아 환경 변수가 JavaScript로 변환되지 않음

3. **변수 충돌 문제**
   - 여러 파일에서 동일한 변수를 재선언
   - `config.js`와 `config-loader.js` 간의 충돌
   - `index.html`에 하드코딩된 자격증명

### 해결 과정

#### 1. 중앙 설정 시스템 구축
```javascript
// config.js - 로컬 개발용
// config-loader.js - 환경 변수와 로컬 설정 통합
// config-env.js - Netlify 빌드 시 자동 생성
```

#### 2. 빌드 스크립트 생성
```javascript
// build-config.js
// Netlify 환경 변수를 읽어서 config-env.js 생성
// 모든 HTML 파일에 자동으로 추가
```

#### 3. Netlify 설정 추가
```toml
# netlify.toml
[build]
  command = "node build-config.js"
  publish = "."
```

#### 4. 변수 충돌 해결
- `config-loader.js`에서 이미 존재하는 변수는 덮어쓰지 않도록 수정
- `index.html`의 하드코딩된 자격증명 제거
- 중복된 초기화 코드 정리

#### 5. 필요한 파일 추가
- `package.json` 생성 (Node.js 명령어 실행을 위해)
- `.gitignore`에 보안 파일 추가

### 최종 해결책

1. **Netlify 환경 변수 설정**
   ```
   SUPABASE_URL = https://ddfnxbkiewolgweivomv.supabase.co
   SUPABASE_ANON_KEY = eyJhbGc...
   ADMIN_EMAILS = your-email@gmail.com
   ```

2. **빌드 명령어 설정**
   - `netlify.toml` 파일로 자동 설정
   - 또는 Netlify 대시보드에서 수동 설정

3. **파일 로드 순서**
   ```html
   <script src="config-env.js"></script>      <!-- Netlify에서 생성 -->
   <script src="config-loader.js"></script>   <!-- 설정 통합 -->
   <script src="auth-helper.js"></script>     <!-- 인증 헬퍼 -->
   ```

### 교훈

1. **환경 변수 관리**
   - 민감한 정보는 절대 하드코딩하지 않기
   - 환경별로 다른 설정 사용하기
   - `.gitignore` 활용하기

2. **빌드 프로세스**
   - `netlify.toml`로 빌드 설정 명시하기
   - 빌드 로그 확인 습관화
   - 로컬과 프로덕션 환경 분리

3. **디버깅 팁**
   - 브라우저 콘솔에서 설정 값 확인
   - 테스트 페이지 만들어서 환경 변수 검증
   - 빌드 스크립트에 디버깅 로그 추가

### 관련 파일
- `/build-config.js` - 환경 변수 빌드 스크립트
- `/config-loader.js` - 설정 로더
- `/netlify.toml` - Netlify 빌드 설정
- `/NETLIFY_ENV_SETUP.md` - 환경 변수 설정 가이드
- `/test-env.html` - 환경 변수 테스트 페이지

### 참고 명령어
```bash
# 로컬 테스트
node build-config.js

# Git 푸시로 자동 배포
git add . && git commit -m "Update" && git push

# Netlify 재배포
# Deploys → Trigger deploy → Clear cache and deploy site
```