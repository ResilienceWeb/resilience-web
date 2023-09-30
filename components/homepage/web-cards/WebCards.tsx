import NextLink from 'next/link'
import Image from 'next/image'
import { Container, Stack, Grid, Heading, Box, Link } from '@chakra-ui/react'

import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import { useWebs } from '@hooks/webs'

const WebCards = () => {
  const { webs } = useWebs()

  return (
    <Container maxW="7xl">
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
              web.published && Boolean(web.image) && web.slug !== 'ctrlshift',
          )
          .map((web) => (
            <Card key={web.id} web={web} />
          ))}
      </Grid>
    </Container>
  )
}

export default WebCards

const Card = ({ web }) => {
  return (
    <Link
      key={web.id}
      as={NextLink}
      href={`${PROTOCOL}://${web.slug}.${REMOTE_HOSTNAME}`}
    >
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
            style={{ objectFit: 'cover', objectPosition: 'bottom' }}
          />
        </Box>
        <Stack>
          <Heading color="gray.700" fontSize={'2xl'} fontFamily={'body'}>
            {web.title}
          </Heading>
          {/* <Text color={'gray.500'}>
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
          nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
          sed diam voluptua.
        </Text> */}
        </Stack>
      </Box>
    </Link>
  )
}






