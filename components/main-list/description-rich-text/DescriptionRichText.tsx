import { memo } from 'react'
import styles from './DescriptionRichText.module.css'

const DescriptionRichText = ({ html }) => {
  return (
    <div
      className={styles.description}
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    ></div>
  )
}

export default memo(DescriptionRichText)
