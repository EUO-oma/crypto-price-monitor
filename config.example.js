/**
 * 🔧 중앙 설정 파일 예제
 * 이 파일을 복사해서 config.js로 이름을 변경한 후 실제 값을 입력하세요
 * ⚠️ config.js는 절대 GitHub에 커밋하지 마세요!
 */

window.APP_CONFIG = {
    // Supabase 설정
    SUPABASE: {
        URL: 'https://your-project-id.supabase.co',
        ANON_KEY: 'your-anon-key-here'
    },
    
    // Firebase 설정
    FIREBASE: {
        apiKey: "your-api-key",
        authDomain: "your-project.firebaseapp.com",
        databaseURL: "https://your-project.firebaseio.com",
        projectId: "your-project-id",
        storageBucket: "your-project.firebasestorage.app",
        messagingSenderId: "your-sender-id",
        appId: "your-app-id",
        measurementId: "your-measurement-id"
    },
    
    // 관리자 설정
    ADMIN: {
        // 관리자 이메일 목록 (여기에 관리자 이메일 추가)
        ALLOWED_EMAILS: [
            // 'admin@gmail.com',
            // 'manager@gmail.com'
        ],
        
        // 개발 모드 (true면 모든 사용자 허용)
        DEV_MODE: false
    },
    
    // 앱 설정
    APP: {
        // 사이트 정보
        SITE_NAME: 'Crypto Price Monitor',
        SITE_URL: 'https://your-site.netlify.app',
        
        // API 엔드포인트
        BINANCE_WS: 'wss://stream.binance.com:9443/ws',
        BINANCE_API: 'https://api.binance.com/api/v3',
        
        // 기본 설정
        DEFAULT_CURRENCY: 'USDT',
        DEFAULT_COINS: ['BTC', 'ETH', 'SOL'],
        
        // 차트 색상
        CHART_COLORS: {
            BTC: '#f7931a',
            ETH: '#9a8ff8', 
            SOL: '#00FFA3',
            XRP: '#1caa8c'
        }
    },
    
    // 네비게이션 설정
    NAVIGATION: {
        // 메뉴 표시 설정
        SHOW_ADMIN_MENU: true,
        SHOW_CHAT: true,
        
        // 팝업 창 크기
        CHAT_POPUP: {
            WIDTH: 450,
            HEIGHT: 650
        }
    },
    
    // 디버그 설정
    DEBUG: {
        // 콘솔 로그 활성화
        ENABLE_LOGS: true,
        
        // 상세 로그
        VERBOSE: false
    }
};

// 전역 변수로 쉽게 접근할 수 있도록 설정
window.SUPABASE_URL = window.APP_CONFIG.SUPABASE.URL;
window.SUPABASE_ANON_KEY = window.APP_CONFIG.SUPABASE.ANON_KEY;

// 로그 헬퍼 함수
window.debugLog = function(message, ...args) {
    if (window.APP_CONFIG.DEBUG.ENABLE_LOGS) {
        console.log(`[${new Date().toTimeString().split(' ')[0]}] ${message}`, ...args);
    }
};

// 상세 로그 헬퍼 함수
window.verboseLog = function(message, ...args) {
    if (window.APP_CONFIG.DEBUG.VERBOSE) {
        console.log(`[VERBOSE] ${message}`, ...args);
    }
};

// 설정값 가져오기 헬퍼 함수
window.getConfig = function(path) {
    const keys = path.split('.');
    let value = window.APP_CONFIG;
    
    for (const key of keys) {
        value = value?.[key];
        if (value === undefined) break;
    }
    
    return value;
};

// 설정값 업데이트 헬퍼 함수 (런타임 전용, 영구 저장 안됨)
window.updateConfig = function(path, newValue) {
    const keys = path.split('.');
    let obj = window.APP_CONFIG;
    
    for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
        if (!obj) return false;
    }
    
    obj[keys[keys.length - 1]] = newValue;
    return true;
};

// 초기화 상태 표시
console.log('✅ Config loaded:', {
    supabase: !!window.APP_CONFIG.SUPABASE.URL,
    firebase: !!window.APP_CONFIG.FIREBASE.apiKey,
    adminEmails: window.APP_CONFIG.ADMIN.ALLOWED_EMAILS.length,
    devMode: window.APP_CONFIG.ADMIN.DEV_MODE
});