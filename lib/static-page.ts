import { notFound } from 'next/navigation'
import { remark } from 'remark'
import html from 'remark-html'
import { getHygraphClient } from './hygraph'

export async function getStaticPage(slug: string) {
  const { staticPage } = await getHygraphClient().request<{
    staticPage: { title: string; content: { markdown: string } } | null
  }>(
    `
    query StaticPageQuery($slug: String!) {
      staticPage(where: { slug: $slug }) {
        title
        content {
          markdown
        }
      }
    }`,
    { slug },
  )

  if (!staticPage) notFound()

  const processedContent = await remark()
    .use(html)
    .process(staticPage.content.markdown)

  return { title: staticPage.title, contentHtml: processedContent.toString() }
}
