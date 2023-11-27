import Image from 'next/legacy/image'
import NextLink from 'next/link'
import { GraphQLClient } from 'graphql-request'
import {
  Box,
  Grid,
  Heading,
  Text,
  Stack,
  useBreakpointValue,
  Link,
  Flex,
  Divider,
} from '@chakra-ui/react'
import Layout from '@components/layout'

const Blog = ({ posts }) => {
  return (
    <Layout>
      <Flex justifyContent="center">
        <Box
          maxWidth={useBreakpointValue({ base: '90%', md: '850px' })}
          my="2rem"
        >
          <Heading as="h1" mb="0.75rem">
            News
          </Heading>
          <Text mb="0.75rem" fontSize="1.125rem" color="gray.600">
            News & updates from the Resilience Web team
          </Text>
          <Divider mb="2.5rem" />
          <Grid
            templateColumns={useBreakpointValue({
              base: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
            })}
            gap={useBreakpointValue({ base: 8, md: 16 })}
          >
            {posts.map((post) => {
              const postDateFormatted = Intl.DateTimeFormat('en-gb', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }).format(new Date(post.date))

              return (
                <Link as={NextLink} href={`blog/${post.slug}`} key={post.slug}>
                  <Box
                    cursor="pointer"
                    maxW={'445px'}
                    w={'full'}
                    bg="white"
                    boxShadow="xl"
                    rounded={'md'}
                    p={6}
                    overflow={'hidden'}
                    transition="box-shadow 300ms ease-in-out"
                    _hover={{ boxShadow: '2xl' }}
                  >
                    <Box
                      h={'210px'}
                      bg={'gray.100'}
                      mt={-6}
                      mx={-6}
                      mb={6}
                      pos={'relative'}
                    >
                      <Image
                        src={post.coverImage?.url}
                        layout="fill"
                        objectFit="cover"
                      />
                    </Box>
                    <Stack>
                      <Heading
                        color="gray.700"
                        fontSize={'2xl'}
                        fontFamily={'body'}
                      >
                        {post.title}
                      </Heading>
                      {/* <Text color={'gray.500'}>{post.excerpt}</Text> */}
                    </Stack>
                    <Stack
                      mt={6}
                      direction={'row'}
                      spacing={4}
                      align={'center'}
                    >
                      <Stack direction={'column'} spacing={0} fontSize={'sm'}>
                        <Text as="time" color={'gray.500'}>
                          {postDateFormatted}
                        </Text>
                      </Stack>
                    </Stack>
                  </Box>
                </Link>
              )
            })}
          </Grid>
        </Box>
      </Flex>
    </Layout>
  )
}

export async function getStaticProps() {
  const graphcms = new GraphQLClient(process.env.GRAPHCMS_URL)

  const { pages } = await graphcms.request<{ pages: [] }>(
    `
  {
    pages(where: { displayInBlogSection: true }, orderBy: date_DESC) {
      slug
      title
      date
      excerpt
      displayInBlogSection
      coverImage {
        url
      }
    }
  }`,
  )

  return {
    props: {
      posts: pages,
    },
    revalidate: 10,
  }
}

export default Blog
