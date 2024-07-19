'use client'
import {
  Box,
  Flex,
  SlideFade,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react'
import Footer from '@components/footer'
import Nav from '@components/admin/nav'
import Sidebar from '@components/admin/sidebar'

const LayoutContainer = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Flex>
      <Sidebar isOpen={isOpen} onClose={onClose} />
      <Box maxWidth={{ base: '100%', lg: 'calc(100% - 239px)' }} flex="1">
        <Nav onOpen={onOpen} />
        <SlideFade in>
          <Box
            data-testid="test"
            mt="1rem"
            mx={4}
            flex={1}
            minHeight={useBreakpointValue({
              base: 'calc(100vh - 186px)',
              md: 'calc(100vh - 328px)',
            })}
          >
            {children}
          </Box>
        </SlideFade>
        <Footer />
      </Box>
    </Flex>
  )
}

export default LayoutContainer
