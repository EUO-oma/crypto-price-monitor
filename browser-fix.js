// 브라우저 콘솔에서 실행하세요

// 1. DOM 요소 확인
console.log('=== DOM 요소 상태 확인 ===');
const elements = {
    loadingDiv: document.getElementById('loadingDiv'),
    listView: document.getElementById('listView'),
    emptyState: document.getElementById('emptyState'),
    calendarView: document.getElementById('calendarView')
};

for (const [name, elem] of Object.entries(elements)) {
    if (elem) {
        console.log(`✅ ${name} exists:`, {
            display: window.getComputedStyle(elem).display,
            visibility: window.getComputedStyle(elem).visibility,
            className: elem.className,
            innerHTML: elem.innerHTML.substring(0, 50) + '...'
        });
    } else {
        console.log(`❌ ${name} NOT FOUND`);
    }
}

// 2. 전역 변수 확인
console.log('\n=== 전역 변수 확인 ===');
console.log('window.supabase:', !!window.supabase);
console.log('supabase:', typeof supabase);
console.log('schedules:', typeof schedules !== 'undefined' ? schedules.length : 'undefined');
console.log('filteredSchedules:', typeof filteredSchedules !== 'undefined' ? filteredSchedules.length : 'undefined');
console.log('currentView:', typeof currentView !== 'undefined' ? currentView : 'undefined');
console.log('currentUser:', !!currentUser);

// 3. 함수 존재 확인
console.log('\n=== 함수 존재 확인 ===');
const funcs = ['initializeSupabase', 'loadSchedules', 'displaySchedules', 'applyFilters'];
for (const func of funcs) {
    console.log(`${func}:`, typeof window[func] === 'function' ? '✅ exists' : '❌ not found');
}

// 4. 강제로 로딩 스피너 숨기고 데이터 표시
console.log('\n=== 수동 수정 시도 ===');
function forceHideLoading() {
    const loadingDiv = document.getElementById('loadingDiv');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
        loadingDiv.style.visibility = 'hidden';
        loadingDiv.remove(); // 완전히 제거
        console.log('✅ Loading div removed');
    }
    
    const emptyState = document.getElementById('emptyState');
    const listView = document.getElementById('listView');
    
    if (typeof schedules !== 'undefined' && schedules.length > 0) {
        if (listView) {
            listView.style.display = 'grid';
            console.log('✅ List view shown');
        }
        if (emptyState) {
            emptyState.style.display = 'none';
        }
    } else {
        if (emptyState) {
            emptyState.style.display = 'block';
            console.log('✅ Empty state shown');
        }
        if (listView) {
            listView.style.display = 'none';
        }
    }
}

// 5. 수동으로 displaySchedules 호출
console.log('\n=== displaySchedules 수동 호출 ===');
if (typeof displaySchedules === 'function') {
    console.log('displaySchedules 호출 중...');
    displaySchedules();
    console.log('✅ displaySchedules 호출 완료');
} else {
    console.log('❌ displaySchedules 함수를 찾을 수 없습니다');
}

// 6. 그래도 안되면 강제 수정
setTimeout(() => {
    console.log('\n=== 2초 후 강제 수정 ===');
    forceHideLoading();
}, 2000);

// 7. 스타일 충돌 확인
console.log('\n=== CSS 스타일 충돌 확인 ===');
const loadingDiv = document.getElementById('loadingDiv');
if (loadingDiv) {
    const styles = window.getComputedStyle(loadingDiv);
    console.log('Loading div computed styles:', {
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
        position: styles.position,
        zIndex: styles.zIndex
    });
}

// 8. 데이터 로드 시도
console.log('\n=== 데이터 재로드 시도 ===');
if (typeof loadSchedules === 'function') {
    loadSchedules().then(() => {
        console.log('✅ loadSchedules 완료');
        setTimeout(() => {
            forceHideLoading();
        }, 1000);
    }).catch(err => {
        console.error('❌ loadSchedules 에러:', err);
        forceHideLoading();
    });
} else {
    console.log('❌ loadSchedules 함수를 찾을 수 없습니다');
}

console.log('\n=== 진단 완료 ===');
console.log('문제가 계속되면 다음을 실행하세요:');
console.log('forceHideLoading()');