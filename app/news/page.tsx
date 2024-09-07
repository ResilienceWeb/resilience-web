import { GraphQLClient } from 'graphql-request'
import News from './News'

export const metadata = {
  title: 'News | Resilience Web',
  description: 'News & updates from the Resilience Web team',
  openGraph: {
    title: 'News | Resilience Web',
  },
}

export default async function NewsPage() {
  const { posts } = await getData()

  return <News posts={posts} />
}

async function getData(): Promise<any> {
  const graphcms = new GraphQLClient(process.env.GRAPHCMS_URL)

  const { pages } = await graphcms.request<{ pages: [] }>(`
    {
      pages(where: { displayInBlogSection: true }, orderBy: date_DESC) {
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
      }
    }`)

  return {
    posts: pages,
  }
}
