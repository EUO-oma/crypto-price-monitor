// Links Module - 링크 로딩 전용 모듈
// 다른 모듈들과 독립적으로 작동

(function() {
    'use strict';

    // 모듈 네임스페이스
    window.LinksModule = {};

    // 모듈 내부 변수 (충돌 방지)
    let linksSupabase = null;
    let isInitialized = false;
    let debugEnabled = false;

    // Supabase 설정 (환경 변수 사용)
    function getSupabaseConfig() {
        // config-loader.js를 통해 로드된 설정 사용
        if (window.APP_CONFIG && window.APP_CONFIG.SUPABASE) {
            return {
                url: window.APP_CONFIG.SUPABASE.URL,
                key: window.APP_CONFIG.SUPABASE.ANON_KEY
            };
        }
        
        // 환경 변수 직접 사용 (빌드 시 생성됨)
        if (window.ENV_CONFIG && window.ENV_CONFIG.SUPABASE) {
            return {
                url: window.ENV_CONFIG.SUPABASE.URL,
                key: window.ENV_CONFIG.SUPABASE.ANON_KEY
            };
        }
        
        // 전역 변수 사용 (하위 호환성)
        if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
            return {
                url: window.SUPABASE_URL,
                key: window.SUPABASE_ANON_KEY
            };
        }
        
        throw new Error('Supabase 설정을 찾을 수 없습니다. config-env.js 또는 config-loader.js가 로드되었는지 확인하세요.');
    }

    // 디버그 로그 함수
    function log(message, type = 'info') {
        if (debugEnabled || type === 'error') {
            console.log(`[LinksModule] ${message}`);
        }
    }

    // Supabase 클라이언트 초기화
    async function initializeSupabase() {
        if (isInitialized && linksSupabase) {
            return true;
        }

        log('Supabase 초기화 시작...');

        // Supabase 라이브러리 로드 대기
        let attempts = 0;
        while (!window.supabase && attempts < 20) {
            log(`Supabase 라이브러리 대기 중... (${attempts + 1}/20)`);
            await new Promise(resolve => setTimeout(resolve, 250));
            attempts++;
        }

        if (!window.supabase) {
            log('Supabase 라이브러리를 찾을 수 없습니다', 'error');
            return false;
        }

        try {
            const supabaseConfig = getSupabaseConfig();
            log(`Supabase 설정 로드 완료: ${supabaseConfig.url ? 'URL ✓' : 'URL ✗'}, ${supabaseConfig.key ? 'KEY ✓' : 'KEY ✗'}`);
            
            linksSupabase = window.supabase.createClient(supabaseConfig.url, supabaseConfig.key);
            isInitialized = true;
            log('✅ Supabase 클라이언트 초기화 완료');
            return true;
        } catch (error) {
            log(`❌ Supabase 초기화 실패: ${error.message}`, 'error');
            return false;
        }
    }

    // 모든 링크 데이터 가져오기
    async function fetchAllLinks() {
        if (!isInitialized) {
            const initialized = await initializeSupabase();
            if (!initialized) {
                throw new Error('Supabase 초기화 실패');
            }
        }

        log('데이터베이스에서 링크 조회 중...');

        const { data: allLinks, error } = await linksSupabase
            .from('links')
            .select('*')
            .order('position', { ascending: true });

        if (error) {
            log(`❌ 링크 조회 실패: ${error.message}`, 'error');
            throw error;
        }

        log(`✅ 총 ${allLinks?.length || 0}개 링크 조회 완료`);
        return allLinks || [];
    }

    // 카테고리별로 링크 분류
    function categorizeLinks(allLinks) {
        const categories = {
            gpt: allLinks.filter(link => link.category === 'gpt'),
            youtube: allLinks.filter(link => link.category === 'youtube'),
            favorite: allLinks.filter(link => link.category === 'favorite'),
            'fun-youtube': allLinks.filter(link => link.category === 'fun-youtube')
        };

        log(`카테고리별 링크 수: GPT(${categories.gpt.length}), YouTube(${categories.youtube.length}), Favorite(${categories.favorite.length}), Fun-YouTube(${categories['fun-youtube'].length})`);

        return categories;
    }

    // 링크 카드 HTML 생성
    function createLinkHTML(link, category) {
        const baseClass = 'link-card';
        const categoryClass = `${baseClass}-${category}`;

        return `
            <a href="${link.url}" target="_blank" class="${baseClass} ${categoryClass}" data-id="${link.id}">
                <div class="link-content">
                    <h3 class="link-title">${link.name}</h3>
                    <div class="link-url">${link.url}</div>
                    ${category === 'youtube' ? '<div class="link-badge">📺</div>' : ''}
                    ${category === 'gpt' ? '<div class="link-badge">🤖</div>' : ''}
                    ${category === 'favorite' ? '<div class="link-badge">⭐</div>' : ''}
                </div>
            </a>
        `;
    }

    // 카테고리별 링크 렌더링
    function renderCategoryLinks(category, links, containerId) {
        const container = document.getElementById(containerId);

        if (!container) {
            log(`❌ 컨테이너를 찾을 수 없습니다: ${containerId}`, 'error');
            return false;
        }

        if (links.length === 0) {
            container.innerHTML = '<div class="empty-links">링크가 없습니다</div>';
            log(`ℹ️ ${category} 카테고리: 링크 없음`);
        } else {
            const linksHTML = links.map(link => createLinkHTML(link, category)).join('');
            container.innerHTML = linksHTML;
            log(`✅ ${category} 카테고리: ${links.length}개 링크 렌더링 완료`);
        }

        return true;
    }

    // 공개 API
    window.LinksModule = {
        // 디버그 모드 설정
        setDebug: function(enabled) {
            debugEnabled = enabled;
            log(`디버그 모드: ${enabled ? '활성화' : '비활성화'}`);
        },

        // 초기화
        init: function() {
            log('LinksModule 초기화...');
            return initializeSupabase();
        },

        // 모든 링크 로드 및 렌더링
        loadAndRender: async function(containerConfig) {
            try {
                log('링크 로딩 및 렌더링 시작...');

                const allLinks = await fetchAllLinks();
                const categorizedLinks = categorizeLinks(allLinks);

                // 기본 컨테이너 설정
                const defaultConfig = {
                    'gpt': 'gpt-links',
                    'youtube': 'youtube-links',
                    'favorite': 'favorite-links',
                    'fun-youtube': 'fun-youtube-links'
                };

                const config = { ...defaultConfig, ...containerConfig };

                // 각 카테고리별 렌더링
                let totalRendered = 0;
                for (const [category, links] of Object.entries(categorizedLinks)) {
                    if (config[category]) {
                        const success = renderCategoryLinks(category, links, config[category]);
                        if (success) totalRendered += links.length;
                    }
                }

                log(`✅ 링크 로딩 완료: 총 ${totalRendered}개 링크 렌더링`);
                return {
                    success: true,
                    total: totalRendered,
                    categories: categorizedLinks
                };

            } catch (error) {
                log(`❌ 링크 로딩 실패: ${error.message}`, 'error');
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        // 특정 카테고리만 로드
        loadCategory: async function(category, containerId) {
            try {
                const allLinks = await fetchAllLinks();
                const categoryLinks = allLinks.filter(link => link.category === category);

                const success = renderCategoryLinks(category, categoryLinks, containerId);
                return success ? categoryLinks : null;
            } catch (error) {
                log(`❌ ${category} 카테고리 로딩 실패: ${error.message}`, 'error');
                return null;
            }
        },

        // 상태 확인
        getStatus: function() {
            return {
                initialized: isInitialized,
                supabaseReady: !!linksSupabase,
                libraryLoaded: !!window.supabase
            };
        }
    };

    log('LinksModule 로드 완료');

})();