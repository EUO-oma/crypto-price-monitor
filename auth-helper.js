// Authentication Helper Functions

// 로그인 상태 확인
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// 로그아웃
async function signOut() {
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

    // 허용된 이메일 목록 (여기에 본인 이메일 추가)
    const allowedEmails = [
        // 'your-email@gmail.com', // 여기에 관리자 Google 이메일을 추가하세요
    ];

    // 모든 사용자 허용하려면 아래 줄 주석 해제
    // return true;

    // 특정 이메일만 허용 (기본 설정)
    if (allowedEmails.length === 0) {
        console.error('⚠️ 허용된 이메일이 설정되지 않았습니다. auth-helper.js 파일의 allowedEmails 배열에 관리자 이메일을 추가하세요.');
        alert('관리자 이메일이 설정되지 않았습니다.\n\nauth-helper.js 파일을 수정하여 관리자 이메일을 추가하세요.');
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

// 세션 변경 감지
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
        // 로그아웃됨
        if (window.location.pathname.includes('admin')) {
            window.location.href = 'login.html';
        }
    }
});