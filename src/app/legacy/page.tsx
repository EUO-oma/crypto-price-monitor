export default function LegacyIndexPage() {
  const legacyPages = [
    {
      category: '즐겨찾기 & 링크',
      pages: [
        { name: '링크 모음', path: 'links.html' },
        { name: '심플 링크', path: 'simple-links.html' },
        { name: 'Supabase 링크', path: 'supabase-links.html' },
        { name: '미니멀 링크', path: 'minimal-links.html' }
      ]
    },
    {
      category: 'YouTube 플레이리스트',
      pages: [
        { name: 'YouTube Gallery v3', path: 'youtube-playlist-gallery-v3.html' },
        { name: 'YouTube Gallery v2', path: 'youtube-playlist-gallery-v2.html' },
        { name: 'YouTube Gallery', path: 'youtube-playlist-gallery.html' },
        { name: 'YouTube Player', path: 'youtube-playlist-player.html' },
        { name: 'Fun YouTube', path: 'fun-youtube.html' }
      ]
    },
    {
      category: '일정 관리',
      pages: [
        { name: '일정 관리자', path: 'schedule-manager.html' },
        { name: '빠른 일정 추가', path: 'quick-add-schedule.html' },
        { name: '테스트 일정 추가', path: 'add-test-schedule.html' }
      ]
    },
    {
      category: '차트 & 트레이딩',
      pages: [
        { name: '비트코인 차트', path: 'bitcoin-chart.html' },
        { name: '듀얼 차트', path: 'dual-chart-backup-working-version.html' },
        { name: '트리플 차트', path: 'triple-chart.html' },
        { name: '트리플 차트 나스닥', path: 'triple-chart-nasdaq.html' },
        { name: '실시간 틱 차트', path: 'realtime-tick-chart.html' }
      ]
    },
    {
      category: 'BW 모드',
      pages: [
        { name: 'BW 메인', path: 'bw.html' },
        { name: 'BW 캘린더', path: 'BW_cal.html' },
        { name: 'BW 모드 1', path: 'bw-mode1.html' },
        { name: 'BW 모드 2', path: 'bw-mode2.html' },
        { name: 'BW 모드 9 BTC', path: 'bw-mode9-btc.html' },
        { name: 'BW 모드 9 ETH', path: 'bw-mode9-eth.html' },
        { name: 'BW 모드 9 SOL', path: 'bw-mode9-sol.html' }
      ]
    },
    {
      category: '기타 도구',
      pages: [
        { name: '세계 시계', path: 'world-clock.html' },
        { name: '계산기', path: 'calculator.html' },
        { name: '애니 게시판', path: 'anime-board.html' },
        { name: '익명 채팅', path: 'anonymous-chat.html' },
        { name: '정보 허브', path: 'info-hub.html' }
      ]
    }
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-6">Legacy 페이지</h1>
      
      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-6">
        <p className="text-yellow-300">
          <i className="fas fa-info-circle mr-2"></i>
          이 페이지들은 Next.js로 마이그레이션 이전의 기존 HTML 페이지들입니다.
        </p>
      </div>

      {legacyPages.map((category) => (
        <div key={category.category}>
          <h2 className="text-xl font-semibold mb-4 text-text-secondary">{category.category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {category.pages.map((page) => (
              <a
                key={page.path}
                href={`/legacy/${page.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="card hover:shadow-lg transition-all hover:-translate-y-1 block"
              >
                <div className="flex items-center gap-3">
                  <i className="fas fa-file-code text-2xl text-primary"></i>
                  <div>
                    <h3 className="font-semibold">{page.name}</h3>
                    <p className="text-xs text-text-secondary">{page.path}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}