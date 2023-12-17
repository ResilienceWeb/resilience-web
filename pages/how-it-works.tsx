import { NextSeo } from 'next-seo'
import { GetStaticProps } from 'next'
import Image from 'next/legacy/image'
import {
  Box,
  Heading,
  chakra,
  useColorModeValue,
  SimpleGrid,
  Button,
  Link,
  Text,
  Flex,
} from '@chakra-ui/react'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import crwScreenshot1 from '../public/crw-screenshot-1.png'
import crwScreenshot2 from '../public/crw-screenshot-2.png'
import crwScreenshot3 from '../public/crw-screenshot-3.png'
import { fetchWebsHydrate } from '@hooks/webs/useWebs'
import Layout from '@components/layout'

const HowItWorks = () => {
  return (
    <>
      <NextSeo
        title="How Resilience Web works | Resilience Web"
        description="A platform that weaves together groups working on social and environmental change in order to foster collaboration and fuel social change."
        openGraph={{
          title: 'How it works | Resilience Web',
          description:
            'A platform that weaves together groups working on social and environmental change in order to foster collaboration and fuel social change.',
        }}
      />
      <Layout applyPostStyling>
        <Box p={4} maxW={'5xl'}>
          <Heading as="h1" mb={8}>
            How Resilience Web works
          </Heading>
          <Features />
        </Box>
      </Layout>
    </>
  )
}

function Features() {
  return (
    <>
      <SimpleGrid
        alignItems="start"
        columns={{ base: 1, md: 2 }}
        flexDirection="column-reverse"
        mb={24}
        spacingY={{ base: 10, md: 32 }}
        spacingX={{ base: 10, md: 24 }}
      >
        <Image src={crwScreenshot3} alt="" />
        <Box>
          <chakra.h2
            mb={4}
            fontSize={{ base: '2xl', md: '4xl' }}
            fontWeight={600}
            letterSpacing="tight"
            textAlign={{ base: 'center', md: 'left' }}
            color={useColorModeValue('gray.900', 'gray.400')}
            lineHeight={{ md: 'shorter' }}
          >
            Website visitors can navigate the interactive web to discover new
            organisations
          </chakra.h2>
          <chakra.p
            mb={5}
            textAlign={{ base: 'center', sm: 'left' }}
            color={useColorModeValue('gray.600', 'gray.400')}
            fontSize={{ md: 'lg' }}
          >
            Categories group organisations with similar purviews — presenting
            opportunities for collaboration and resource sharing.
          </chakra.p>
        </Box>
      </SimpleGrid>
      <SimpleGrid
        alignItems="start"
        columns={{ base: 1, md: 2 }}
        flexDirection="column-reverse"
        mb={24}
        spacingY={{ base: 10, md: 32 }}
        spacingX={{ base: 10, md: 24 }}
      >
        <Image src={crwScreenshot2} alt="" />
        <Box>
          <chakra.h2
            mb={4}
            fontSize={{ base: '2xl', md: '4xl' }}
            fontWeight={600}
            letterSpacing="tight"
            textAlign={{ base: 'center', md: 'left' }}
            color={useColorModeValue('gray.900', 'gray.400')}
            lineHeight={{ md: 'shorter' }}
          >
            Filter and search to find groups to get involved with
          </chakra.h2>
          <chakra.p
            mb={5}
            textAlign={{ base: 'center', sm: 'left' }}
            color={useColorModeValue('gray.600', 'gray.400')}
            fontSize={{ md: 'lg' }}
          >
            Filter for groups looking for volunteers, or search and easily get
            in touch with any group on our platform.
          </chakra.p>
        </Box>
      </SimpleGrid>
      <SimpleGrid
        alignItems="start"
        columns={{ base: 1, md: 2 }}
        mb={24}
        spacingY={{ base: 10, md: 32 }}
        spacingX={{ base: 10, md: 24 }}
      >
        <Image
          src={crwScreenshot1}
          alt="Screenshot of the admin dashboard of the Resilience Web"
        />
        <Box>
          <chakra.h2
            mb={4}
            fontSize={{ base: '2xl', md: '4xl' }}
            fontWeight={600}
            textAlign={{ base: 'center', md: 'left' }}
            color="gray.900"
            lineHeight={{ md: 'shorter' }}
          >
            Listings are maintained by people from each group
          </chakra.h2>
          <chakra.p
            mb={5}
            textAlign={{ base: 'center', sm: 'left' }}
            color="gray.600"
            fontSize={{ md: 'lg' }}
          >
            As an editor, you can edit your listing's details, cover image,
            maintain a personalised page and even request volunteers. New
            features are added every month.
          </chakra.p>
        </Box>
      </SimpleGrid>
      <Flex direction="column" alignItems="center" mb={8}>
        <Link href="https://calendly.com/resilience-web/intro-call" isExternal>
          <Button colorScheme="blue" size="lg" px={8} mb={4}>
            Book a welcome call
          </Button>
        </Link>
        <Text
          maxWidth="400px"
          color="gray.600"
          align="center"
          style={{ fontSize: '15px' }}
        >
          Do you need technical help? Do you have questions about the platform?
          Or feedback? If so, you can book a 20 min slot to have a chat with
          Diner.
        </Text>
      </Flex>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const queryClient = new QueryClient()
  await queryClient.fetchQuery({
    queryKey: ['webs'],
    queryFn: () => fetchWebsHydrate({ published: true }),
  })

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 60,
  }
}

export default HowItWorks
