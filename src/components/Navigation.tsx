'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import AuthModal from '@/components/AuthModal'

export default function Navigation() {
  const { user, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-lg border-b border-border-color">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
                <i className="fas fa-calendar-alt text-primary"></i>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  나의 일정
                </span>
              </Link>
              
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/info-hub" className="nav-link">
                  <i className="fas fa-home"></i> 정보 허브
                </Link>
                <Link href="/crypto" className="nav-link">
                  <i className="fas fa-chart-line"></i> 암호화폐
                </Link>
                <Link href="/youtube" className="nav-link">
                  <i className="fab fa-youtube"></i> YouTube
                </Link>
                <Link href="/world-clock" className="nav-link">
                  <i className="fas fa-clock"></i> 세계 시계
                </Link>
                <Link href="/bookmarks" className="nav-link">
                  <i className="fas fa-bookmark"></i> 즐겨찾기
                </Link>
                <Link href="/chat" className="nav-link">
                  <i className="fas fa-comment"></i> 채팅
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* 모바일 메뉴 버튼 */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 hover:bg-hover-bg rounded"
              >
                <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'} text-xl`}></i>
              </button>
              
              {user ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm hidden md:block">{user.email}</span>
                  </div>
                  <button
                    onClick={signOut}
                    className="text-sm px-4 py-2 rounded hover:bg-hover-bg transition-colors"
                  >
                    <i className="fas fa-sign-out-alt"></i> <span className="hidden sm:inline">로그아웃</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="btn-primary text-sm"
                >
                  <i className="fas fa-sign-in-alt mr-2"></i> 로그인
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 메뉴 */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowMobileMenu(false)}>
          <div className="fixed left-0 top-16 bottom-0 w-64 bg-card-bg border-r border-border-color p-4">
            <nav className="flex flex-col gap-4">
              <Link href="/info-hub" className="nav-link p-2 hover:bg-hover-bg rounded" onClick={() => setShowMobileMenu(false)}>
                <i className="fas fa-home mr-2"></i> 정보 허브
              </Link>
              <Link href="/crypto" className="nav-link p-2 hover:bg-hover-bg rounded" onClick={() => setShowMobileMenu(false)}>
                <i className="fas fa-chart-line mr-2"></i> 암호화폐
              </Link>
              <Link href="/youtube" className="nav-link p-2 hover:bg-hover-bg rounded" onClick={() => setShowMobileMenu(false)}>
                <i className="fab fa-youtube mr-2"></i> YouTube
              </Link>
              <Link href="/world-clock" className="nav-link p-2 hover:bg-hover-bg rounded" onClick={() => setShowMobileMenu(false)}>
                <i className="fas fa-clock mr-2"></i> 세계 시계
              </Link>
              <Link href="/bookmarks" className="nav-link p-2 hover:bg-hover-bg rounded" onClick={() => setShowMobileMenu(false)}>
                <i className="fas fa-bookmark mr-2"></i> 즐겨찾기
              </Link>
              <Link href="/chat" className="nav-link p-2 hover:bg-hover-bg rounded" onClick={() => setShowMobileMenu(false)}>
                <i className="fas fa-comment mr-2"></i> 채팅
              </Link>
            </nav>
          </div>
        </div>
      )}

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      <style jsx>{`
        .nav-link {
          @apply text-text-secondary hover:text-text-primary transition-colors text-sm font-medium;
        }
      `}</style>
    </>
  )
}