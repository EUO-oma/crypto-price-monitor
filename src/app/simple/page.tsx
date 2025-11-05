export default function SimplePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">간단한 테스트 페이지</h1>
      <p className="mb-4">이 페이지는 정상적으로 작동해야 합니다.</p>
      <div className="space-y-2 bg-gray-800 p-4 rounded">
        <p>현재 시간: {new Date().toLocaleString('ko-KR')}</p>
        <p>Next.js 버전으로 마이그레이션되었습니다.</p>
      </div>
      <div className="mt-8">
        <a href="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-block">
          메인 페이지로
        </a>
      </div>
    </div>
  )
}