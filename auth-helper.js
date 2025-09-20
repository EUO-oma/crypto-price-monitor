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
        window.location.href = 'login.html';
    }
    return error;
}

// 관리자 권한 확인 (특정 이메일만 허용)
async function checkAdminAccess() {
    const session = await checkAuth();
    
    if (!session) {
        // 로그인 안됨
        window.location.href = 'login.html';
        return false;
    }

    // config.js에서 허용된 이메일 목록 가져오기
    const allowedEmails = window.getConfig('ADMIN.ALLOWED_EMAILS') || [];
    const devMode = window.getConfig('ADMIN.DEV_MODE') || false;
    
    // 개발 모드면 모든 사용자 허용
    if (devMode) {
        window.debugLog('🔧 개발 모드 활성화 - 모든 사용자 허용');
        return true;
    }

    // 특정 이메일만 허용 (기본 설정)
    if (allowedEmails.length === 0) {
        console.error('⚠️ 허용된 이메일이 설정되지 않았습니다. config.js 파일의 ADMIN.ALLOWED_EMAILS 배열에 관리자 이메일을 추가하세요.');
        alert('관리자 이메일이 설정되지 않았습니다.\n\nconfig.js 파일을 수정하여 관리자 이메일을 추가하세요.');
        await signOut();
        return false;
    }
    
    if (allowedEmails.includes(session.user.email)) {
        console.log('✅ 인증된 관리자:', session.user.email);
        return true;
    } else {
        console.warn('❌ 접근 거부:', session.user.email);
        alert(`접근 권한이 없습니다.\n\n현재 로그인: ${session.user.email}\n관리자에게 문의하세요.`);
        await signOut();
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
                    if (window.location.pathname.includes('admin')) {
                        window.location.href = 'login.html';
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
                    if (window.location.pathname.includes('admin')) {
                        window.location.href = 'login.html';
                    }
                }
            });
        }
    }, 100);
}