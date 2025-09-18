// Supabase Configuration
const SUPABASE_URL = 'https://ddfnxbkiewolgweivomv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZm54YmtpZXdvbGd3ZWl2b212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzI3NzYsImV4cCI6MjA2NzIwODc3Nn0.YCS2UH6YWarPX3C2ryFUUQnFA-3er_ZQomf_mccjmD8';

// Supabase 초기화 함수
function initializeSupabase() {
    if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
        if (!window.supabaseClient) {
            try {
                window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log('[supabase-config.js] Supabase client initialized successfully');
                return true;
            } catch (error) {
                console.error('[supabase-config.js] Error creating Supabase client:', error);
                return false;
            }
        }
        return true;
    }
    console.warn('[supabase-config.js] Supabase library not ready yet');
    return false;
}

// 페이지 로드 완료 후 초기화 시도
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[supabase-config.js] DOMContentLoaded - attempting initialization');
        initializeSupabase();
    });
} else {
    // 이미 DOM이 로드된 경우
    console.log('[supabase-config.js] DOM already loaded - attempting initialization');
    initializeSupabase();
}

// window.load 이벤트에서도 시도
window.addEventListener('load', function() {
    console.log('[supabase-config.js] Window load - attempting initialization');
    if (!window.supabaseClient) {
        initializeSupabase();
    }
});

// 링크 데이터 가져오기 (index.html과 동일한 방식으로 수정)
async function fetchLinks() {
    console.log('[fetchLinks] Starting fetchLinks function');
    console.log('[fetchLinks] supabase client status:', window.supabaseClient ? 'available' : 'not available');

    if (!window.supabaseClient) {
        console.error('[supabase-config.js] Supabase client not available in fetchLinks');
        console.log('[fetchLinks] Attempting to initialize...');
        initializeSupabase(); // 한 번 더 시도
        if (!window.supabaseClient) {
            console.error('[fetchLinks] Still no supabase client after initialization attempt');
            return { youtube: [], favorites: [], gpt: [] };
        }
    }

    try {
        console.log('[fetchLinks] Fetching all links at once...');

        // 모든 링크를 한 번에 가져오기 (index.html 방식과 동일)
        const { data: links, error } = await window.supabaseClient
            .from('links')
            .select('*')
            .order('position', { ascending: true });

        if (error) {
            console.error('[fetchLinks] Supabase error:', error);
            console.error('[fetchLinks] Error details:', error.message, error.code);
            throw error;
        }

        console.log('[fetchLinks] All links loaded:', links?.length || 0);

        // 카테고리별로 링크 분류 (클라이언트에서 필터링)
        const youtubeLinks = links ? links.filter(link => link.category === 'youtube') : [];
        const favoriteLinks = links ? links.filter(link => link.category === 'favorite') : [];
        const gptLinks = links ? links.filter(link => link.category === 'gpt') : [];

        console.log('[fetchLinks] YouTube links found:', youtubeLinks.length);
        console.log('[fetchLinks] Favorite links found:', favoriteLinks.length);
        console.log('[fetchLinks] GPT links found:', gptLinks.length);

        const result = {
            youtube: youtubeLinks,
            favorites: favoriteLinks, // 주의: 'favorites' (복수형)
            gpt: gptLinks
        };

        console.log('[fetchLinks] Final result:', result);
        return result;

    } catch (error) {
        console.error('[fetchLinks] Error fetching links:', error);
        console.error('[fetchLinks] Error details:', error.message, error.details, error.hint);
        return { youtube: [], favorites: [], gpt: [] };
    }
}

// 링크 추가
async function addLink(name, url, category, position = 999) {
    if (!window.supabaseClient) {
        console.error('[supabase-config.js] Supabase client not available');
        return null;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('links')
            .insert([
                { name, url, category, position }
            ])
            .select();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding link:', error);
        return null;
    }
}

// 링크 삭제
async function deleteLink(id) {
    if (!window.supabaseClient) {
        console.error('[supabase-config.js] Supabase client not available');
        return false;
    }

    try {
        const { error } = await supabase
            .from('links')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting link:', error);
        return false;
    }
}

// 링크 업데이트
async function updateLink(id, updates) {
    if (!window.supabaseClient) {
        console.error('[supabase-config.js] Supabase client not available');
        return null;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('links')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating link:', error);
        return null;
    }
}

// 실시간 구독
function subscribeToLinks(callback) {
    if (!window.supabaseClient) {
        console.error('[supabase-config.js] Supabase client not available for subscription');
        return null;
    }

    const subscription = window.supabaseClient
        .channel('links_changes')
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'links' },
            (payload) => {
                console.log('Change received!', payload);
                callback(payload);
            }
        )
        .subscribe();

    return subscription;
}