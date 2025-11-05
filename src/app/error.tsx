'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-danger mb-4">오류가 발생했습니다</h1>
        <p className="text-text-secondary mb-8">
          예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        <button
          onClick={reset}
          className="btn-primary mr-4"
        >
          다시 시도
        </button>
        <a href="/" className="btn-secondary">
          홈으로
        </a>
      </div>
    </div>
  )
}