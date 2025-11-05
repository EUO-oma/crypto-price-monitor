import Link from 'next/link'

export default function InfoHubPage() {
  const sections = [
    {
      title: '암호화폐 모니터',
      icon: 'fas fa-chart-line',
      href: '/crypto',
      description: '실시간 암호화폐 가격 모니터링'
    },
    {
      title: 'YouTube 플레이리스트',
      icon: 'fab fa-youtube',
      href: '/youtube',
      description: '개인 YouTube 플레이리스트 관리'
    },
    {
      title: '세계 시계',
      icon: 'fas fa-globe',
      href: '/world-clock',
      description: '여러 도시의 현재 시간 확인'
    },
    {
      title: '즐겨찾기',
      icon: 'fas fa-bookmark',
      href: '/bookmarks',
      description: '자주 방문하는 링크 관리'
    },
    {
      title: '익명 채팅',
      icon: 'fas fa-comment',
      href: '/chat',
      description: '실시간 익명 채팅'
    },
    {
      title: '애니메이션 게시판',
      icon: 'fas fa-tv',
      href: '/anime-board',
      description: '애니메이션 정보 공유'
    }
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">정보 허브</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="card hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="text-center p-6">
              <div className="text-5xl mb-4 text-primary">
                <i className={section.icon}></i>
              </div>
              <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
              <p className="text-text-secondary text-sm">{section.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}