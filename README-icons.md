# 아이콘 생성 가이드

이 프로젝트에 필요한 아이콘 파일들입니다. 

## 필요한 아이콘 목록

### 1. 기본 파비콘
- `favicon.ico` - 멀티사이즈 ICO 파일 (16x16, 32x32, 48x48)
- `favicon-16x16.png` - 16x16 PNG
- `favicon-32x32.png` - 32x32 PNG

### 2. Apple Touch Icons (iOS)
- `apple-touch-icon.png` - 180x180 (기본)
- `apple-touch-icon-57x57.png` - iPhone 구형
- `apple-touch-icon-60x60.png` - iPhone
- `apple-touch-icon-72x72.png` - iPad 구형
- `apple-touch-icon-76x76.png` - iPad
- `apple-touch-icon-114x114.png` - iPhone 레티나 구형
- `apple-touch-icon-120x120.png` - iPhone 레티나
- `apple-touch-icon-144x144.png` - iPad 레티나 구형
- `apple-touch-icon-152x152.png` - iPad 레티나

### 3. Android Chrome Icons
- `android-chrome-192x192.png` - Android 기본
- `android-chrome-512x512.png` - Android 고해상도

### 4. Windows Tiles
- `mstile-144x144.png` - Windows 8/10 타일

### 5. 소셜 미디어 공유 이미지
- `og-image.png` - 1200x630 (Facebook, LinkedIn)
- `twitter-card.png` - 1200x630 (Twitter)

## 디자인 가이드

모든 아이콘은 다음 디자인을 따릅니다:
- **배경**: 검은색 (#000000)
- **메인 색상**: 그라데이션
  - 시작: #f7931a (비트코인 오렌지)
  - 중간: #627eea (이더리움 퍼플)
  - 끝: #00FFA3 (솔라나 그린)
- **텍스트**: 'C' 문자 (Crypto의 C)
- **추가 요소**: 차트 라인 (큰 아이콘에만)

## 생성 방법

### 온라인 도구 사용
1. [Favicon Generator](https://realfavicongenerator.net/) 방문
2. `favicon.svg` 파일 업로드
3. 모든 플랫폼 아이콘 생성 및 다운로드

### Photoshop/GIMP 사용
1. 512x512 캔버스 생성
2. 검은 배경에 그라데이션 'C' 로고 제작
3. 각 크기별로 리사이즈하여 저장

### 임시 해결책
현재 `favicon.svg`가 있으므로 대부분의 모던 브라우저에서는 이것으로도 충분합니다.
필요시 온라인 변환 도구를 사용하여 PNG 파일들을 생성하세요.