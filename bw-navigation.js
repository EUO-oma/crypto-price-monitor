// BW Mode Navigation Enhancement
class BWNavigation {
    constructor() {
        this.pages = [
            'bw-mode1.html',
            'bw-mode2.html',
            'bw-mode3.html',
            'bw-mode4.html',
            'bw-mode5.html',
            'bw-mode6.html',
            'bw-mode7.html',
            'bw-mode9.html',
            'bw-mode10-dice.html',
            'bw-mode9-layouts.html',
            'bw-mode9-vertical.html',
            'bw-mode9-card.html',
            'bw-mode9-diagonal-reverse.html',
            'bw-mode9-grid.html'
        ];
        
        this.currentPage = this.getCurrentPage();
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        
        this.init();
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.substring(path.lastIndexOf('/') + 1);
        return filename || 'index.html';
    }
    
    init() {
        // Add navigation UI
        this.createNavigationUI();
        
        // Add keyboard shortcuts
        this.addKeyboardShortcuts();
        
        // Add touch/swipe support
        this.addTouchSupport();
        
        // Add floating navigation menu
        this.createFloatingNav();
    }
    
    createNavigationUI() {
        // Create bottom navigation dots
        const navDots = document.createElement('div');
        navDots.className = 'bw-nav-dots';
        navDots.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 8px;
            z-index: 1000;
            padding: 10px;
            background: rgba(0, 0, 0, 0.7);
            border-radius: 20px;
            backdrop-filter: blur(10px);
        `;
        
        this.pages.forEach((page, index) => {
            const dot = document.createElement('div');
            dot.style.cssText = `
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: ${page === this.currentPage ? '#fff' : 'rgba(255, 255, 255, 0.3)'};
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            dot.onmouseover = () => {
                if (page !== this.currentPage) {
                    dot.style.background = 'rgba(255, 255, 255, 0.6)';
                    dot.style.transform = 'scale(1.2)';
                }
            };
            
            dot.onmouseout = () => {
                if (page !== this.currentPage) {
                    dot.style.background = 'rgba(255, 255, 255, 0.3)';
                    dot.style.transform = 'scale(1)';
                }
            };
            
            dot.onclick = () => {
                window.location.href = page;
            };
            
            dot.title = `Mode ${index + 1}`;
            navDots.appendChild(dot);
        });
        
        document.body.appendChild(navDots);
    }
    
    createFloatingNav() {
        // Create floating navigation button
        const floatingBtn = document.createElement('div');
        floatingBtn.className = 'bw-floating-nav';
        floatingBtn.innerHTML = '☰';
        floatingBtn.style.cssText = `
            position: fixed;
            bottom: 60px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 999;
            font-size: 20px;
            color: #fff;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        `;
        
        // Create menu
        const navMenu = document.createElement('div');
        navMenu.className = 'bw-nav-menu';
        navMenu.style.cssText = `
            position: fixed;
            bottom: 120px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 10px;
            display: none;
            z-index: 999;
            backdrop-filter: blur(10px);
            min-width: 150px;
        `;
        
        // Add menu items
        const menuItems = [
            { text: 'Menu', href: 'bw-mode.html', icon: '⬚' },
            { text: 'Table', href: 'bw-table.html', icon: '☰' },
            { text: 'Home', href: 'index.html', icon: '⌂' },
            { text: 'BTC', href: 'bw-mode9-btc.html', icon: '₿' },
            { text: 'ETH', href: 'bw-mode9-eth.html', icon: 'Ξ' },
            { text: 'SOL', href: 'bw-mode9-sol.html', icon: '◉' },
            { text: 'Help', href: 'bw-help.html', icon: '?' }
        ];
        
        menuItems.forEach(item => {
            const menuItem = document.createElement('a');
            menuItem.href = item.href;
            menuItem.style.cssText = `
                display: block;
                color: #fff;
                text-decoration: none;
                padding: 10px 15px;
                border-radius: 8px;
                transition: all 0.2s ease;
                font-size: 14px;
                margin: 2px 0;
            `;
            menuItem.innerHTML = `<span style="margin-right: 10px;">${item.icon}</span>${item.text}`;
            
            menuItem.onmouseover = () => {
                menuItem.style.background = 'rgba(255, 255, 255, 0.1)';
            };
            
            menuItem.onmouseout = () => {
                menuItem.style.background = 'transparent';
            };
            
            navMenu.appendChild(menuItem);
        });
        
        // Toggle menu
        floatingBtn.onclick = () => {
            const isVisible = navMenu.style.display === 'block';
            navMenu.style.display = isVisible ? 'none' : 'block';
            floatingBtn.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(90deg)';
        };
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!floatingBtn.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.style.display = 'none';
                floatingBtn.style.transform = 'rotate(0deg)';
            }
        });
        
        document.body.appendChild(floatingBtn);
        document.body.appendChild(navMenu);
    }
    
    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const currentIndex = this.pages.indexOf(this.currentPage);
            
            switch(e.key) {
                case 'ArrowLeft':
                    if (currentIndex > 0) {
                        window.location.href = this.pages[currentIndex - 1];
                    }
                    break;
                case 'ArrowRight':
                    if (currentIndex < this.pages.length - 1) {
                        window.location.href = this.pages[currentIndex + 1];
                    }
                    break;
                case 'ArrowUp':
                    window.location.href = 'bw-mode.html';
                    break;
                case 'ArrowDown':
                    window.location.href = 'bw-table.html';
                    break;
                case 'h':
                case 'H':
                    window.location.href = 'index.html';
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    const pageNum = parseInt(e.key);
                    if (pageNum <= this.pages.length) {
                        window.location.href = this.pages[pageNum - 1];
                    }
                    break;
                case '0':
                    window.location.href = this.pages[9]; // Mode 10
                    break;
            }
        });
    }
    
    addTouchSupport() {
        // Swipe detection
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
            this.touchStartY = e.changedTouches[0].screenY;
        }, false);
        
        document.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe();
        }, false);
    }
    
    handleSwipe() {
        const diffX = this.touchEndX - this.touchStartX;
        const diffY = this.touchEndY - this.touchStartY;
        const minSwipeDistance = 50;
        
        // Horizontal swipe
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
            const currentIndex = this.pages.indexOf(this.currentPage);
            
            if (diffX > 0 && currentIndex > 0) {
                // Swipe right - go to previous
                window.location.href = this.pages[currentIndex - 1];
            } else if (diffX < 0 && currentIndex < this.pages.length - 1) {
                // Swipe left - go to next
                window.location.href = this.pages[currentIndex + 1];
            }
        }
        
        // Vertical swipe
        if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > minSwipeDistance) {
            if (diffY > 0) {
                // Swipe down - go to menu
                window.location.href = 'bw-mode.html';
            }
        }
    }
}

// Initialize navigation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.bwNav = new BWNavigation();
    });
} else {
    window.bwNav = new BWNavigation();
}