# GitHub OAuth 추가 방법

## 1. Supabase 대시보드에서 GitHub OAuth 활성화

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. Authentication → Providers → GitHub 활성화
3. GitHub OAuth App 생성:
   - GitHub Settings → Developer settings → OAuth Apps → New OAuth App
   - Application name: Crypto Price Monitor
   - Homepage URL: https://euo.netlify.app
   - Authorization callback URL: https://ddfnxbkiewolgweivomv.supabase.co/auth/v1/callback
4. Client ID와 Client Secret을 Supabase에 입력

## 2. 로그인 버튼 추가

```html
<!-- admin-links.html에 추가 -->
<button class="login-btn" onclick="signInWithGitHub()" style="background: #24292e; margin-top: 10px;">
    <svg style="width: 20px; height: 20px; vertical-align: middle; margin-right: 10px;" viewBox="0 0 24 24">
        <path fill="#ffffff" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
    GitHub로 로그인
</button>

<script>
async function signInWithGitHub() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    
    loading.classList.add('show');
    error.classList.remove('show');
    
    try {
        const supabaseClient = window.getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
        }
        
        // 원래 목적지를 세션에 저장
        sessionStorage.setItem('adminRedirectTo', currentRedirectTo);
        
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: window.location.origin + '/auth-callback.html',
                scopes: 'read:user user:email' // GitHub 이메일 접근 권한
            }
        });
        
        if (error) throw error;
    } catch (error) {
        loading.classList.remove('show');
        error.textContent = '로그인 실패: ' + error.message;
        error.classList.add('show');
    }
}
</script>
```

## 3. 사용자 정보 표시 개선

```javascript
// displayAdminInfo 함수 수정
const provider = user.app_metadata?.provider || '알 수 없음';
const providerIcon = provider === 'github' ? '🐙' : 
                     provider === 'google' ? '🔵' : '👤';

adminEmailEl.innerHTML = `✅ ${providerIcon} <strong>${email}</strong>`;
```

## 4. ADMIN_EMAILS 환경변수에 GitHub 이메일도 추가

```
ADMIN_EMAILS=icandoit13579@gmail.com,your-github-email@users.noreply.github.com
```

## 주의사항

- GitHub 사용자는 이메일을 비공개로 설정할 수 있음
- 이 경우 `username@users.noreply.github.com` 형식의 이메일 사용
- GitHub OAuth 시 `user:email` scope 필요