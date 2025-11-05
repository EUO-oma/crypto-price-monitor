type EmptyStateProps = {
  onAddClick: () => void
}

export default function EmptyState({ onAddClick }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl text-text-secondary mb-4">
        <i className="far fa-calendar"></i>
      </div>
      <h3 className="text-2xl font-semibold mb-2">등록된 일정이 없습니다</h3>
      <p className="text-text-secondary mb-6">첫 번째 일정을 추가해보세요!</p>
      <button onClick={onAddClick} className="btn-primary">
        <i className="fas fa-plus mr-2"></i>일정 추가
      </button>
    </div>
  )
}