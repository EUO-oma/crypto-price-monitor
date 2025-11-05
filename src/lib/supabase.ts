import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ddfnxbkiewolgweivomv.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZm54YmtpZXdvbGd3ZWl2b212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzI3NzYsImV4cCI6MjA2NzIwODc3Nn0.YCS2UH6YWarPX3C2ryFUUQnFA-3er_ZQomf_mccjmD8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)