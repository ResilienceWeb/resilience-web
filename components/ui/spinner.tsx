const Spinner = ({ className }: { className?: string }) => {
  return (
    <div
      className={`absolute bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 ${className}`}
    >
      <div className="h-16 w-16 animate-spin rounded-full border-8 border-dashed border-blue-600"></div>
    </div>
  )
}

export { Spinner }
