/**
 * 🔧 환경 변수 로더
 * Netlify 환경 변수 또는 로컬 config.js를 로드합니다
 */

(function() {
    // Netlify 환경 변수 확인 (빌드 시 주입됨)
    const isNetlify = window.location.hostname.includes('netlify.app') || 
                      window.location.hostname.includes('netlify.com');
    
    // 기본 설정
    const defaultConfig = {
        SUPABASE: {
            URL: '',
            ANON_KEY: ''
        },
        FIREBASE: {
            apiKey: "",
            authDomain: "",
            databaseURL: "",
            projectId: "",
            storageBucket: "",
            messagingSenderId: "",
            appId: "",
            measurementId: ""
        },
        ADMIN: {
            ALLOWED_EMAILS: [],
            DEV_MODE: false
        },
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
            ENABLE_LOGS: !isNetlify, // 프로덕션에서는 로그 비활성화
            VERBOSE: false
        }
    };

    // 설정 병합 함수
    function mergeConfig(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                target[key] = target[key] || {};
                mergeConfig(target[key], source[key]);
            } else if (source[key] !== undefined && source[key] !== '') {
                target[key] = source[key];
            }
        }
    }
    
    // 설정 초기화
    window.APP_CONFIG = Object.assign({}, defaultConfig);
    
    // 1. ENV_CONFIG가 있으면 우선 사용 (Netlify 빌드 시 생성)
    if (window.ENV_CONFIG) {
        mergeConfig(window.APP_CONFIG, window.ENV_CONFIG);
        console.log('✅ Environment config loaded');
        // 보안상 ADMIN 설정은 로그하지 않음
    }
    // 2. ENV_CONFIG가 없고 로컬 환경인 경우에만 config.js 사용
    else if (!isNetlify) {
        // 동기적으로 config.js 로드를 기다림
        const loadLocalConfig = new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'config.js';
            script.onload = function() {
                // config.js의 APP_CONFIG를 현재 설정에 병합
                if (window.APP_CONFIG) {
                    const localConfig = Object.assign({}, window.APP_CONFIG);
                    window.APP_CONFIG = Object.assign({}, defaultConfig);
                    mergeConfig(window.APP_CONFIG, localConfig);
                }
                console.log('✅ Local config.js loaded');
                resolve();
            };
            script.onerror = function() {
                console.warn('⚠️ config.js not found, using default config');
                console.log('💡 Copy config.example.js to config.js and add your API keys');
                resolve();
            };
            document.head.appendChild(script);
        });
    }

    // 전역 변수 설정 (하위 호환성) - 이미 존재하면 덮어쓰지 않음
    if (!window.SUPABASE_URL) {
        Object.defineProperty(window, 'SUPABASE_URL', {
            get: function() { return window.APP_CONFIG?.SUPABASE?.URL || ''; },
            configurable: true
        });
    }
    
    if (!window.SUPABASE_ANON_KEY) {
        Object.defineProperty(window, 'SUPABASE_ANON_KEY', {
            get: function() { return window.APP_CONFIG?.SUPABASE?.ANON_KEY || ''; },
            configurable: true
        });
    }

    // 헬퍼 함수들
    window.debugLog = function(message, ...args) {
        if (window.APP_CONFIG?.DEBUG?.ENABLE_LOGS) {
            console.log(`[${new Date().toTimeString().split(' ')[0]}] ${message}`, ...args);
        }
    };

    window.verboseLog = function(message, ...args) {
        if (window.APP_CONFIG?.DEBUG?.VERBOSE) {
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
    // Config 로드 완료 이벤트 발생
    window.addEventListener('load', () => {
        window.dispatchEvent(new Event('configLoaded'));
    });
})();