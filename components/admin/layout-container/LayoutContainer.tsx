import { Box, Flex, SlideFade, useBreakpointValue } from '@chakra-ui/react'
import Footer from '@components/footer'
import Nav from '@components/admin/nav'

const LayoutContainer = ({ children }) => {
  return (
    <>
      <Nav />
      <SlideFade in>
        <Flex justifyContent="center">
          <Box
            minHeight={useBreakpointValue({
              base: 'calc(100vh - 186px)',
              md: 'calc(100vh - 300px)',
            })}
            mt="1rem"
            mx={4}
            width="1500px"
            maxWidth={useBreakpointValue({
              base: '95%',
              lg: '1400px',
            })}
          >
            {children}
          </Box>
        </Flex>
        <Footer />
      </SlideFade>
    </>
  )
}

export default LayoutContainer
