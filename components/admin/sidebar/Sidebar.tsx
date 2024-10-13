import dynamic from 'next/dynamic'
import { Box, Drawer, DrawerContent } from '@chakra-ui/react'

const SidebarContent = dynamic(() => import('./SidebarContent'), {
  ssr: false,
})

export default function Sidebar({ isOpen, onClose }) {
  return (
    <Box
      position="relative"
      height="100vh"
      width={{ base: '0', lg: '240px' }}
      flexShrink="0"
    >
      <SidebarContent
        closeMenu={onClose}
        display={{ base: 'none', lg: 'block' }}
      />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent closeMenu={onClose} />
        </DrawerContent>
      </Drawer>
    </Box>
  )
}
