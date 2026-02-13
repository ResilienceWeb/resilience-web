import { memo } from 'react'

interface RichTextProps {
  html: string
}

const RichText = ({ html }: RichTextProps) => {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    ></div>
  )
}

export default memo(RichText)
