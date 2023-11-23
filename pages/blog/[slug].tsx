import { GetStaticProps, GetStaticPaths } from 'next'
import { NextSeo } from 'next-seo'
import { GraphQLClient } from 'graphql-request'
import { Box, Heading, useBreakpointValue, Flex } from '@chakra-ui/react'
import { remark } from 'remark'
import html from 'remark-html'

import Layout from '@components/layout'
import ErrorBoundary from '@components/error-boundary'

export default function BlogPost({ post, contentHtml }) {
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
              <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
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
    const { page } = await graphcms.request<{ page: any }>(
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

    const processedContent = await remark()
      .use(html)
      .process(page.content.markdown)
    const contentHtml = processedContent.toString()

    return {
      props: {
        post: page,
        contentHtml,
      },
      revalidate: 5,
    }
  } catch (error) {
    return {
      props: { post: { notFound: true } },
    }
  }
}
