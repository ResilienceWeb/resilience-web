import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { remark } from 'remark'
import html from 'remark-html'
import {
  isBuildTime,
  initializeNewsBuildCache,
  getNewsPostFromCache,
} from '../../../lib/build-cache'
import { getHygraphClient } from '../../../lib/hygraph'
import NewsItem from './NewsItem'

const POST_FIELDS = `
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
  }`

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
    alternates: {
      canonical: `https://www.resilienceweb.org.uk/news/${params.slug}`,
    },
  }
}

export async function generateStaticParams() {
  const graphcms = getHygraphClient()

  // Fetch full post data (not just slugs) and seed the build cache with it, so the
  // per-page render and generateMetadata() read posts from memory instead of each
  // issuing its own Hygraph request. Together these collapse the build down to this
  // single bulk request and avoid the concurrent-request bursts that were triggering
  // HTTP 429 rate limiting. (graphql-request POSTs aren't deduped by Next's fetch
  // cache, so the cache is what makes the bulk fetch pay off.)
  const { pages } = await graphcms.request<{ pages: any[] }>(`{
    pages {
      ${POST_FIELDS}
    }
  }`)

  initializeNewsBuildCache(pages)

  return pages.map(({ slug }) => ({
    slug,
  }))
}

async function getNewsItem({ slug }): Promise<any> {
  let page = isBuildTime() ? getNewsPostFromCache(slug) : null

  if (!page) {
    const graphcms = getHygraphClient()
    const response = await graphcms.request<{ page: any }>(
      `
      query NewsPostQuery($slug: String!){
        page(where: {slug: $slug}) {
          ${POST_FIELDS}
        }
      }`,
      {
        slug: slug,
      },
    )
    page = response.page
  }

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
export const revalidate = 7200
