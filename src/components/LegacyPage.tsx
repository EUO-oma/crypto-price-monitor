'use client'

import { useEffect, useState } from 'react'

interface LegacyPageProps {
  src: string
  title?: string
}

export default function LegacyPage({ src, title }: LegacyPageProps) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Reset loading state when src changes
    setLoading(true)
  }, [src])

  return (
    <div className="w-full h-full min-h-[calc(100vh-80px)]">
      {loading && (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-3xl mb-4"></i>
            <p className="text-text-secondary">페이지 로딩 중...</p>
          </div>
        </div>
      )}
      
      <iframe
        src={src}
        title={title || 'Legacy Page'}
        className={`w-full h-full min-h-[calc(100vh-80px)] border-0 ${loading ? 'hidden' : ''}`}
        onLoad={() => setLoading(false)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}