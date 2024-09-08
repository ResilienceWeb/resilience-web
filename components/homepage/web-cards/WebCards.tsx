import NextLink from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Container,
  Button,
  Stack,
  Text,
  Grid,
  Heading,
  Box,
  Link,
} from '@chakra-ui/react'

import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'

// Hardcoded array to determine which webs are displayed first
const orderOnHomepage = ['Cambridge', 'York', 'Norwich', 'Durham']

const WebCards = ({ webs }) => {
  return (
    <Container maxW="7xl" id="web-cards">
      <Heading as="h2" fontSize="2rem" my="1rem">
        Find Resilience Webs near you in the UK
      </Heading>
      <Grid
        templateColumns={{
          base: '1fr',
          md: 'repeat(3, 1fr)',
        }}
        gap="1rem"
      >
        {webs
          ?.filter(
            (web) =>
              Boolean(web.image) &&
              web.slug !== 'ctrlshift' &&
              web.slug !== 'transition-uk',
          )
          .sort((a, b) => {
            if (
              orderOnHomepage.includes(a.title) >
              orderOnHomepage.includes(b.title)
            ) {
              return -1
            } else {
              return 1
            }
          })
          .map((web) => <Card key={web.id} web={web} />)}

        <CreateNewWebCard />
      </Grid>
    </Container>
  )
}

export default WebCards

const Card = ({ web }) => {
  return (
    <Link as={NextLink} href={`${PROTOCOL}://${web.slug}.${REMOTE_HOSTNAME}`}>
      <Box
        w="full"
        bg="white"
        boxShadow="md"
        rounded="md"
        p={4}
        overflow="hidden"
        transition="box-shadow 300ms ease-in-out"
        _hover={{
          boxShadow: '2xl',
        }}
      >
        <Box h="210px" bg="gray.100" mt={-4} mx={-6} mb={4} pos="relative">
          <Image
            alt={`Image representing ${web.title} web`}
            src={web.image}
            fill={true}
            sizes="(max-width: 768px) 90vw, 400px"
            style={{ objectFit: 'cover', objectPosition: 'bottom' }}
          />
        </Box>
        <Heading color="gray.700" fontSize="2xl">
          {web.title}
        </Heading>
      </Box>
    </Link>
  )
}

const CreateNewWebCard = () => {
  const router = useRouter()

  const handleClick = () => {
    router.push('/auth/signup')
  }

  return (
    <Box
      w="full"
      h="full"
      bg="white"
      boxShadow="md"
      rounded="md"
      p={4}
      overflow="hidden"
      transition="box-shadow 300ms ease-in-out"
      _hover={{
        boxShadow: '2xl',
      }}
      background="#defce2"
      display="flex"
      justifyContent="center"
      alignItems="center"
      onClick={handleClick}
    >
      <Stack display="flex">
        <Stack>
          <Heading fontSize="2xl">Put your place here</Heading>
          <Text fontSize="sm">Click here to create a web for your area</Text>
        </Stack>
        <Button as={NextLink} href="/auth/signup" variant="rw">
          Create new web
        </Button>
      </Stack>
    </Box>
  )
}
