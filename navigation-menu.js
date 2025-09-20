/**
 * 네비게이션 메뉴 모듈
 * 하단 네비게이션 바를 생성하고 관리하는 모듈
 */

// 네비게이션 설정
const NAVIGATION_CONFIG = {
    // 공개 메뉴 (모든 사용자)
    public: [
        {
            href: "index.html",
            title: "홈",
            icon: "🏠",
            id: "nav-home"
        },
        {
            href: "triple-chart.html",
            title: "차트",
            icon: "📊",
            id: "nav-chart"
        },
        {
            href: "world-clock.html",
            title: "세계시계",
            icon: "🕐",
            id: "nav-clock"
        },
        {
            href: "price-history.html",
            title: "가격 기록",
            icon: "📈",
            id: "nav-history"
        }
    ],
    
    // 관리자 전용 메뉴
    admin: [
        {
            href: "admin-links.html?redirect=links.html",
            title: "링크",
            icon: "🔗",
            id: "nav-links",
            requiresAuth: true
        },
        {
            href: "admin-links.html?redirect=supabase-links.html",
            title: "즐겨찾기",
            icon: "⭐",
            id: "nav-favorites",
            requiresAuth: true
        },
        {
            href: "admin-links.html?redirect=admin-v3.html",
            title: "설정",
            icon: null, // SVG 아이콘 사용
            id: "nav-settings",
            requiresAuth: true,
            customIcon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M20.46 20.46l-4.24-4.24M1.54 20.46l4.24-4.24M22 12h-6m-6 0H1"></path>
            </svg>`
        }
    ],
    
    // 특별 기능 버튼
    special: [
        {
            title: "채팅",
            icon: "💬",
            id: "nav-chat",
            isButton: true,
            onClick: "openChatPopup()"
        },
        {
            href: "login.html",
            title: "로그인",
            icon: "🔐",
            id: "nav-login"
        }
    ]
};

// 네비게이션 생성 함수
function createNavigationMenu() {
    // 기존 네비게이션 제거
    const existingNav = document.querySelector('.nav-container');
    if (existingNav) {
        existingNav.remove();
    }
    
    // 네비게이션 컨테이너 생성
    const navContainer = document.createElement('div');
    navContainer.className = 'nav-container';
    navContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 10px;
        padding: 10px 20px;
        background: rgba(26, 26, 26, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid #333;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        border-radius: 20px;
        z-index: 1000;
    `;
    
    // 현재 페이지 확인
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // 메뉴 아이템 생성 함수
    function createMenuItem(item) {
        if (item.isButton) {
            // 버튼 타입
            const button = document.createElement('button');
            button.className = 'nav-btn';
            button.id = item.id;
            button.title = item.title;
            button.setAttribute('onclick', item.onClick);
            button.innerHTML = `<span style="font-size: 20px;">${item.icon}</span>`;
            return button;
        } else {
            // 링크 타입
            const link = document.createElement('a');
            link.href = item.href;
            link.className = 'nav-btn';
            link.id = item.id;
            link.title = item.title;
            
            // 현재 페이지 표시
            if (item.href === currentPage || 
                (item.href.includes('?redirect=') && item.href.includes(currentPage))) {
                link.classList.add('active');
            }
            
            // 아이콘 설정
            if (item.customIcon) {
                link.innerHTML = item.customIcon;
            } else {
                link.innerHTML = `<span style="font-size: 20px;">${item.icon}</span>`;
            }
            
            return link;
        }
    }
    
    // 공개 메뉴 추가
    NAVIGATION_CONFIG.public.forEach(item => {
        navContainer.appendChild(createMenuItem(item));
    });
    
    // 특별 기능 버튼 추가 (채팅, 로그인)
    NAVIGATION_CONFIG.special.forEach(item => {
        navContainer.appendChild(createMenuItem(item));
    });
    
    // 관리자 메뉴 추가
    NAVIGATION_CONFIG.admin.forEach(item => {
        navContainer.appendChild(createMenuItem(item));
    });
    
    // 문서에 추가
    document.body.appendChild(navContainer);
    
    // 스타일 추가 (한 번만)
    if (!document.querySelector('#navigation-styles')) {
        const styles = document.createElement('style');
        styles.id = 'navigation-styles';
        styles.textContent = `
            /* Unified Navigation Buttons Style */
            .nav-btn {
                width: 45px;
                height: 45px;
                background: transparent;
                border: none;
                border-radius: 12px;
                color: #888;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                text-decoration: none;
                transition: all 0.2s ease;
                position: relative;
            }
            
            .nav-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
                transform: scale(1.1);
            }
            
            .nav-btn:active {
                transform: scale(0.95);
            }
            
            /* Current page indicator */
            .nav-btn.active {
                color: #f7931a;
                background: rgba(247, 147, 26, 0.1);
            }
            
            /* Tooltip for navigation buttons */
            .nav-btn::after {
                content: attr(title);
                position: absolute;
                bottom: 55px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(26, 26, 26, 0.95);
                color: #fff;
                padding: 5px 10px;
                border-radius: 6px;
                font-size: 12px;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s ease;
                border: 1px solid #333;
            }
            
            .nav-btn:hover::after {
                opacity: 1;
            }
            
            /* Responsive adjustments for mobile */
            @media (max-width: 768px) {
                .nav-container {
                    bottom: 10px !important;
                    padding: 6px 12px !important;
                    gap: 5px !important;
                }
                
                .nav-btn {
                    width: 40px;
                    height: 40px;
                }
                
                .nav-btn span {
                    font-size: 18px !important;
                }
                
                .nav-btn svg {
                    width: 18px !important;
                    height: 18px !important;
                }
            }
        `;
        document.head.appendChild(styles);
    }
}

// 채팅 팝업 함수 (전역으로 노출)
window.openChatPopup = function() {
    const width = 450;
    const height = 650;
    const left = window.screen.width - width - 50;
    const top = 50;
    
    const features = `
        width=${width},
        height=${height},
        left=${left},
        top=${top},
        toolbar=no,
        menubar=no,
        scrollbars=no,
        resizable=yes,
        status=no
    `.replace(/\s+/g, '');
    
    const chatWindow = window.open('anonymous-chat.html', 'ChatWindow', features);
    
    if (chatWindow) {
        chatWindow.focus();
    }
};

// 페이지 로드 시 네비게이션 생성
document.addEventListener('DOMContentLoaded', createNavigationMenu);

// 모듈 내보내기 (다른 스크립트에서 사용 가능)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createNavigationMenu,
        NAVIGATION_CONFIG
    };
}