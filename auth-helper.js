// Authentication Helper Functions - 심플 버전

// Supabase 클라이언트 가져오기
function getSupabaseClient() {
    if (window.supabaseClient) {
        return window.supabaseClient;
    }
    
    // config.js에서 설정 가져오기
    const url = window.getConfig ? window.getConfig('SUPABASE.URL') : window.APP_CONFIG?.SUPABASE?.URL;
    const key = window.getConfig ? window.getConfig('SUPABASE.ANON_KEY') : window.APP_CONFIG?.SUPABASE?.ANON_KEY;
    
    if (!url || !key) {
        console.error('⚠️ Supabase 설정이 없습니다.');
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

// 관리자 권한 확인 - 로그인만 체크 (Google OAuth에서 이미 제한됨)
async function checkAdminAccess() {
    const session = await checkAuth();
    return !!session; // 로그인되어 있으면 true
}

// window에 전역으로 노출
window.getSupabaseClient = getSupabaseClient;
window.checkAuth = checkAuth;
window.signOut = signOut;
window.checkAdminAccess = checkAdminAccess;