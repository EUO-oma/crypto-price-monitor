# Crypto Price Monitor

실시간 암호화폐 선물 가격 모니터링 웹 애플리케이션

## 기능

- Binance 거래소의 실시간 선물 가격 표시
- WebSocket을 통한 실시간 업데이트
- 지원 코인:
  - BTCUSDT (비트코인)
  - ETHUSDT (이더리움)
  - XRPUSDT (리플)
  - SOLUSDT (솔라나)

## 실행 방법

### 방법 1: 직접 실행
브라우저에서 `index.html` 파일을 직접 열기

### 방법 2: 로컬 서버 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 기술 스택

- HTML5
- CSS3
- JavaScript (Vanilla)
- WebSocket API
- Binance Futures WebSocket API

## 특징

- 반응형 디자인
- 다크 테마
- 자동 재연결 (30초마다)
- 실시간 타임스탬프 표시

## 배포

GitHub Pages, Netlify, Vercel 등의 정적 호스팅 서비스에 배포 가능

## 라이선스

MIT