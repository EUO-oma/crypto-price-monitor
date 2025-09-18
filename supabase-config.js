// Supabase Configuration
// 이 파일에 Supabase 프로젝트 정보를 입력하세요

const SUPABASE_URL = 'https://ddfnxbkiewolgweivomv.supabase.co'; // Supabase Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZm54YmtpZXdvbGd3ZWl2b212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzI3NzYsImV4cCI6MjA2NzIwODc3Nn0.YCS2UH6YWarPX3C2ryFUUQnFA-3er_ZQomf_mccjmD8'; // public anon key

// 전역 supabase 변수 선언
var supabase = null;

// Supabase Client 초기화 함수
function initSupabase() {
    if (typeof window !== 'undefined' && window.supabase && !supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized');
        return true;
    }
    return false;
}

// 즉시 시도
initSupabase();

// 만약 실패했으면 DOMContentLoaded에서 재시도
if (!supabase) {
    console.warn('Supabase not initialized immediately, will retry on DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', function() {
        initSupabase();
    });
}

// 링크 데이터 가져오기
async function fetchLinks() {
    if (!supabase) {
        console.error('Supabase client not available');
        return { youtube: [], favorites: [], gpt: [] };
    }

    try {
        // YouTube 채널 가져오기
        const { data: youtubeLinks, error: ytError } = await supabase
            .from('links')
            .select('*')
            .eq('category', 'youtube')
            .order('position');

        if (ytError) throw ytError;

        // Favorite 사이트 가져오기
        const { data: favoriteLinks, error: favError } = await supabase
            .from('links')
            .select('*')
            .eq('category', 'favorite')
            .order('position');

        if (favError) throw favError;

        // GPT 도구 링크 가져오기
        const { data: gptLinks, error: gptError } = await supabase
            .from('links')
            .select('*')
            .eq('category', 'gpt')
            .order('position');

        if (gptError) throw gptError;

        return {
            youtube: youtubeLinks || [],
            favorites: favoriteLinks || [],
            gpt: gptLinks || []
        };
    } catch (error) {
        console.error('Error fetching links:', error);
        return { youtube: [], favorites: [], gpt: [] };
    }
}

// 링크 추가
async function addLink(name, url, category, position = 999) {
    try {
        const { data, error } = await supabase
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
    try {
        const { data, error } = await supabase
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
    const subscription = supabase
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