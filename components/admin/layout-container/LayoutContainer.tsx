'use client'
import { useToggle } from 'usehooks-ts'
import Footer from '@components/footer'
import Nav from '@components/admin/nav'
import Sidebar from '@components/admin/sidebar'

const LayoutContainer = ({ children }) => {
  const [isOpen, _toggle, setIsOpen] = useToggle()
  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)

  return (
    <div className="flex">
      <Sidebar isOpen={isOpen} onClose={onClose} />
      <div className="w-full flex-1 lg:max-w-[calc(100%-239px)]">
        <Nav onOpen={onOpen} />
        <div className="mx-4 mt-4 min-h-[calc(100vh-186px)] flex-1 md:min-h-[calc(100vh-328px)]">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  )
}

export default LayoutContainer
