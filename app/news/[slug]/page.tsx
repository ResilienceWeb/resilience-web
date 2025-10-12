import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GraphQLClient } from 'graphql-request'
import { remark } from 'remark'
import html from 'remark-html'
import NewsItem from './NewsItem'

export default async function NewsItemPage(props) {
  const params = await props.params
  const { post, contentHtml } = await getNewsItem({ slug: params.slug })

  if (!post || !contentHtml) {
    console.log(
      `[RW] Listing not found for slugs ${params.subdomain}, ${params.slug}`,
    )
    return null
  }

  return <NewsItem post={post} contentHtml={contentHtml} />
}

export async function generateMetadata(props): Promise<Metadata> {
  const params = await props.params
  const { post } = await getNewsItem({ slug: params.slug })

  if (!post) {
    return null
  }

  return {
    title: `${post.title} | Resilience Web`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | Resilience Web`,
      description: post.excerpt,
      images: [{ url: post.coverImage?.url }],
    },
  }
}

export async function generateStaticParams() {
  const graphcms = new GraphQLClient(process.env.GRAPHCMS_URL)

  const { pages } = await graphcms.request<{ pages: [] }>(`{
    pages {
      slug
      }
    }`)

  return pages.map(({ slug }) => ({
    slug,
  }))
}

async function getNewsItem({ slug }): Promise<any> {
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
      slug: slug,
    },
  )

  if (!page) {
    return notFound()
  }

  const processedContent = await remark()
    .use(html)
    .process(page.content.markdown)
  const contentHtml = processedContent.toString()

  return {
    post: page,
    contentHtml,
  }
}

export const dynamicParams = true
export const revalidate = 3600
