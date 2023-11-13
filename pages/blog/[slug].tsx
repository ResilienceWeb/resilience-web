import { GetStaticProps, GetStaticPaths } from 'next'
import { NextSeo } from 'next-seo'
import { GraphQLClient } from 'graphql-request'
import ReactMarkdown from 'react-markdown'
import { Box, Heading, useBreakpointValue, Flex } from '@chakra-ui/react'

import Layout from '@components/layout'
import ErrorBoundary from '@components/error-boundary'

export default function BlogPost({ post }) {
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
        <Flex justifyContent="center">
          <Box
            maxWidth={useBreakpointValue({
              base: '90%',
              md: '650px',
            })}
            mb={8}
          >
            <Heading as="h1" mb={8}>
              {post.title}
            </Heading>
            <ErrorBoundary>
              <ReactMarkdown>{post.content.markdown}</ReactMarkdown>
            </ErrorBoundary>
          </Box>
        </Flex>
      </Layout>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const graphcms = new GraphQLClient(process.env.GRAPHCMS_URL)

  const { pages } = await graphcms.request<{ pages: [] }>(`{
    pages {
      slug
      title
      }
    }`)

  const paths = pages.map(({ slug }) => `/blog/${slug}`)

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const graphcms = new GraphQLClient(process.env.GRAPHCMS_URL)

  try {
    const { page } = await graphcms.request<{ page: object }>(
      `
      query BlogPostQuery($slug: String!){
        page(where: {slug: $slug}) {
          slug
          title
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

    return {
      props: {
        post: page,
      },
      revalidate: 5,
    }
  } catch (error) {
    return {
      props: { post: { notFound: true } },
    }
  }
}

