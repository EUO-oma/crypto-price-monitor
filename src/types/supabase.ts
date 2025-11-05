export type Database = {
  public: {
    Tables: {
      schedules: {
        Row: {
          id: string
          title: string
          description: string | null
          event_date: string
          event_time: string | null
          location: string | null
          category: string
          priority: 'low' | 'normal' | 'high' | 'urgent'
          status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          color: string
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_date: string
          event_time?: string | null
          location?: string | null
          category?: string
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          color?: string
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          location?: string | null
          category?: string
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          color?: string
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Schedule = Database['public']['Tables']['schedules']['Row']
export type ScheduleInsert = Database['public']['Tables']['schedules']['Insert']
export type ScheduleUpdate = Database['public']['Tables']['schedules']['Update']