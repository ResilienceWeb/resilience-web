import type { FC } from 'react'
import { FiShare2 } from 'react-icons/fi'
import useShare from '@hooks/application/useShare'

interface ShareButtonProps {
  url: string
  title: string
  description: string
  label?: string
}

const ShareButton: FC<ShareButtonProps> = ({
  url,
  title,
  description,
  label,
}) => {
  const { share } = useShare()

  const handleShare = () => {
    share(url, title, description)
  }

  if (!navigator.share) {
    return null
  }

  if (label) {
    return (
      <button
        onClick={handleShare}
        className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
      >
        {label}
      </button>
    )
  }

  return (
    <button
      onClick={handleShare}
      className="group inline-flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-indigo-50 to-purple-50 text-indigo-500/80 shadow-xs ring-1 ring-indigo-100/50 transition-all hover:from-indigo-100 hover:to-purple-100 hover:text-indigo-600 hover:shadow-md hover:ring-indigo-200"
    >
      <FiShare2 className="ml-[-2px] h-5 w-5 transition-transform group-hover:scale-110" />
    </button>
  )
}

export default ShareButton
