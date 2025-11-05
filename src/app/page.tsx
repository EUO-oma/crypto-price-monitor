'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import ScheduleCard from '@/components/ScheduleCard'
import ScheduleModal from '@/components/ScheduleModal'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import type { Schedule } from '@/types/supabase'

export default function HomePage() {
  const { user } = useAuth()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'list' | 'calendar'>('list')
  const [currentFilter, setCurrentFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)

  useEffect(() => {
    loadSchedules()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [schedules, currentFilter, searchTerm])

  async function loadSchedules() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('event_date', { ascending: true })

      if (error) throw error
      setSchedules(data || [])
    } catch (err: any) {
      console.error('Error loading schedules:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function applyFilters() {
    let filtered = schedules

    if (currentFilter !== 'all') {
      filtered = filtered.filter(s => s.status === currentFilter)
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(search) ||
        s.description?.toLowerCase().includes(search) ||
        s.location?.toLowerCase().includes(search)
      )
    }

    setFilteredSchedules(filtered)
  }

  const handleAddSchedule = () => {
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }
    setEditingSchedule(null)
    setShowScheduleModal(true)
  }

  const handleEditSchedule = (schedule: Schedule) => {
    if (!user || schedule.user_id !== user.id) {
      alert('수정 권한이 없습니다.')
      return
    }
    setEditingSchedule(schedule)
    setShowScheduleModal(true)
  }

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      await loadSchedules()
    } catch (err: any) {
      alert('삭제 실패: ' + err.message)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {/* View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentView('list')}
            className={`px-4 py-2 rounded ${
              currentView === 'list' 
                ? 'bg-primary text-white' 
                : 'bg-hover-bg text-text-primary hover:bg-border-color'
            }`}
          >
            <i className="fas fa-list mr-2"></i>목록
          </button>
          <button
            onClick={() => setCurrentView('calendar')}
            className={`px-4 py-2 rounded ${
              currentView === 'calendar' 
                ? 'bg-primary text-white' 
                : 'bg-hover-bg text-text-primary hover:bg-border-color'
            }`}
          >
            <i className="fas fa-calendar mr-2"></i>캘린더
          </button>
        </div>
        
        <button
          onClick={handleAddSchedule}
          className="btn-secondary"
        >
          <i className="fas fa-plus mr-2"></i>일정 추가
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          {['all', 'upcoming', 'ongoing', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setCurrentFilter(status)}
              className={`px-3 py-1 rounded-full text-sm ${
                currentFilter === status
                  ? 'bg-primary text-white'
                  : 'bg-hover-bg text-text-secondary hover:text-text-primary'
              }`}
            >
              {status === 'all' && '전체'}
              {status === 'upcoming' && '예정'}
              {status === 'ongoing' && '진행중'}
              {status === 'completed' && '완료'}
            </button>
          ))}
        </div>
        
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="일정 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pr-10 bg-hover-bg border border-border-color rounded-full focus:outline-none focus:border-primary"
            />
            <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"></i>
          </div>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <div className="text-center text-danger">
          <p>오류: {error}</p>
          <button onClick={loadSchedules} className="btn-primary mt-4">
            다시 시도
          </button>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <EmptyState onAddClick={handleAddSchedule} />
      ) : currentView === 'list' ? (
        <div className="grid gap-4 max-w-4xl mx-auto">
          {filteredSchedules.map(schedule => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              onEdit={() => handleEditSchedule(schedule)}
              onDelete={() => handleDeleteSchedule(schedule.id)}
              canEdit={user?.id === schedule.user_id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-text-secondary">
          캘린더 뷰는 준비 중입니다.
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <ScheduleModal
          schedule={editingSchedule}
          onClose={() => setShowScheduleModal(false)}
          onSaved={loadSchedules}
        />
      )}
    </div>
  )
}