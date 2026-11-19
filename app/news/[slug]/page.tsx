import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { remark } from 'remark'
import html from 'remark-html'
import { isBuildTime } from '../../../lib/build-cache'
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

// Next renders pages in separate worker processes, so this is memoised per process:
// each worker makes one bulk request instead of one per page and per generateMetadata(),
// which burst past Hygraph's rate limit (HTTP 429). graphql-request POSTs aren't
// deduped by Next's fetch cache, so nothing else collapses them.
let allPosts: Promise<Map<string, any>> | null = null

function getAllPosts(): Promise<Map<string, any>> {
  allPosts ??= getHygraphClient()
    .request<{ pages: any[] }>(
      `{
        pages {
          ${POST_FIELDS}
        }
      }`,
    )
    .then(({ pages }) => new Map(pages.map((page) => [page.slug, page])))
    .catch((error) => {
      allPosts = null
      throw error
    })

  return allPosts
}

export async function generateStaticParams() {
  const posts = await getAllPosts()

  return [...posts.keys()].map((slug) => ({ slug }))
}

async function getNewsItem({ slug }): Promise<any> {
  let page = isBuildTime() ? (await getAllPosts()).get(slug) : null

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
