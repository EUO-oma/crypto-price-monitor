export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-border-color border-t-primary rounded-full animate-spin"></div>
    </div>
  )
}