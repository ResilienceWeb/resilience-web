import { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Error from 'next/error'
import Head from 'next/head'
import { NextSeo } from 'next-seo'
import { GraphQLClient } from 'graphql-request'
import { Flex, Text, Box, Heading } from '@chakra-ui/react'
import { remark } from 'remark'
import html from 'remark-html'

import Layout from '@components/layout'
import ErrorBoundary from '@components/error-boundary'
import SignupForm from '@components/signup-form'

export default function NewsPost({ post, contentHtml }) {
  const router = useRouter()
  if (router.isFallback) {
    return (
      <section>
        <h1>Please wait…</h1>
      </section>
    )
  }

  if (!post || !contentHtml) {
    return (
      <section>
        <Head>
          <meta name="robots" content="noindex" />
        </Head>
        <Error statusCode={404} />
      </section>
    )
  }

  const postDateFormatted = Intl.DateTimeFormat('en-gb', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(post.date))

  return (
    <>
      <NextSeo
        title={`${post.title} | Resilience Web`}
        description={post.excerpt}
        openGraph={{
          title: `${post.title} | Resilience Web`,
          description: post.excerpt,
          images: [{ url: post.coverImage?.url }],
        }}
      />
      <Layout applyPostStyling>
        <Heading
          as="h1"
          textAlign="center"
          /* @ts-ignore */
          textwrap="pretty"
          mt={{ base: '1rem', md: '1.5rem' }}
        >
          {post.title}
        </Heading>
        <Flex
          justifyContent="center"
          width={{
            base: '90%',
            md: '650px',
          }}
          mt="0.5rem"
          mb={{ base: '1.5rem', md: '1.5rem' }}
        >
          {post.author?.name && (
            <Text fontWeight="600">{post.author.name}&nbsp;•&nbsp;</Text>
          )}
          <Text as="time">{postDateFormatted}</Text>
        </Flex>
        {post.coverImage?.url && (
          <Box
            overflow="hidden"
            position="relative"
            mb="2rem"
            width={{ base: '100vw', md: '850px' }}
            height={{ base: '250px', md: '400px' }}
            borderRadius={{ base: 'none', md: '12px' }}
          >
            <Image
              alt={`Cover image for post: ${post.title}`}
              src={post.coverImage?.url}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 850px"
              style={{
                objectFit: 'cover',
              }}
            />
          </Box>
        )}
        <Box
          maxWidth={{
            base: '90%',
            md: '650px',
          }}
          mb="3rem"
        >
          <ErrorBoundary>
            <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
          </ErrorBoundary>
        </Box>

        <Box mb="3rem">
          <Text
            fontWeight={600}
            mb={2}
            style={{
              color: 'var(--chakra-colors-rw-900)',
              fontSize: 'var(--chakra-fontSizes-xl)',
            }}
          >
            Sign up to our mailing list to stay up to date
          </Text>
          <SignupForm />
        </Box>
      </Layout>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const graphcms = new GraphQLClient(process.env.GRAPHCMS_URL)

  const { pages } = await graphcms.request<{ pages: [] }>(`{
    pages {
      slug
      }
    }`)

  const paths = pages.map(({ slug }) => `/news/${slug}`)

  return {
    paths,
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const graphcms = new GraphQLClient(process.env.GRAPHCMS_URL)

  const { page } = await graphcms.request<{ page: any }>(
    `
      query NewsPostQuery($slug: String!){
        page(where: {slug: $slug}) {
          slug
          title
          author {
            name
          }
          date
          excerpt
          displayInBlogSection
          coverImage {
            url
          }
          content {
            markdown
          }
        }
      }`,
    {
      slug: params.slug,
    },
  )

  const processedContent = await remark()
    .use(html)
    .process(page.content.markdown)
  const contentHtml = processedContent.toString()

  return {
    props: {
      post: page,
      contentHtml,
    },
    revalidate: 3600,
  }
}
