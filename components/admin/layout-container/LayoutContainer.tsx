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
    <>
      <Flex>
        <Sidebar isOpen={isOpen} onClose={onClose} />
        <Box flex="1">
          <Nav onOpen={onOpen} />
          <SlideFade in>
            <Box
              minHeight={useBreakpointValue({
                base: 'calc(100vh - 186px)',
                md: 'calc(100vh - 300px)',
              })}
              mt="1rem"
              mx={4}
              flex={1}
              maxWidth="95%"
            >
              {children}
            </Box>
          </SlideFade>
        </Box>
      </Flex>
      <Footer />
    </>
  )
}

export default LayoutContainer
