import { memo } from 'react'
import DOMPurify from 'dompurify'
import styles from './DescriptionRichText.module.scss'

const DescriptionRichText = ({ html }) => {
  return (
    <div
      className={styles.description}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(html),
      }}
    ></div>
  )
}

export default memo(DescriptionRichText)
