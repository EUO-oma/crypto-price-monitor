'use client'

import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Schedule } from '@/types/supabase'

type ScheduleCardProps = {
  schedule: Schedule
  onEdit: () => void
  onDelete: () => void
  canEdit: boolean
}

export default function ScheduleCard({ schedule, onEdit, onDelete, canEdit }: ScheduleCardProps) {
  const eventDate = new Date(schedule.event_date)
  const day = eventDate.getDate()
  const month = format(eventDate, 'MMM', { locale: ko }).toUpperCase()
  
  const categoryNames: Record<string, string> = {
    general: '일반',
    meeting: '회의',
    personal: '개인',
    work: '업무',
    family: '가족',
    health: '건강',
    education: '교육',
    entertainment: '엔터테인먼트',
  }
  
  const priorityColors: Record<string, string> = {
    low: 'text-gray-500',
    normal: 'text-primary',
    high: 'text-warning',
    urgent: 'text-danger',
  }
  
  const statusColors: Record<string, string> = {
    upcoming: 'bg-primary/20 text-primary',
    ongoing: 'bg-secondary/20 text-secondary',
    completed: 'bg-gray-500/20 text-gray-500',
    cancelled: 'bg-danger/20 text-danger',
  }
  
  return (
    <div 
      className="card flex gap-4 hover:shadow-lg transition-shadow relative overflow-hidden"
      style={{ borderLeftColor: schedule.color, borderLeftWidth: '4px' }}
    >
      {/* Date Box */}
      <div 
        className="flex-shrink-0 w-20 text-center p-4 rounded border"
        style={{ borderColor: schedule.color }}
      >
        <div className="text-2xl font-bold" style={{ color: schedule.color }}>
          {day}
        </div>
        <div className="text-sm text-text-secondary">{month}</div>
      </div>
      
      {/* Content */}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">{schedule.title}</h3>
            
            <div className="flex flex-wrap gap-4 text-sm text-text-secondary mb-3">
              {schedule.event_time && (
                <span>
                  <i className="far fa-clock mr-1"></i>
                  {schedule.event_time}
                </span>
              )}
              {schedule.location && (
                <span>
                  <i className="fas fa-map-marker-alt mr-1"></i>
                  {schedule.location}
                </span>
              )}
              <span className="bg-hover-bg px-2 py-1 rounded">
                {categoryNames[schedule.category] || schedule.category}
              </span>
            </div>
            
            {schedule.description && (
              <p className="text-text-secondary mb-3">{schedule.description}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[schedule.priority]}`}>
              {schedule.priority === 'low' && '낮음'}
              {schedule.priority === 'normal' && '보통'}
              {schedule.priority === 'high' && '높음'}
              {schedule.priority === 'urgent' && '긴급'}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[schedule.status]}`}>
              {schedule.status === 'upcoming' && '예정'}
              {schedule.status === 'ongoing' && '진행중'}
              {schedule.status === 'completed' && '완료'}
              {schedule.status === 'cancelled' && '취소'}
            </span>
          </div>
        </div>
        
        {canEdit && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-border-color">
            <button
              onClick={onEdit}
              className="px-3 py-1 text-sm bg-hover-bg hover:bg-primary hover:text-white rounded transition-colors"
            >
              <i className="fas fa-edit mr-1"></i>수정
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1 text-sm bg-hover-bg hover:bg-danger hover:text-white rounded transition-colors"
            >
              <i className="fas fa-trash mr-1"></i>삭제
            </button>
          </div>
        )}
      </div>
    </div>
  )
}