import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  useColorModeValue,
  Flex,
  chakra,
  SimpleGrid,
  VisuallyHidden,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { ReactNode } from 'react'
import {
  FaGithub,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from 'react-icons/fa'
import Image from 'next/legacy/image'

import { REMOTE_URL } from '@helpers/config'
import SignupForm from '@components/signup-form'
import LogoImage from '../../public/logo.png'

const SocialButton = ({
  children,
  label,
  href,
}: {
  children: ReactNode
  label: string
  href: string
}) => {
  return (
    <chakra.button
      bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
      rounded={'full'}
      w={8}
      h={8}
      cursor={'pointer'}
      as={'a'}
      href={href}
      target="_blank"
      display={'inline-flex'}
      alignItems={'center'}
      justifyContent={'center'}
      transition={'background 0.3s ease'}
      _hover={{
        bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
      }}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  )
}

const ListHeader = ({ children }: { children: ReactNode }) => {
  return (
    <Text fontWeight={600} fontSize={'lg'} mb={2}>
      {children}
    </Text>
  )
}

export default function Footer({ hideBorder = false }) {
  return (
    <Box
      bg="#fcfcfc"
      color="gray.600"
      borderTopColor={hideBorder ? null : 'gray.200'}
      borderTopWidth={hideBorder ? null : '1px'}
    >
      <Container as={Stack} maxW="7xl" py={10}>
        <SimpleGrid
          templateColumns={{ sm: '1fr 1fr', md: '2fr 1fr 2fr' }}
          spacing={8}
        >
          <Stack spacing={6}>
            <Box>
              <Image
                alt="Resilience Web CIC logo"
                src={LogoImage}
                width="148"
                height="55"
                unoptimized
              />
            </Box>
            <Link
              fontWeight={600}
              href="https://dinerismail.dev"
              target="_blank"
              isExternal
              _hover={{ color: 'black' }}
            >
              Built with ❤️ <span style={{ marginLeft: '3px' }}>by Diner</span>
            </Link>
            <Stack direction="row" spacing={6}>
              <SocialButton
                label="Facebook"
                href="https://www.facebook.com/resilienceweb"
              >
                <FaFacebook />
              </SocialButton>
              <SocialButton
                label="Twitter"
                href="https://twitter.com/ResilienceWeb"
              >
                <FaTwitter />
              </SocialButton>
              <SocialButton
                label="Instagram"
                href="https://instagram.com/resilienceweb"
              >
                <FaInstagram />
              </SocialButton>
              <SocialButton
                label="LinkedIn"
                href="https://www.linkedin.com/company/resilience-web"
              >
                <FaLinkedin />
              </SocialButton>
              <SocialButton
                label="Github"
                href="https://github.com/ResilienceWeb/resilience-web"
              >
                <FaGithub />
              </SocialButton>
            </Stack>
          </Stack>
          <Stack align="flex-start">
            <ListHeader>Useful links</ListHeader>
            <Link as={NextLink} href={`${REMOTE_URL}/admin`}>
              Admin login
            </Link>
            <Link as={NextLink} href={`${REMOTE_URL}/about`}>
              About us
            </Link>
            <Link as={NextLink} href="https://resilienceweb.gitbook.io">
              Knowledgebase
            </Link>
            <Link
              href="https://opencollective.com/resilience-web/donate"
              target="_blank"
              rel="noreferrer"
            >
              Donate
            </Link>
          </Stack>
          <Stack align="flex-start" justifyContent="space-between">
            <Box>
              <ListHeader>Stay up to date</ListHeader>
              <SignupForm />
            </Box>
            <Flex alignItems="center" display={{ base: 'none', md: 'flex' }}>
              <Text mr={1} fontSize="sm">
                Powered by
              </Text>
              <Image
                alt="Powered by Vercel"
                src="/vercel.svg"
                width="56"
                height="13"
              />
            </Flex>
          </Stack>
        </SimpleGrid>
      </Container>
    </Box>
  )
}
