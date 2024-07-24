/* eslint-disable @typescript-eslint/no-misused-promises */
import React from 'react'
import NextLink from 'next/link'
import { Button, Input, Flex, Box, Text, Center, Link } from '@chakra-ui/react'
import Image from 'next/image'
import { signIn } from '@auth'
import LogoImage from '../../../public/logo.png'
import styles from '../auth.module.scss'

export default function SignUpPage() {
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
          <Center mb="2rem">
            <Text fontSize="md">Welcome! Enter your email to get started:</Text>
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
              Sign up
            </Button>
          </form>
        </Box>
        <Box bgColor="#ffffff" p={6} borderRadius={12} width="400px">
          Already have an account?{' '}
          <Link
            as={NextLink}
            href="/auth/signin"
            color="rw.900"
            _hover={{ color: 'rw.700' }}
          >
            Sign in
          </Link>
        </Box>
      </Flex>
    </div>
  )
}
