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
        window.location.href = '../admin-links.html';
    }
    return error;
}

// 관리자 권한 확인 (특정 이메일만 허용)
async function checkAdminAccess() {
    const session = await checkAuth();
    
    if (!session) {
        // 로그인 안됨
        window.location.href = '../admin-links.html';
        return false;
    }

    // 허용된 이메일 목록 (여기에 본인 이메일 추가)
    const allowedEmails = [
        // 'your-email@gmail.com', // 여기에 본인 Google 이메일 추가
    ];

    // 모든 사용자 허용하려면 아래 줄 주석 해제
    return true;

    // 특정 이메일만 허용하려면 아래 사용
    // if (allowedEmails.includes(session.user.email)) {
    //     return true;
    // } else {
    //     alert('접근 권한이 없습니다.');
    //     await signOut();
    //     return false;
    // }
}

// 세션 변경 감지
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
        // 로그아웃됨
        if (window.location.pathname.includes('admin')) {
            window.location.href = '../admin-links.html';
        }
    }
});