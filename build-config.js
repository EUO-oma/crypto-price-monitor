/**
 * 빌드 시 환경 변수를 JavaScript 파일로 변환
 * Netlify 빌드 과정에서 실행됨
 */

const fs = require('fs');

// Netlify 환경 변수에서 설정 읽기
const config = {
    SUPABASE: {
        URL: process.env.SUPABASE_URL || '',
        ANON_KEY: process.env.SUPABASE_ANON_KEY || ''
    },
    FIREBASE: {
        apiKey: process.env.FIREBASE_API_KEY || '',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
        databaseURL: process.env.FIREBASE_DATABASE_URL || '',
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.FIREBASE_APP_ID || '',
        measurementId: process.env.FIREBASE_MEASUREMENT_ID || ''
    },
    ADMIN: {
        ALLOWED_EMAILS: process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(email => email.trim()) : [],
        DEV_MODE: process.env.DEV_MODE === 'true'
    }
};

// config-env.js 파일 생성
const configContent = `
// 자동 생성된 환경 설정 파일 (빌드 시 생성됨)
window.ENV_CONFIG = ${JSON.stringify(config, null, 2)};
`;

fs.writeFileSync('config-env.js', configContent);
console.log('✅ config-env.js generated from environment variables');

// index.html 파일이 있으면 config-env.js 로드 스크립트 추가 확인
if (fs.existsSync('index.html')) {
    let html = fs.readFileSync('index.html', 'utf8');
    
    // config-env.js가 로드되지 않았다면 추가
    if (!html.includes('config-env.js')) {
        // config-loader.js 앞에 추가
        html = html.replace(
            '<script src="config-loader.js"></script>',
            '<script src="config-env.js"></script>\n    <script src="config-loader.js"></script>'
        );
        
        fs.writeFileSync('index.html', html);
        console.log('✅ Added config-env.js to index.html');
    }
}