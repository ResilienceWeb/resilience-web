'use client'
import {
  Box,
  Flex,
  SlideFade,
  useBreakpointValue,
  useDisclosure,
  ChakraProvider,
  defineStyleConfig,
  extendTheme,
} from '@chakra-ui/react'
import Footer from '@components/footer'
import Nav from '@components/admin/nav'
import Sidebar from '@components/admin/sidebar'

const Button = defineStyleConfig({
  defaultProps: {
    colorScheme: 'rw',
  },
  variants: {
    outline: {
      color: 'rw.900',
      borderColor: 'rw.900',
      borderRadius: '10px',
      _hover: {
        bg: 'rw.100',
        color: 'rw.900',
      },
    },
    rw: {
      color: 'white',
      bg: 'rw.700',
      borderRadius: '10px',
      _hover: {
        bg: 'rw.900',
        _disabled: {
          bg: 'rw.900',
        },
      },
    },
    solid: {
      borderRadius: '10px',
    },
  },
})

const theme = extendTheme({
  styles: {
    global: {
      'button:focus': {
        boxShadow: 'none !important',
      },
      'input:focus': {
        boxShadow: 'none !important',
      },
    },
  },
  components: {
    Button,
  },
  colors: {
    rw: {
      100: '#dff7e2',
      200: '#b4fdbd',
      300: '#8fef99',
      400: '#75d77e',
      500: '#64b46c',
      600: '#429466',
      700: '#3A8159',
      800: '#219152',
      900: '#09622f',
    },
  },
  fonts: {
    body: "'Poppins', sans-serif",
    heading: "'Poppins', sans-serif",
  },
})

const LayoutContainer = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <ChakraProvider theme={theme}>
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
              minHeight="calc(100vh - 186px)"
            >
              {children}
            </Box>
          </SlideFade>
          <Footer />
        </Box>
      </Flex>
    </ChakraProvider>
  )
}

export default LayoutContainer
