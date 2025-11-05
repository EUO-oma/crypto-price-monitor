'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import type { Schedule, ScheduleInsert } from '@/types/supabase'

type ScheduleModalProps = {
  schedule?: Schedule | null
  onClose: () => void
  onSaved: () => void
}

const COLORS = [
  '#2196f3', '#4caf50', '#f44336', '#ff9800',
  '#9c27b0', '#3f51b5', '#00bcd4', '#795548'
]

export default function ScheduleModal({ schedule, onClose, onSaved }: ScheduleModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    title: schedule?.title || '',
    description: schedule?.description || '',
    event_date: schedule?.event_date || new Date().toISOString().split('T')[0],
    event_time: schedule?.event_time || '',
    location: schedule?.location || '',
    category: schedule?.category || 'general',
    priority: schedule?.priority || 'normal',
    status: schedule?.status || 'upcoming',
    color: schedule?.color || '#2196f3',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setError('')
    setLoading(true)
    
    try {
      const data: ScheduleInsert = {
        ...formData,
        user_id: user.id,
      }
      
      if (schedule) {
        const { error } = await supabase
          .from('schedules')
          .update(data)
          .eq('id', schedule.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('schedules')
          .insert([data])
        
        if (error) throw error
      }
      
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {schedule ? '일정 수정' : '새 일정 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">제목 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-hover-bg border border-border-color rounded focus:outline-none focus:border-primary"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">설명</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-hover-bg border border-border-color rounded focus:outline-none focus:border-primary"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">날짜 *</label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="w-full px-4 py-2 bg-hover-bg border border-border-color rounded focus:outline-none focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">시간</label>
              <input
                type="time"
                value={formData.event_time}
                onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                className="w-full px-4 py-2 bg-hover-bg border border-border-color rounded focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">위치</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 bg-hover-bg border border-border-color rounded focus:outline-none focus:border-primary"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">카테고리</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-hover-bg border border-border-color rounded focus:outline-none focus:border-primary"
              >
                <option value="general">일반</option>
                <option value="meeting">회의</option>
                <option value="personal">개인</option>
                <option value="work">업무</option>
                <option value="family">가족</option>
                <option value="health">건강</option>
                <option value="education">교육</option>
                <option value="entertainment">엔터테인먼트</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">우선순위</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-4 py-2 bg-hover-bg border border-border-color rounded focus:outline-none focus:border-primary"
              >
                <option value="low">낮음</option>
                <option value="normal">보통</option>
                <option value="high">높음</option>
                <option value="urgent">긴급</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">상태</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2 bg-hover-bg border border-border-color rounded focus:outline-none focus:border-primary"
            >
              <option value="upcoming">예정</option>
              <option value="ongoing">진행중</option>
              <option value="completed">완료</option>
              <option value="cancelled">취소</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">색상</label>
            <div className="flex gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-full border-2 ${
                    formData.color === color ? 'border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          
          {error && (
            <div className="text-danger text-sm">{error}</div>
          )}
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-hover-bg hover:bg-border-color rounded transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}