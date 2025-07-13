import { memo } from 'react'
import styles from './RichText.module.css'

const RichText = ({ html }) => {
  return (
    <div
      className={styles.description}
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    ></div>
  )
}

export default memo(RichText)
