'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

interface Bookmark {
  id: string
  name: string
  url: string
  category: string
  description?: string
  position?: number
  created_at: string
}

export default function BookmarksPage() {
  const { user } = useAuth()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    category: 'favorite',
    description: ''
  })
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const categories = [
    { value: 'favorite', label: '즐겨찾기', icon: '⭐' },
    { value: 'gpt', label: 'GPT', icon: '🤖' },
    { value: 'youtube', label: 'YouTube Live', icon: '📺' },
    { value: 'fun-youtube', label: 'Fun YouTube', icon: '🎮' },
    { value: '트레이딩', label: '트레이딩', icon: '📊' },
    { value: '뉴스', label: '뉴스', icon: '📰' },
    { value: '도구', label: '도구', icon: '🛠️' },
    { value: '학습', label: '학습', icon: '📚' },
    { value: '기타', label: '기타', icon: '📁' }
  ]

  useEffect(() => {
    loadBookmarks()
  }, [user])

  async function loadBookmarks() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('position', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setBookmarks(data || [])
    } catch (error) {
      console.error('Load error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (!formData.name || !formData.url) {
      alert('이름과 URL을 입력하세요')
      return
    }

    try {
      if (editingBookmark) {
        const { error } = await supabase
          .from('links')
          .update({
            name: formData.name,
            url: formData.url,
            category: formData.category,
            description: formData.description
          })
          .eq('id', editingBookmark.id)

        if (error) throw error
      } else {
        // Get max position for ordering
        const maxPosition = Math.max(...bookmarks.map(b => b.position || 0), 0)
        
        const { error } = await supabase
          .from('links')
          .insert({
            name: formData.name,
            url: formData.url,
            category: formData.category,
            description: formData.description,
            position: maxPosition + 1
          })

        if (error) throw error
      }

      setShowModal(false)
      resetForm()
      await loadBookmarks()
    } catch (error) {
      console.error('Save error:', error)
      alert('저장 중 오류가 발생했습니다')
    }
  }

  async function deleteBookmark(id: string) {
    if (!confirm('이 북마크를 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      await loadBookmarks()
    } catch (error) {
      console.error('Delete error:', error)
      alert('삭제 중 오류가 발생했습니다')
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      url: '',
      category: 'favorite',
      description: ''
    })
    setEditingBookmark(null)
  }

  function openEditModal(bookmark: Bookmark) {
    setEditingBookmark(bookmark)
    setFormData({
      name: bookmark.name,
      url: bookmark.url,
      category: bookmark.category || 'favorite',
      description: bookmark.description || ''
    })
    setShowModal(true)
  }

  function extractYouTubeVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^#&?]*)/,
      /(?:youtube\.com\/shorts\/)([^#&?]*)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  }

  const filteredBookmarks = activeCategory === 'all' 
    ? bookmarks 
    : bookmarks.filter(b => b.category === activeCategory)

  const groupedBookmarks = filteredBookmarks.reduce((acc, bookmark) => {
    const category = bookmark.category || 'favorite'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(bookmark)
    return acc
  }, {} as Record<string, Bookmark[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-2xl text-text-secondary">
          <i className="fas fa-spinner fa-spin mr-2"></i>
          로딩 중...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">즐겨찾기</h1>
        <div className="flex gap-3">
          <a
            href="/legacy/supabase-links.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <i className="fas fa-history mr-2"></i>
            기존 페이지
          </a>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="btn-primary"
          >
            <i className="fas fa-plus mr-2"></i>
            추가
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeCategory === 'all' 
              ? 'bg-primary text-white' 
              : 'bg-card-bg text-text-secondary hover:text-text-primary'
          }`}
        >
          전체 ({bookmarks.length})
        </button>
        {categories.map(cat => {
          const count = bookmarks.filter(b => b.category === cat.value).length
          if (count === 0 && activeCategory !== cat.value) return null
          
          return (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat.value 
                  ? 'bg-primary text-white' 
                  : 'bg-card-bg text-text-secondary hover:text-text-primary'
              }`}
            >
              {cat.icon} {cat.label} ({count})
            </button>
          )
        })}
      </div>

      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-bookmark text-6xl text-text-secondary mb-4"></i>
          <h3 className="text-xl font-semibold mb-2">북마크가 없습니다</h3>
          <p className="text-text-secondary">첫 번째 북마크를 추가해보세요!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedBookmarks).map(([category, categoryBookmarks]) => {
            const categoryInfo = categories.find(c => c.value === category)
            const isYoutubeCategory = category === 'youtube' || category === 'fun-youtube'
            
            return (
              <div key={category}>
                <h2 className="text-xl font-semibold mb-4 text-text-secondary">
                  {categoryInfo?.icon} {categoryInfo?.label || category}
                </h2>
                
                {isYoutubeCategory ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categoryBookmarks.map((bookmark) => {
                      const videoId = extractYouTubeVideoId(bookmark.url)
                      const thumbnailUrl = videoId 
                        ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                        : null
                      
                      return (
                        <div key={bookmark.id} className="card group hover:shadow-lg transition-all overflow-hidden">
                          {thumbnailUrl && (
                            <a
                              href={bookmark.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block relative aspect-video overflow-hidden"
                            >
                              <img 
                                src={thumbnailUrl} 
                                alt={bookmark.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <i className="fab fa-youtube text-4xl text-white"></i>
                              </div>
                            </a>
                          )}
                          <div className="p-4">
                            <a
                              href={bookmark.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                {bookmark.name}
                              </h3>
                              {bookmark.description && (
                                <p className="text-xs text-text-secondary line-clamp-2">{bookmark.description}</p>
                              )}
                            </a>
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => openEditModal(bookmark)}
                                className="p-1 text-xs text-text-secondary hover:text-primary transition-colors"
                                title="수정"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                onClick={() => deleteBookmark(bookmark.id)}
                                className="p-1 text-xs text-text-secondary hover:text-error transition-colors"
                                title="삭제"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryBookmarks.map((bookmark) => (
                      <div key={bookmark.id} className="card group hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between">
                          <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                              {bookmark.name}
                            </h3>
                            {bookmark.description && (
                              <p className="text-sm text-text-secondary mb-2">{bookmark.description}</p>
                            )}
                            <p className="text-xs text-gray-500 truncate">{bookmark.url}</p>
                          </a>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => openEditModal(bookmark)}
                              className="p-2 text-text-secondary hover:text-primary transition-colors"
                              title="수정"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => deleteBookmark(bookmark.id)}
                              className="p-2 text-text-secondary hover:text-error transition-colors"
                              title="삭제"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-bg rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">
              {editingBookmark ? '즐겨찾기 수정' : '즐겨찾기 추가'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">이름</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-dark-bg border border-border-color rounded-lg focus:outline-none focus:border-primary"
                  placeholder="사이트 이름"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  className="w-full px-4 py-2 bg-dark-bg border border-border-color rounded-lg focus:outline-none focus:border-primary"
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">카테고리</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 bg-dark-bg border border-border-color rounded-lg focus:outline-none focus:border-primary"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">설명 (선택)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-dark-bg border border-border-color rounded-lg focus:outline-none focus:border-primary h-20"
                  placeholder="간단한 설명"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary"
              >
                {editingBookmark ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}