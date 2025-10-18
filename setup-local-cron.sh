#!/bin/bash

# Mac에서 로컬 크론잡 설정 스크립트

echo "🔧 로컬 자동 수집 설정 중..."

# 크론잡 스크립트 생성
cat > ~/crypto-price-collector.sh << 'EOL'
#!/bin/bash
cd /Users/iuo/Documents/EUOvaultSYNC/1\ Project/privacy/crypto-price-monitor
/usr/local/bin/node collect-daily-prices.js >> ~/crypto-collector.log 2>&1
EOL

# 실행 권한 부여
chmod +x ~/crypto-price-collector.sh

# 크론탭에 추가 (매일 오전 9시 1분)
(crontab -l 2>/dev/null; echo "1 9 * * * ~/crypto-price-collector.sh") | crontab -

echo "✅ 크론잡 설정 완료!"
echo ""
echo "📌 설정된 크론잡:"
crontab -l | grep crypto-price-collector

echo ""
echo "🔍 로그 확인: tail -f ~/crypto-collector.log"
echo "❌ 크론잡 제거: crontab -e (해당 줄 삭제)"