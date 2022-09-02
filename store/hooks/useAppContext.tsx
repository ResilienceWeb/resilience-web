import { AppContext } from '@store/AppContext'
import { useContext } from 'react'

const useAppContext = () => {
  return useContext(AppContext)
}

export default useAppContext
