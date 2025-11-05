// 안전한 링크 렌더링 함수

// 안전한 스타일 가져오기 (에러 방지)
function getSafeCardStyles(category) {
    try {
        // 기본 스타일 정의
        const defaultStyles = {
            gpt: {
                fontSize: 16,
                fontWeight: '500',
                bgColor: '#1a1a1a',
                textColor: '#ffffff',
                borderColor: '#333333',
                borderWidth: 1,
                borderRadius: 10,
                padding: 15
            },
            youtube: {
                fontSize: 17,
                fontWeight: '600',
                bgColor: '#1a1a1a',
                textColor: '#ffffff',
                borderColor: '#333333',
                borderWidth: 1,
                borderRadius: 10,
                padding: 15
            },
            favorite: {
                fontSize: 16,
                fontWeight: '500',
                bgColor: '#1a1a1a',
                textColor: '#ffffff',
                borderColor: '#333333',
                borderWidth: 1,
                borderRadius: 10,
                padding: 15
            }
        };
        
        // localStorage에서 저장된 스타일 가져오기
        let savedStyles = {};
        try {
            const stored = localStorage.getItem('linkCardStyles');
            if (stored) {
                savedStyles = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('저장된 스타일 로드 실패:', e);
        }
        
        // 카테고리 기본값 확인
        if (!defaultStyles[category]) {
            console.warn(`알 수 없는 카테고리: ${category}, 기본값 사용`);
            category = 'gpt';
        }
        
        // 안전한 병합
        const categoryDefaults = defaultStyles[category] || {};
        const categorySaved = savedStyles[category] || {};
        
        // 각 속성을 안전하게 병합
        const merged = {};
        Object.keys(categoryDefaults).forEach(key => {
            merged[key] = categorySaved[key] !== undefined ? categorySaved[key] : categoryDefaults[key];
        });
        
        return merged;
        
    } catch (error) {
        console.error('getSafeCardStyles 오류:', error);
        // 최소한의 기본값 반환
        return {
            fontSize: 16,
            bgColor: '#1a1a1a',
            textColor: '#ffffff',
            borderColor: '#333333'
        };
    }
}

// 안전한 HTML 이스케이프
function safeEscapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// DOM 요소로 안전하게 링크 생성
function createSafeLinkElement(link, styles) {
    try {
        const element = document.createElement('a');
        element.href = link.url || '#';
        element.target = '_blank';
        element.className = 'link-card';
        
        // 텍스트 컨텐츠 설정
        const textDiv = document.createElement('div');
        textDiv.textContent = link.name || '이름 없음';
        textDiv.style.fontSize = `${styles.fontSize || 16}px`;
        element.appendChild(textDiv);
        
        // 인라인 스타일 적용
        element.style.cssText = `
            background: ${styles.bgColor || '#1a1a1a'};
            color: ${styles.textColor || '#ffffff'};
            padding: ${styles.padding || 15}px;
            border-radius: ${styles.borderRadius || 10}px;
            text-align: center;
            border: 1px solid ${styles.borderColor || '#333333'};
            text-decoration: none;
            transition: transform 0.3s ease;
            display: block;
        `;
        
        // 호버 효과
        element.addEventListener('mouseover', () => {
            element.style.transform = 'translateY(-3px)';
            element.style.borderColor = '#555';
        });
        
        element.addEventListener('mouseout', () => {
            element.style.transform = 'translateY(0)';
            element.style.borderColor = styles.borderColor || '#333333';
        });
        
        return element;
        
    } catch (error) {
        console.error('링크 요소 생성 실패:', error, link);
        // 폴백 요소
        const fallback = document.createElement('div');
        fallback.textContent = link.name || 'Error';
        fallback.style.padding = '10px';
        fallback.style.color = '#f87171';
        return fallback;
    }
}

// 안전한 링크 렌더링 함수
function safeRenderLinks(containerId, links, category) {
    console.log(`렌더링 시작: ${containerId}, ${links.length}개 링크`);
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`컨테이너를 찾을 수 없음: ${containerId}`);
        return false;
    }
    
    try {
        // 컨테이너 초기화
        container.innerHTML = '';
        
        if (!links || links.length === 0) {
            container.innerHTML = '<div style="color: #666; text-align: center;">링크가 없습니다.</div>';
            return true;
        }
        
        // 스타일 가져오기
        const styles = getSafeCardStyles(category);
        console.log(`${category} 스타일:`, styles);
        
        // DOM 요소로 링크 생성
        links.forEach((link, index) => {
            try {
                const element = createSafeLinkElement(link, styles);
                container.appendChild(element);
            } catch (error) {
                console.error(`링크 ${index} 렌더링 실패:`, error);
            }
        });
        
        console.log(`✅ ${containerId} 렌더링 완료`);
        return true;
        
    } catch (error) {
        console.error(`렌더링 실패 (${containerId}):`, error);
        container.innerHTML = `<div style="color: #f87171;">렌더링 오류: ${error.message}</div>`;
        return false;
    }
}

// 기존 함수를 대체할 안전한 버전
function safeLoadLinksFromSupabase() {
    console.log('안전한 링크 로딩 시작...');
    
    // 이 함수는 index.html의 loadLinksFromSupabase를 대체하여 사용
    // 스타일 시스템의 오류를 방지하면서 링크를 렌더링
}