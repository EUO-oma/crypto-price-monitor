'use client'

import { useState, useEffect } from 'react'

interface TimeZone {
  name: string
  tz: string
  flag: string
}

interface MarketStatus {
  status: 'open' | 'closed' | 'pre' | 'na'
  text: string
}

export default function WorldClockPage() {
  const [currentTimes, setCurrentTimes] = useState<Record<string, Date>>({})

  const timezones: TimeZone[] = [
    { name: 'Seoul', tz: 'Asia/Seoul', flag: 'kr' },
    { name: 'Tokyo', tz: 'Asia/Tokyo', flag: 'jp' },
    { name: 'Sydney', tz: 'Australia/Sydney', flag: 'au' },
    { name: 'Singapore', tz: 'Asia/Singapore', flag: 'sg' },
    { name: 'Dubai', tz: 'Asia/Dubai', flag: 'ae' },
    { name: 'London', tz: 'Europe/London', flag: 'gb' },
    { name: 'Frankfurt', tz: 'Europe/Berlin', flag: 'de' },
    { name: 'New York', tz: 'America/New_York', flag: 'us' },
    { name: 'Los Angeles', tz: 'America/Los_Angeles', flag: 'us' }
  ]

  useEffect(() => {
    const updateTimes = () => {
      const times: Record<string, Date> = {}
      timezones.forEach(tz => {
        const now = new Date()
        // Create date in the target timezone
        times[tz.name] = new Date(now.toLocaleString("en-US", { timeZone: tz.tz }))
      })
      setCurrentTimes(times)
    }

    updateTimes()
    const interval = setInterval(updateTimes, 1000)
    return () => clearInterval(interval)
  }, [])

  function formatTime(date: Date): { hours: string, minutes: string, seconds: string } {
    const h = date.getHours().toString().padStart(2, '0')
    const m = date.getMinutes().toString().padStart(2, '0')
    const s = date.getSeconds().toString().padStart(2, '0')
    return { hours: h, minutes: m, seconds: s }
  }

  function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    }
    return date.toLocaleDateString('en-US', options)
  }

  function getMarketStatus(cityName: string, date: Date): MarketStatus {
    const hour = date.getHours()
    const minute = date.getMinutes()
    const day = date.getDay() // 0 = Sunday, 6 = Saturday
    
    // Skip weekends for stock markets
    if (day === 0 || day === 6) {
      return { status: 'closed', text: '🔴 Market Closed (Weekend)' }
    }
    
    // Check market hours based on city
    if (cityName === 'New York') {
      // NYSE: 9:30 AM - 4:00 PM ET
      if ((hour === 9 && minute >= 30) || (hour > 9 && hour < 16)) {
        return { status: 'open', text: '🟢 NYSE Open' }
      } else if (hour === 9 && minute < 30) {
        const minsUntilOpen = 30 - minute
        return { status: 'pre', text: `⏰ NYSE Opens in ${minsUntilOpen}m` }
      } else {
        return { status: 'closed', text: '🔴 NYSE Closed' }
      }
    } else if (cityName === 'Tokyo') {
      // TSE: 9:00 AM - 3:00 PM JST
      if (hour >= 9 && hour < 15) {
        return { status: 'open', text: '🟢 TSE Open' }
      } else {
        return { status: 'closed', text: '🔴 TSE Closed' }
      }
    } else if (cityName === 'London') {
      // LSE: 8:00 AM - 4:30 PM GMT
      if (hour === 8 || (hour > 8 && hour < 16) || (hour === 16 && minute < 30)) {
        return { status: 'open', text: '🟢 LSE Open' }
      } else {
        return { status: 'closed', text: '🔴 LSE Closed' }
      }
    } else if (cityName === 'Frankfurt') {
      // XETRA: 9:00 AM - 5:30 PM CET
      if (hour >= 9 && (hour < 17 || (hour === 17 && minute < 30))) {
        return { status: 'open', text: '🟢 XETRA Open' }
      } else {
        return { status: 'closed', text: '🔴 XETRA Closed' }
      }
    }
    
    return { status: 'na', text: '' }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
        세계 시계
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {timezones.map((timezone) => {
          const time = currentTimes[timezone.name]
          if (!time) return null
          
          const { hours, minutes, seconds } = formatTime(time)
          const date = formatDate(time)
          const marketStatus = getMarketStatus(timezone.name, time)
          
          return (
            <div
              key={timezone.name}
              className="card hover:shadow-lg transition-all cursor-pointer transform hover:scale-105"
              onClick={() => window.open(`/legacy/fullscreen-clock.html?tz=${timezone.tz}`, '_blank')}
            >
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={`https://flagcdn.com/24x18/${timezone.flag}.png`} 
                  alt={timezone.name}
                  className="w-6 h-4"
                />
                <span className="text-xl font-semibold">{timezone.name}</span>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold font-mono tracking-wider">
                  {hours}:{minutes}
                  <span className="text-2xl text-text-secondary">:{seconds}</span>
                </div>
                <div className="text-sm text-text-secondary mt-2">{date}</div>
                
                {marketStatus.text && (
                  <div className={`mt-3 text-sm font-medium ${
                    marketStatus.status === 'open' ? 'text-green-400' :
                    marketStatus.status === 'closed' ? 'text-red-400' :
                    marketStatus.status === 'pre' ? 'text-yellow-400' : ''
                  }`}>
                    {marketStatus.text}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-center mt-8">
        <a 
          href="/legacy/world-clock.html" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-secondary hover:text-primary transition-colors"
        >
          <i className="fas fa-external-link-alt mr-2"></i>
          기존 페이지 보기
        </a>
      </div>
    </div>
  )
}