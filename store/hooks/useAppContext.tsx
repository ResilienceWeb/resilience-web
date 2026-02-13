import { useContext } from 'react'
import { AppContext } from '@store/AppContext'

const useAppContext = () => {
  return useContext(AppContext)
}

export default useAppContext
