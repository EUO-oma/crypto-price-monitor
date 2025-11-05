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
    category: '일반',
    description: ''
  })

  const categories = ['일반', '트레이딩', '뉴스', '도구', '학습', '기타']

  useEffect(() => {
    loadBookmarks()
  }, [user])

  async function loadBookmarks() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('links')
        .select('*')
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
        const { error } = await supabase
          .from('links')
          .insert({
            name: formData.name,
            url: formData.url,
            category: formData.category,
            description: formData.description
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
      category: '일반',
      description: ''
    })
    setEditingBookmark(null)
  }

  function openEditModal(bookmark: Bookmark) {
    setEditingBookmark(bookmark)
    setFormData({
      name: bookmark.name,
      url: bookmark.url,
      category: bookmark.category || '일반',
      description: bookmark.description || ''
    })
    setShowModal(true)
  }

  const groupedBookmarks = bookmarks.reduce((acc, bookmark) => {
    const category = bookmark.category || '일반'
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
            href="/legacy/links.html"
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

      {bookmarks.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-bookmark text-6xl text-text-secondary mb-4"></i>
          <h3 className="text-xl font-semibold mb-2">즐겨찾기가 없습니다</h3>
          <p className="text-text-secondary">첫 번째 즐겨찾기를 추가해보세요!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedBookmarks).map(([category, categoryBookmarks]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-4 text-text-secondary">{category}</h2>
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
            </div>
          ))}
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
                    <option key={cat} value={cat}>{cat}</option>
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