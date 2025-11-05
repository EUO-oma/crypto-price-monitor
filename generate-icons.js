const fs = require('fs');
const { createCanvas } = require('canvas');

function drawIcon(size, isOgImage = false) {
    const width = isOgImage ? 1200 : size;
    const height = isOgImage ? 630 : size;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // 배경
    ctx.fillStyle = '#000000';
    if (isOgImage) {
        ctx.fillRect(0, 0, width, height);
    } else {
        // 둥근 사각형 배경
        ctx.beginPath();
        ctx.roundRect(0, 0, size, size, size * 0.2);
        ctx.fill();
    }
    
    // 그라데이션
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f7931a');
    gradient.addColorStop(0.5, '#627eea');
    gradient.addColorStop(1, '#00FFA3');
    
    if (isOgImage) {
        // OG Image 디자인
        ctx.fillStyle = gradient;
        ctx.font = 'bold 200px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('CRYPTO', 600, 250);
        
        ctx.font = 'bold 100px Arial';
        ctx.fillText('× LIVE', 600, 380);
        
        // 차트 라인
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(200, 500);
        ctx.lineTo(300, 450);
        ctx.lineTo(400, 470);
        ctx.lineTo(500, 420);
        ctx.lineTo(600, 440);
        ctx.lineTo(700, 390);
        ctx.lineTo(800, 410);
        ctx.lineTo(900, 360);
        ctx.lineTo(1000, 380);
        ctx.stroke();
    } else {
        // 아이콘 디자인
        ctx.fillStyle = gradient;
        const fontSize = size * 0.6;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('C', size/2, size/2);
        
        // 작은 차트 라인 (큰 아이콘에만)
        if (size >= 120) {
            ctx.strokeStyle = gradient;
            ctx.lineWidth = size * 0.03;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.moveTo(size * 0.2, size * 0.8);
            ctx.lineTo(size * 0.3, size * 0.7);
            ctx.lineTo(size * 0.4, size * 0.75);
            ctx.lineTo(size * 0.5, size * 0.65);
            ctx.lineTo(size * 0.6, size * 0.7);
            ctx.lineTo(size * 0.7, size * 0.6);
            ctx.lineTo(size * 0.8, size * 0.65);
            ctx.stroke();
        }
    }
    
    return canvas.toBuffer('image/png');
}

// 아이콘 생성
const icons = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 57, name: 'apple-touch-icon-57x57.png' },
    { size: 60, name: 'apple-touch-icon-60x60.png' },
    { size: 72, name: 'apple-touch-icon-72x72.png' },
    { size: 76, name: 'apple-touch-icon-76x76.png' },
    { size: 114, name: 'apple-touch-icon-114x114.png' },
    { size: 120, name: 'apple-touch-icon-120x120.png' },
    { size: 144, name: 'apple-touch-icon-144x144.png' },
    { size: 152, name: 'apple-touch-icon-152x152.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 512, name: 'android-chrome-512x512.png' },
    { size: 144, name: 'mstile-144x144.png' }
];

// 일반 아이콘 생성
icons.forEach(icon => {
    const buffer = drawIcon(icon.size);
    fs.writeFileSync(icon.name, buffer);
    console.log(`Created: ${icon.name}`);
});

// OG 이미지 생성
const ogBuffer = drawIcon(0, true);
fs.writeFileSync('og-image.png', ogBuffer);
console.log('Created: og-image.png');

// Twitter 카드 이미지 (OG 이미지와 동일)
fs.copyFileSync('og-image.png', 'twitter-card.png');
console.log('Created: twitter-card.png');

console.log('\n모든 아이콘이 생성되었습니다!');