import { getCsrfToken } from 'next-auth/react'
import type { GetServerSideProps } from 'next'
import { Button, Input, Flex, Box } from '@chakra-ui/react'
import Image from 'next/legacy/image'
import LogoImage from '../../public/logo.png'
import styles from './auth.module.scss'

export default function SignIn({ csrfToken }) {
  return (
    <div className={styles.root}>
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <Box bgColor="#ffffff" p={12} borderRadius={12} opacity="0.9">
          <Box mb={16} display="flex" justifyContent="center">
            <Image
              alt="Resilience Web logo"
              src={LogoImage}
              width="306"
              height="104"
            />
          </Box>
          <form
            method="post"
            action="/api/auth/signin/email"
            style={{ width: '300px' }}
          >
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
            <label htmlFor="email">
              Email
              <Input type="email" id="email" name="email" />
            </label>
            <Button
              type="submit"
              bg="rw.700"
              colorScheme="rw.700"
              mt={2}
              width="100%"
              _hover={{ bg: 'rw.900' }}
            >
              Sign in
            </Button>
          </form>
        </Box>
      </Flex>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const csrfToken = await getCsrfToken(context)
  return {
    props: { csrfToken },
  }
}
