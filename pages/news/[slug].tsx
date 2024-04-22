import { GetStaticProps, GetStaticPaths } from 'next'
import Image from 'next/image'
import { NextSeo } from 'next-seo'
import { GraphQLClient } from 'graphql-request'
import { Box, Heading } from '@chakra-ui/react'
import { remark } from 'remark'
import html from 'remark-html'

import Layout from '@components/layout'
import ErrorBoundary from '@components/error-boundary'

export default function NewsPost({ post, contentHtml }) {
  if (!post || !contentHtml) {
    return {
      notFound: true,
      revalidate: 10,
    }
  }

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
          mb={{ base: '1.5rem', md: '2.5rem' }}
        >
          {post.title}
        </Heading>
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
          mb={8}
        >
          <ErrorBoundary>
            <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
          </ErrorBoundary>
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
    fallback: false,
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
}
