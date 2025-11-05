'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error('Global error:', error)
  
  return (
    <html>
      <body>
        <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">전역 오류가 발생했습니다</h2>
            <p className="mb-4 text-red-500">{error.message}</p>
            <details className="mb-4 text-left bg-gray-800 p-4 rounded">
              <summary className="cursor-pointer">오류 상세 정보</summary>
              <pre className="mt-2 text-xs overflow-auto">{error.stack}</pre>
            </details>
            <button
              onClick={reset}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}