const Spinner = () => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex h-full min-h-96 items-center justify-center"
    >
      <div className="h-16 w-16 animate-spin rounded-full border-8 border-dashed border-green-700"></div>
    </div>
  )
}

export { Spinner }
