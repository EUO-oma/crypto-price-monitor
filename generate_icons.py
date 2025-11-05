from PIL import Image, ImageDraw, ImageFont
import os

def create_gradient(width, height):
    """그라데이션 이미지 생성"""
    img = Image.new('RGB', (width, height), '#000000')
    draw = ImageDraw.Draw(img)
    
    # 간단한 그라데이션 효과 (대각선)
    for i in range(width):
        for j in range(height):
            # 대각선 그라데이션
            ratio = (i + j) / (width + height)
            
            # 색상 보간
            if ratio < 0.33:
                # Orange to Purple
                r = int(247 - (247 - 98) * (ratio * 3))
                g = int(147 - (147 - 126) * (ratio * 3))
                b = int(26 + (234 - 26) * (ratio * 3))
            elif ratio < 0.66:
                # Purple to Green
                r = int(98 - 98 * ((ratio - 0.33) * 3))
                g = int(126 + (255 - 126) * ((ratio - 0.33) * 3))
                b = int(234 - (234 - 163) * ((ratio - 0.33) * 3))
            else:
                # Green
                r = 0
                g = 255
                b = 163
                
            draw.point((i, j), (r, g, b))
    
    return img

def create_icon(size):
    """아이콘 생성"""
    # 검은 배경
    img = Image.new('RGBA', (size, size), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)
    
    # 둥근 사각형 마스크
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    radius = int(size * 0.2)
    mask_draw.rounded_rectangle([0, 0, size-1, size-1], radius=radius, fill=255)
    
    # C 문자 그리기
    try:
        font_size = int(size * 0.5)
        # 시스템 폰트 사용
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        font = ImageFont.load_default()
    
    # 텍스트 위치 계산
    text = "C"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - bbox[1]
    
    # 그라데이션 색상으로 텍스트 그리기 (주황색)
    draw.text((x, y), text, fill=(247, 147, 26, 255), font=font)
    
    # 차트 라인 그리기 (큰 아이콘만)
    if size >= 120:
        # 간단한 차트 라인
        points = [
            (size * 0.2, size * 0.8),
            (size * 0.3, size * 0.7),
            (size * 0.4, size * 0.75),
            (size * 0.5, size * 0.65),
            (size * 0.6, size * 0.7),
            (size * 0.7, size * 0.6),
            (size * 0.8, size * 0.65)
        ]
        
        # 선 그리기
        for i in range(len(points) - 1):
            draw.line([points[i], points[i+1]], fill=(0, 255, 163, 200), width=max(2, int(size * 0.02)))
    
    # 마스크 적용
    img.putalpha(mask)
    
    return img

def create_og_image():
    """OG 이미지 생성"""
    img = Image.new('RGB', (1200, 630), (0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    try:
        # 큰 폰트
        font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 150)
        font_medium = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 80)
    except:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
    
    # CRYPTO 텍스트
    text1 = "CRYPTO"
    bbox1 = draw.textbbox((0, 0), text1, font=font_large)
    x1 = (1200 - (bbox1[2] - bbox1[0])) // 2
    y1 = 180
    draw.text((x1, y1), text1, fill=(247, 147, 26), font=font_large)
    
    # × LIVE 텍스트
    text2 = "× LIVE"
    bbox2 = draw.textbbox((0, 0), text2, font=font_medium)
    x2 = (1200 - (bbox2[2] - bbox2[0])) // 2
    y2 = 340
    draw.text((x2, y2), text2, fill=(98, 126, 234), font=font_medium)
    
    # 차트 라인
    points = [
        (200, 500), (300, 450), (400, 470), (500, 420),
        (600, 440), (700, 390), (800, 410), (900, 360), (1000, 380)
    ]
    
    for i in range(len(points) - 1):
        draw.line([points[i], points[i+1]], fill=(0, 255, 163), width=6)
    
    return img

# 디렉토리 생성
os.makedirs('icons', exist_ok=True)

# 아이콘 크기 목록
icon_sizes = [
    (16, 'favicon-16x16.png'),
    (32, 'favicon-32x32.png'),
    (57, 'apple-touch-icon-57x57.png'),
    (60, 'apple-touch-icon-60x60.png'),
    (72, 'apple-touch-icon-72x72.png'),
    (76, 'apple-touch-icon-76x76.png'),
    (114, 'apple-touch-icon-114x114.png'),
    (120, 'apple-touch-icon-120x120.png'),
    (144, 'apple-touch-icon-144x144.png'),
    (152, 'apple-touch-icon-152x152.png'),
    (180, 'apple-touch-icon.png'),
    (192, 'android-chrome-192x192.png'),
    (512, 'android-chrome-512x512.png'),
    (144, 'mstile-144x144.png'),
]

# 아이콘 생성
print("아이콘 생성 중...")
for size, filename in icon_sizes:
    icon = create_icon(size)
    icon.save(f'icons/{filename}', 'PNG')
    print(f'✓ {filename}')

# OG 이미지 생성
print("\nOG 이미지 생성 중...")
og_img = create_og_image()
og_img.save('icons/og-image.png', 'PNG')
og_img.save('icons/twitter-card.png', 'PNG')
print('✓ og-image.png')
print('✓ twitter-card.png')

# ICO 파일 생성 (여러 크기 포함)
print("\nICO 파일 생성 중...")
icon_16 = create_icon(16)
icon_32 = create_icon(32)
icon_48 = create_icon(48)

# favicon.ico 생성
icon_32.save('icons/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
print('✓ favicon.ico')

print("\n✅ 모든 아이콘이 생성되었습니다!")