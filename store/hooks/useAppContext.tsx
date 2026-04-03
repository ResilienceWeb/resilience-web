import { use } from 'react'
import { AppContext } from '@store/AppContext'

const useAppContext = () => {
  return use(AppContext)
}

export default useAppContext
