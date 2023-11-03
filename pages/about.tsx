import { GetStaticProps } from 'next'
import { NextSeo } from 'next-seo'
import { GraphQLClient } from 'graphql-request'
import ReactMarkdown from 'react-markdown'
import { Box, Heading, useBreakpointValue, Flex } from '@chakra-ui/react'
import { dehydrate, QueryClient } from '@tanstack/react-query'

import ErrorBoundary from '@components/error-boundary'
import Layout from '@components/layout'
import { fetchWebsHydrate } from '@hooks/webs/useWebs'

const About = ({ page }) => {
  return (
    <>
      <NextSeo
        title="About | Resilience Web"
        description="Two webs of resilience, showing the environmental and social justice groups in your city"
        openGraph={{
          title: 'About | Resilience Web',
          description:
            'Two webs of resilience, showing the environmental and social justice groups in your city',
          url: 'https://resilienceweb.org.uk/about',
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
              {page.title}
            </Heading>
            <ErrorBoundary>
              <ReactMarkdown>{page.content.markdown}</ReactMarkdown>
            </ErrorBoundary>
          </Box>
        </Flex>
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const graphcms = new GraphQLClient(process.env.GRAPHCMS_URL)

  const queryClient = new QueryClient()
  await queryClient.fetchQuery({
    queryKey: ['webs'],
    queryFn: fetchWebsHydrate,
  })

  const { page } = await graphcms.request<{ page: any }>(`
	{
		page(where: {slug: "about"}) {
			content {
				markdown
			}
			title
		}
	}
	`)

  return {
    props: {
      page,
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 60,
  }
}

export default About
