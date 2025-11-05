/**
 * 🔧 로컬 개발용 설정 파일
 * ⚠️ 이 파일은 절대 GitHub에 커밋하지 마세요!
 */

window.APP_CONFIG = {
    // Supabase 설정 (환경변수 또는 기본값)
    SUPABASE: {
        URL: window.ENV_CONFIG?.SUPABASE?.URL || 'https://ddfnxbkiewolgweivomv.supabase.co',
        ANON_KEY: window.ENV_CONFIG?.SUPABASE?.ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZm54YmtpZXdvbGd3ZWl2b212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzI3NzYsImV4cCI6MjA2NzIwODc3Nn0.YCS2UH6YWarPX3C2ryFUUQnFA-3er_ZQomf_mccjmD8'
    },
    
    // Firebase 설정
    FIREBASE: {
        apiKey: "AIzaSyA6zB_snzOh_e5tG6_-uK64g6dwL5pzU4c",
        authDomain: "crypto-monitor-84bdb.firebaseapp.com",
        databaseURL: "https://crypto-monitor-84bdb-default-rtdb.firebaseio.com",
        projectId: "crypto-monitor-84bdb",
        storageBucket: "crypto-monitor-84bdb.firebasestorage.app",
        messagingSenderId: "146592267275",
        appId: "1:146592267275:web:916c54658889be5dab9b0e",
        measurementId: "G-TTGCF3YWWJ"
    },
    
    // 관리자 설정
    ADMIN: {
        // 여기에 본인의 Gmail 주소를 추가하세요
        ALLOWED_EMAILS: [
            'icandoit13579@gmail.com'
        ],
        DEV_MODE: true  // 로컬 개발 시 true로 설정
    },
    
    // 앱 설정
    APP: {
        SITE_NAME: 'Crypto Price Monitor',
        SITE_URL: 'https://euo.netlify.app',
        BINANCE_WS: 'wss://stream.binance.com:9443/ws',
        BINANCE_API: 'https://api.binance.com/api/v3',
        DEFAULT_CURRENCY: 'USDT',
        DEFAULT_COINS: ['BTC', 'ETH', 'SOL'],
        CHART_COLORS: {
            BTC: '#f7931a',
            ETH: '#9a8ff8', 
            SOL: '#00FFA3',
            XRP: '#1caa8c'
        }
    },
    
    NAVIGATION: {
        SHOW_ADMIN_MENU: true,
        SHOW_CHAT: true,
        CHAT_POPUP: {
            WIDTH: 450,
            HEIGHT: 650
        }
    },
    
    DEBUG: {
        ENABLE_LOGS: true,
        VERBOSE: false
    }
};

// 전역 변수 설정
window.SUPABASE_URL = window.APP_CONFIG.SUPABASE.URL;
window.SUPABASE_ANON_KEY = window.APP_CONFIG.SUPABASE.ANON_KEY;

// 헬퍼 함수들
window.debugLog = function(message, ...args) {
    if (window.APP_CONFIG.DEBUG.ENABLE_LOGS) {
        console.log(`[${new Date().toTimeString().split(' ')[0]}] ${message}`, ...args);
    }
};

window.verboseLog = function(message, ...args) {
    if (window.APP_CONFIG.DEBUG.VERBOSE) {
        console.log(`[VERBOSE] ${message}`, ...args);
    }
};

window.getConfig = function(path) {
    const keys = path.split('.');
    let value = window.APP_CONFIG;
    
    for (const key of keys) {
        value = value?.[key];
        if (value === undefined) break;
    }
    
    return value;
};

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

console.log('✅ Local config.js loaded');