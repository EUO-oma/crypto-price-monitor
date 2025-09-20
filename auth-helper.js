// Authentication Helper Functions

// Supabase 클라이언트 가져오기
function getSupabaseClient() {
    if (window.supabaseClient) {
        return window.supabaseClient;
    }
    
    // config.js에서 설정 가져오기
    const url = window.getConfig ? window.getConfig('SUPABASE.URL') : window.APP_CONFIG?.SUPABASE?.URL;
    const key = window.getConfig ? window.getConfig('SUPABASE.ANON_KEY') : window.APP_CONFIG?.SUPABASE?.ANON_KEY;
    
    if (!url || !key) {
        console.error('⚠️ Supabase 설정이 없습니다. 환경 변수를 확인하세요.');
        console.error('   SUPABASE_URL:', url ? '설정됨' : '없음');
        console.error('   SUPABASE_ANON_KEY:', key ? '설정됨' : '없음');
        return null;
    }
    
    if (window.supabase && window.supabase.createClient) {
        try {
            window.supabaseClient = window.supabase.createClient(url, key);
            console.log('✅ Supabase 클라이언트 생성됨');
            return window.supabaseClient;
        } catch (error) {
            console.error('❌ Supabase 클라이언트 생성 실패:', error);
            return null;
        }
    }
    
    console.error('⚠️ Supabase SDK가 로드되지 않았습니다.');
    return null;
}

// window에 전역으로 노출
window.getSupabaseClient = getSupabaseClient;
window.checkAuth = checkAuth;
window.signOut = signOut;
window.checkAdminAccess = checkAdminAccess;

// 로그인 상태 확인
async function checkAuth() {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// 로그아웃
async function signOut() {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    
    const { error } = await supabase.auth.signOut();
    if (!error) {
        window.location.href = 'index.html';
    }
    return error;
}

// 관리자 권한 확인 (특정 이메일만 허용)
async function checkAdminAccess() {
    const session = await checkAuth();
    
    if (!session) {
        // 로그인 안됨 - admin-links.html에서는 리다이렉트하지 않음
        const currentPath = window.location.pathname;
        if (!currentPath.includes('admin-links.html') && !currentPath.includes('auth-callback.html')) {
            window.location.href = 'admin-links.html?redirect=' + encodeURIComponent(window.location.pathname);
        }
        return false;
    }

    // config.js에서 허용된 이메일 목록 가져오기
    let allowedEmails = window.getConfig('ADMIN.ALLOWED_EMAILS') || [];
    const devMode = window.getConfig('ADMIN.DEV_MODE') || false;
    
    // Fallback: 환경변수가 비어있으면 하드코딩된 이메일 사용
    if (allowedEmails.length === 0) {
        console.warn('⚠️ ADMIN.ALLOWED_EMAILS is empty, using fallback');
        // Netlify 환경이거나 로컬 환경에서 기본 관리자 이메일 사용
        allowedEmails = ['icandoit13579@gmail.com'];
    }
    
    // 개발 모드면 모든 사용자 허용
    if (devMode) {
        window.debugLog('🔧 개발 모드 활성화 - 모든 사용자 허용');
        return true;
    }

    // 이미 위에서 fallback 처리했으므로 빈 배열 체크는 불필요
    
    if (allowedEmails.includes(session.user.email)) {
        console.log('✅ 인증된 관리자');
        return true;
    } else {
        console.warn('❌ 접근 거부');
        // admin-links.html에서는 alert을 표시하지 않음 (페이지에서 처리)
        const currentPath = window.location.pathname;
        if (!currentPath.includes('admin-links.html')) {
            alert('접근 권한이 없습니다.\n관리자에게 문의하세요.');
            await signOut();
        }
        return false;
    }
}

// 세션 변경 감지 (페이지 로드 후 설정)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        const supabase = getSupabaseClient();
        if (supabase) {
            supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_OUT') {
                    // 로그아웃됨
                    if (window.location.pathname.includes('admin') && !window.location.pathname.includes('admin-links.html')) {
                        window.location.href = 'admin-links.html';
                    }
                }
            });
        }
    });
} else {
    // 이미 DOM이 로드된 경우
    setTimeout(() => {
        const supabase = getSupabaseClient();
        if (supabase) {
            supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_OUT') {
                    // 로그아웃됨
                    if (window.location.pathname.includes('admin') && !window.location.pathname.includes('admin-links.html')) {
                        window.location.href = 'admin-links.html';
                    }
                }
            });
        }
    }, 100);
}