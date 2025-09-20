/**
 * 빌드 시 환경 변수를 JavaScript 파일로 변환
 * Netlify 빌드 과정에서 실행됨
 */

const fs = require('fs');

console.log('🚀 Starting build configuration...');
console.log('📍 Current directory:', process.cwd());
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
console.log('🏗️  Build context:', process.env.CONTEXT);

// 디버깅: 사용 가능한 환경 변수 확인
console.log('\n🔍 Checking for required environment variables:');

const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_DATABASE_URL',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID',
    'ADMIN_EMAILS'
];

requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`  ✅ ${varName}: Set (${value.substring(0, 10)}...)`);
    } else {
        console.log(`  ❌ ${varName}: NOT SET`);
    }
});

// Netlify 환경 변수에서 설정 읽기
// 디버깅 출력
console.log('🔧 Build Configuration Starting...');
console.log('ADMIN_EMAILS from env:', process.env.ADMIN_EMAILS ? 'configured' : 'not set');

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

console.log('📧 Processed ALLOWED_EMAILS:', config.ADMIN.ALLOWED_EMAILS.length > 0 ? `${config.ADMIN.ALLOWED_EMAILS.length} email(s)` : 'none');

// 중요한 설정이 있는지 확인
if (!config.SUPABASE.URL || !config.SUPABASE.ANON_KEY) {
    console.error('\n⚠️  CRITICAL WARNING: Supabase configuration is missing!');
    console.error('   The application will NOT work without these environment variables:');
    console.error('   - SUPABASE_URL');
    console.error('   - SUPABASE_ANON_KEY');
    console.error('\n   Please add these in Netlify Dashboard:');
    console.error('   Site Settings → Environment Variables → Environment Variables');
    console.error('\n   Or use Netlify CLI: netlify env:set SUPABASE_URL "your-url"');
    
    // 빌드는 계속 진행 (supabase-init.js의 fallback이 처리함)
    console.log('\n   ⚠️  Using fallback configuration from supabase-init.js');
}

// config-env.js 파일 생성
const configContent = `
// 자동 생성된 환경 설정 파일 (빌드 시 생성됨)
window.ENV_CONFIG = ${JSON.stringify(config, null, 2)};
`;

fs.writeFileSync('config-env.js', configContent);
console.log('✅ config-env.js generated from environment variables');
console.log('📄 Generated config-env.js successfully');

// 모든 HTML 파일에 config-env.js 로드 스크립트 추가
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));

htmlFiles.forEach(file => {
    try {
        let html = fs.readFileSync(file, 'utf8');
        
        // config-loader.js를 사용하는 파일만 업데이트
        if (html.includes('config-loader.js') && !html.includes('config-env.js')) {
            // config-loader.js 앞에 config-env.js 추가
            html = html.replace(
                '<script src="config-loader.js"></script>',
                '<script src="config-env.js"></script>\n    <script src="config-loader.js"></script>'
            );
            
            fs.writeFileSync(file, html);
            console.log(`✅ Added config-env.js to ${file}`);
        }
    } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
    }
});

console.log('✅ Build configuration complete');