#!/bin/bash

# 색상 코드 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "===================================="
echo " Netlify 자동 배포 스크립트"
echo "===================================="
echo ""

# 현재 날짜와 시간
DATETIME=$(date +"%Y-%m-%d %H:%M")
COMMIT_MESSAGE="Update: $DATETIME"

# 1. Git 상태 확인
echo -e "${YELLOW}[1/4] Git 상태 확인 중...${NC}"
git status

# 2. 변경사항 스테이징
echo ""
echo -e "${YELLOW}[2/4] 변경사항 스테이징...${NC}"
git add .

# 3. 커밋 생성
echo ""
echo -e "${YELLOW}[3/4] 커밋 생성 중...${NC}"
git commit -m "$COMMIT_MESSAGE"

# 4. 원격 저장소로 푸시
echo ""
echo -e "${YELLOW}[4/4] 원격 저장소로 푸시 중...${NC}"
git push origin main

# 완료 메시지
echo ""
echo "===================================="
echo -e "${GREEN}✅ 배포 완료!${NC}"
echo "1-2분 후 https://euo.netlify.app 에서 확인하세요"
echo "===================================="