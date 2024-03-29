import { HiHeart } from 'react-icons/hi'
import { Link } from '@chakra-ui/react'

import styles from './DonateButton.module.scss'

const DonateButton = () => {
  return (
    <Link href="https://opencollective.com/resilience-web" target="_blank">
      <button className={styles.donateButton}>
        Donate &nbsp;
        <HiHeart />
      </button>
    </Link>
  )
}

export default DonateButton
