import { memo } from 'react'

interface RichTextProps {
  className?: string
  html: string
}

const RichText = ({ className, html }: RichTextProps) => {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    ></div>
  )
}

export default memo(RichText)
