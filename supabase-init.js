// Simplified Supabase initialization with fallback
// This file ensures Supabase works even if config files fail to load

(function() {
    // Direct configuration - will be replaced by build process
    const SUPABASE_CONFIG = {
        URL: 'https://ddfnxbkiewolgweivomv.supabase.co',
        ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZm54YmtpZXdvbGd3ZWl2b212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzI3NzYsImV4cCI6MjA2NzIwODc3Nn0.YCS2UH6YWarPX3C2ryFUUQnFA-3er_ZQomf_mccjmD8'
    };

    // Initialize Supabase client immediately
    function initSupabase() {
        if (window.supabaseClient) {
            console.log('✅ Supabase already initialized');
            return window.supabaseClient;
        }

        // Wait for Supabase SDK
        if (!window.supabase || !window.supabase.createClient) {
            console.warn('⏳ Waiting for Supabase SDK...');
            setTimeout(initSupabase, 100);
            return null;
        }

        try {
            // Try to get config from various sources
            let url = SUPABASE_CONFIG.URL;
            let key = SUPABASE_CONFIG.ANON_KEY;
            
            console.log('🔍 Checking configuration sources...');

            // Check for ENV_CONFIG (Netlify build)
            if (window.ENV_CONFIG?.SUPABASE?.URL) {
                url = window.ENV_CONFIG.SUPABASE.URL;
                key = window.ENV_CONFIG.SUPABASE.ANON_KEY;
                console.log('✅ Using ENV_CONFIG');
            }
            // Check for APP_CONFIG (config-loader.js)
            else if (window.APP_CONFIG?.SUPABASE?.URL) {
                url = window.APP_CONFIG.SUPABASE.URL;
                key = window.APP_CONFIG.SUPABASE.ANON_KEY;
                console.log('✅ Using APP_CONFIG');
            }
            // Fallback to hardcoded config
            else {
                console.log('✅ Using hardcoded SUPABASE_CONFIG');
            }

            console.log('🔧 Creating Supabase client with URL:', url);

            // Create client
            window.supabaseClient = window.supabase.createClient(url, key);
            console.log('✅ Supabase client initialized successfully');

            // Also set on window for compatibility
            window.getSupabaseClient = () => window.supabaseClient;

            // Dispatch custom event to notify that Supabase is ready
            window.dispatchEvent(new Event('supabaseReady'));

            return window.supabaseClient;
        } catch (error) {
            console.error('❌ Failed to initialize Supabase:', error);
            console.error('Error details:', {
                hasSupabase: !!window.supabase,
                hasCreateClient: !!(window.supabase?.createClient),
                configUrl: url,
                error: error.message
            });
            return null;
        }
    }

    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSupabase);
    } else {
        initSupabase();
    }

    // Also try on window load
    window.addEventListener('load', initSupabase);
})();