# 자동화 옵션 비교 및 설정 가이드

## 현재 보유 중인 자동화 파일들

### 1. auto-collector.html (기본 웹 수집기)
- **특징**: 웹 브라우저에서 실행하는 기본 자동 수집기
- **장점**: 설정이 간단하고 직관적인 UI
- **단점**: 브라우저를 계속 열어둬야 함
- **주요 기능**:
  - 설정 가능한 수집 시간 (오전 9시, 자정 등)
  - 브라우저 알림
  - 누락된 날짜 자동 확인
  - 실시간 로그 표시

### 2. auto-collector-v2.html (고급 웹 수집기)
- **특징**: 더 많은 기능을 가진 고급 버전
- **장점**: WebSocket 실시간 모니터링, 다중 시간대 수집
- **단점**: 여전히 브라우저가 필요함
- **추가 기능**:
  - 실시간 가격 모니터링 (WebSocket)
  - 백그라운드 수집 옵션
  - 다중 시간대 수집 (1일, 4시간, 1시간)
  - 자동 복구 기능
  - 데이터 CSV 내보내기

### 3. collect-daily-prices.js (Node.js 스크립트)
- **특징**: 브라우저 없이 실행 가능한 독립 스크립트
- **장점**: 서버나 자동화 환경에서 실행 가능
- **단점**: 수동으로 실행하거나 별도 자동화 필요
- **사용 방법**: `node collect-daily-prices.js`

## 페이지를 열지 않고 자동화하는 방법들

### 방법 1: GitHub Actions (추천) ✅
**파일**: `.github/workflows/daily-price-collector.yml`

**장점**:
- 완전 무료
- 서버 불필요
- 자동으로 매일 실행
- GitHub 저장소에서 직접 관리

**설정 방법**:
1. GitHub 저장소로 이동
2. Settings → Secrets and variables → Actions
3. "New repository secret" 클릭
4. Name: `FIREBASE_SERVICE_ACCOUNT`
5. Value: Firebase 서비스 계정 JSON (아래 참조)

**Firebase 서비스 계정 생성**:
1. [Firebase Console](https://console.firebase.google.com) 접속
2. 프로젝트 설정 → 서비스 계정
3. "새 비공개 키 생성" 클릭
4. 다운로드된 JSON 파일 내용을 GitHub Secret에 붙여넣기

### 방법 2: 로컬 Cron Job (Mac/Linux)
**파일**: `setup-local-cron.sh`

**설정 방법**:
```bash
# 스크립트 실행 권한 부여
chmod +x setup-local-cron.sh

# 크론잡 설정
./setup-local-cron.sh
```

**확인 방법**:
```bash
# 설정된 크론잡 확인
crontab -l

# 로그 확인
tail -f ~/crypto-collector.log
```

### 방법 3: Windows 작업 스케줄러
**Windows에서 자동화**:
1. 작업 스케줄러 열기 (taskschd.msc)
2. "기본 작업 만들기" 클릭
3. 이름: "Crypto Price Collector"
4. 트리거: 매일, 오전 9시 1분
5. 동작: 프로그램 시작
   - 프로그램: `node.exe`
   - 인수: `C:\경로\collect-daily-prices.js`

### 방법 4: 클라우드 Functions (고급)
**Firebase Functions 또는 AWS Lambda 사용**

Firebase Functions 예시:
```javascript
const functions = require('firebase-functions');
const { collectDataForDate } = require('./collect-daily-prices');

exports.dailyPriceCollector = functions.pubsub
  .schedule('1 9 * * *')
  .timeZone('Asia/Seoul')
  .onRun(async (context) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    await collectDataForDate(yesterday);
    console.log('Daily price collection completed');
  });
```

## 각 방법 비교표

| 방법 | 비용 | 난이도 | 신뢰성 | 서버 필요 | 추천도 |
|------|------|--------|--------|-----------|--------|
| auto-collector.html | 무료 | 쉬움 | 낮음 | 불필요 | ★★☆ |
| auto-collector-v2.html | 무료 | 쉬움 | 보통 | 불필요 | ★★★ |
| GitHub Actions | 무료 | 보통 | 높음 | 불필요 | ★★★★★ |
| 로컬 Cron | 무료 | 보통 | 보통 | 컴퓨터 켜져있어야 | ★★★ |
| Windows 스케줄러 | 무료 | 쉬움 | 보통 | 컴퓨터 켜져있어야 | ★★★ |
| 클라우드 Functions | 유료 | 어려움 | 매우 높음 | 불필요 | ★★★★ |

## 즉시 시작하기

### 가장 빠른 방법 (GitHub Actions):
1. GitHub 저장소에 코드 푸시
2. Actions 탭에서 workflow 활성화
3. Firebase 서비스 계정 Secret 설정
4. 완료! 매일 자동 수집됨

### 로컬에서 테스트:
```bash
# Node.js 스크립트 직접 실행
node collect-daily-prices.js

# 또는 웹 버전 실행
open auto-collector-v2.html
```

## 문제 해결

### GitHub Actions가 실행되지 않을 때:
- Actions 탭에서 workflow 활성화 확인
- Repository Settings에서 Actions 권한 확인
- Secrets가 올바르게 설정되었는지 확인

### 로컬 크론이 작동하지 않을 때:
- `crontab -l`로 설정 확인
- 로그 파일 확인: `cat ~/crypto-collector.log`
- Node.js 경로 확인: `which node`

### Firebase 권한 오류:
- Firebase Console에서 Database Rules 확인
- 서비스 계정 권한 확인
- API 키가 올바른지 확인

## 추가 자동화 아이디어

1. **Telegram/Discord 알림 추가**
   - 수집 완료 시 메시지 발송
   - 오류 발생 시 즉시 알림

2. **데이터 분석 자동화**
   - 일별 변동률 계산
   - 주간/월간 리포트 생성

3. **백업 자동화**
   - Firebase 데이터를 CSV로 자동 백업
   - Google Drive에 자동 업로드

4. **다중 거래소 지원**
   - Binance 외 다른 거래소 추가
   - 가격 차이 비교 분석