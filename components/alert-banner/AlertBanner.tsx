import { memo } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
} from 'lucide-react'
import { cn } from '@components/lib/utils'

interface IAlertProps {
  type: 'info' | 'warning' | 'success' | 'loading' | 'error'
  content: string
  url?: string
  colorScheme?: string
}

const AlertBanner: React.FC<IAlertProps> = ({
  type,
  content,
  url,
  colorScheme = 'blue',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />
      case 'success':
        return <CheckCircle className="h-5 w-5" />
      case 'error':
        return <AlertCircle className="h-5 w-5" />
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getColorClasses = () => {
    if (colorScheme === 'rw') {
      return 'bg-green-600 text-white'
    }

    switch (type) {
      case 'info':
        return 'bg-blue-500 text-white'
      case 'warning':
        return 'bg-yellow-500 text-white'
      case 'success':
        return 'bg-green-600 text-white'
      case 'error':
        return 'bg-red-600 text-white'
      case 'loading':
        return 'bg-blue-600 text-white'
      default:
        return 'bg-blue-600 text-white'
    }
  }

  const AlertContent = () => (
    <div className={cn('flex w-full justify-center', getColorClasses())}>
      <div className="flex max-w-7xl items-center gap-2 px-4 py-2">
        {getIcon()}
        <p className="text-sm">{content}</p>
      </div>
    </div>
  )

  if (url) {
    return (
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full"
      >
        <AlertContent />
      </Link>
    )
  }

  return <AlertContent />
}

export default memo(AlertBanner)
