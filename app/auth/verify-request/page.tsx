import { Flex, Box, Heading } from '@chakra-ui/react'
import styles from '../auth.module.scss'

export default function VerifyRequestPage() {
  return (
    <div className={styles.root}>
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <Box
          bgColor="#ffffff"
          p={12}
          borderRadius={12}
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <Heading as="h1" mb={4}>
            Check your email
          </Heading>

          <p>A sign in link has been sent to your email address.</p>
        </Box>
      </Flex>
    </div>
  )
}
