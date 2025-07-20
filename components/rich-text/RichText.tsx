import { memo } from 'react'
import styles from './RichText.module.css'

type TextSize = 'small' | 'medium'

interface RichTextProps {
  html: string
  textSize?: TextSize
}

const RichText = ({ html, textSize = 'medium' }: RichTextProps) => {
  const textSizeClass = textSize === 'small' ? styles.small : styles.medium
  
  return (
    <div
      className={`${styles.description} ${textSizeClass}`}
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    ></div>
  )
}

export default memo(RichText)
