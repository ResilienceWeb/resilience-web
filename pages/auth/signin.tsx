import { getCsrfToken } from 'next-auth/react'
import type { GetServerSideProps } from 'next'
import NextLink from 'next/link'
import {
  Button,
  Input,
  Flex,
  Box,
  Heading,
  Center,
  Link,
} from '@chakra-ui/react'
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
        <Box bgColor="#ffffff" p={12} borderRadius={12} mb="2rem" width="400px">
          <Box mb="1rem" display="flex" justifyContent="center">
            <Image
              alt="Resilience Web logo"
              src={LogoImage}
              width="306"
              height="104"
            />
          </Box>
          <Center mb="3rem">
            <Heading as="h2" fontSize="2xl">
              Sign in
            </Heading>
          </Center>
          <form method="post" action="/api/auth/signin/email">
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
            <label htmlFor="email">
              Email
              <Input type="email" id="email" name="email" />
            </label>
            <Button type="submit" mt={2} width="100%" variant="rw">
              Sign in
            </Button>
          </form>
        </Box>
        <Box bgColor="#ffffff" p={6} borderRadius={12} width="400px">
          Not a member of Resilience Web?{' '}
          <Link
            as={NextLink}
            href="/auth/signup"
            color="rw.900"
            _hover={{ color: 'rw.700' }}
          >
            Sign up
          </Link>
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
