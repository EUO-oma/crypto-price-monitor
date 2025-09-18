// YouTube 링크 렌더링 (original card style)
const youtubeContainer = document.getElementById('youtube-links');
if (youtubeContainer) {
    if (youtubeLinks.length > 0) {
        youtubeContainer.innerHTML = youtubeLinks.map(link => `
            <a href="${link.url}" target="_blank" style="
                background: #1a1a1a;
                color: white;
                padding: 15px;
                border-radius: 10px;
                text-align: center;
                border: 1px solid #333;
                text-decoration: none;
                transition: transform 0.3s ease;
                display: block;
                position: relative;
            ">
                <div style="font-size: 1.1em; font-weight: bold;">${link.name}</div>
                <span class="live-indicator" data-channel-url="${link.url}" style="
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #666;
                    animation: none;
                "></span>
            </a>
        `).join('');

        // YouTube 라이브 상태 체크
        checkYouTubeLiveStatus();
    } else {
        youtubeContainer.innerHTML = '<div style="color: #666; text-align: center;">링크가 없습니다. 관리자 페이지에서 추가하세요.</div>';
    }
}

// Fun YouTube 링크 렌더링 (minimalist style with list/grid toggle)
const funYoutubeListContainer = document.getElementById('fun-youtube-links-list');
const funYoutubeGridContainer = document.getElementById('fun-youtube-links-grid');

if (funYoutubeListContainer && funYoutubeGridContainer) {
    if (funYoutubeLinks.length > 0) {
        // List view rendering
        if (window.funYoutubeViewMode === 'list' || !window.funYoutubeViewMode) {
            funYoutubeListContainer.style.display = 'flex';
            funYoutubeGridContainer.style.display = 'none';
            funYoutubeListContainer.innerHTML = funYoutubeLinks.map(link => {
                const videoId = getVideoIdFromUrl(link.url);
                const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';

                return `
                <div class="fun-video-item-minimal" onclick="window.open('${link.url}', '_blank')" style="
                    background: #1a1a1a;
                    display: flex;
                    gap: 20px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                    margin-bottom: 1px;
                    border: 1px solid #333;
                ">
                    ${thumbnailUrl ? `
                    <div style="
                        width: 160px;
                        height: 90px;
                        background: #2a2a2a;
                        position: relative;
                        overflow: hidden;
                        flex-shrink: 0;
                    ">
                        <img src="${thumbnailUrl}" style="
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                        " onerror="this.style.display='none'">
                    </div>
                    ` : `
                    <div style="
                        width: 160px;
                        height: 90px;
                        background: #2a2a2a;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-shrink: 0;
                        color: #666;
                    ">🎮</div>
                    `}
                    <div style="
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        min-width: 0;
                    ">
                        <div style="
                            font-size: 16px;
                            font-weight: 500;
                            margin-bottom: 8px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            color: #fff;
                        ">${link.name}</div>
                        <div style="
                            display: flex;
                            gap: 15px;
                            color: #999;
                            font-size: 13px;
                        ">
                            Fun YouTube
                        </div>
                    </div>
                    <div style="
                        position: absolute;
                        right: 20px;
                        top: 50%;
                        transform: translateY(-50%);
                        opacity: 0;
                        transition: opacity 0.2s ease, right 0.2s ease;
                        font-size: 20px;
                        color: #fff;
                    " class="arrow-indicator">→</div>
                </div>
                `;
            }).join('');
        } else {
            // Grid view rendering
            funYoutubeListContainer.style.display = 'none';
            funYoutubeGridContainer.style.display = 'grid';
            funYoutubeGridContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
            funYoutubeGridContainer.style.gap = '30px';
            funYoutubeGridContainer.innerHTML = funYoutubeLinks.map(link => {
                const videoId = getVideoIdFromUrl(link.url);
                const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';

                return `
                <div class="fun-grid-card-minimal" onclick="window.open('${link.url}', '_blank')" style="
                    cursor: pointer;
                    transition: transform 0.2s ease;
                    background: #1a1a1a;
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid #333;
                ">
                    <div style="
                        width: 100%;
                        aspect-ratio: 16/9;
                        background: #2a2a2a;
                        margin-bottom: 12px;
                        position: relative;
                        overflow: hidden;
                    ">
                        ${thumbnailUrl ? `
                            <img src="${thumbnailUrl}" style="
                                width: 100%;
                                height: 100%;
                                object-fit: cover;
                                transition: transform 0.3s ease;
                            " class="fun-grid-thumbnail-img" onerror="this.style.display='none'">
                        ` : `
                            <div style="
                                width: 100%;
                                height: 100%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: #999;
                                font-size: 48px;
                            ">🎮</div>
                        `}
                    </div>
                    <div style="
                        font-size: 14px;
                        font-weight: 500;
                        margin-bottom: 6px;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                        line-height: 1.4;
                        color: #fff;
                    ">${link.name}</div>
                    <div style="
                        font-size: 12px;
                        color: #999;
                    ">
                        Fun YouTube
                    </div>
                </div>
                `;
            }).join('');
        }

        // Add hover styles for Fun YouTube
        const funStyle = document.createElement('style');
        funStyle.textContent = `
            .fun-video-item-minimal:hover {
                background: #2a2a2a !important;
                border-color: #444 !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }
            .fun-video-item-minimal:hover .arrow-indicator {
                opacity: 1 !important;
                right: 15px !important;
            }
            .fun-grid-card-minimal:hover {
                transform: translateY(-2px);
                background: #2a2a2a !important;
                border-color: #444 !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            }
            .fun-grid-card-minimal:hover .fun-grid-thumbnail-img {
                transform: scale(1.05);
            }
        `;
        if (!document.getElementById('fun-youtube-hover-styles')) {
            funStyle.id = 'fun-youtube-hover-styles';
            document.head.appendChild(funStyle);
        }
    } else {
        funYoutubeListContainer.innerHTML = '<div style="color: #666; text-align: center;">링크가 없습니다. 관리자 페이지에서 추가하세요.</div>';
        funYoutubeGridContainer.innerHTML = '';
    }
}