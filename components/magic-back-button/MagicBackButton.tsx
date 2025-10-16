import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { usePageTracker } from '@helpers/page-tracker/usePageTracker'
import type { ButtonHTMLAttributes } from 'react'

type MagicBackButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  backLink?: string
}

export const MagicBackButton = ({
  className,
  onClick,
  children,
  backLink = '/',
  ...props
}: MagicBackButtonProps) => {
  const router = useRouter()
  const isFirstPage = usePageTracker((state) => state.isFirstPage)
  return (
    <button
      className={className}
      onClick={(e) => {
        if (isFirstPage) {
          router.push(backLink)
        } else {
          router.back()
        }
        onClick?.(e)
      }}
      {...props}
    >
      {children ?? <ChevronLeft />}
    </button>
  )
}
