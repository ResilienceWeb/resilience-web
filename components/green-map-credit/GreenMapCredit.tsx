import { cn } from '@components/lib/utils'

// Green Map System let us use their icons on condition that they're credited.
export default function GreenMapCredit({ className }: { className?: string }) {
  return (
    <p className={cn('text-sm', className)}>
      Icons by{' '}
      <a
        href="https://greenmap.org"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-gray-900"
      >
        Green Map System
      </a>
      , used with permission
    </p>
  )
}
