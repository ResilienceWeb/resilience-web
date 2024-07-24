/* eslint-disable @typescript-eslint/no-misused-promises */
import React from 'react'
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
import Image from 'next/image'
import { signIn } from '@auth'
import LogoImage from '../../../public/logo.png'
import styles from '../auth.module.scss'

export default function SignInPage() {
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
          <form
            action={async (formData) => {
              'use server'
              try {
                const email = formData.get('email')
                await signIn('email', { email })
              } catch (error) {
                // if (error instanceof AuthError) {
                //   return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`)
                // }
                throw error
              }
            }}
          >
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
