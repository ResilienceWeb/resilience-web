import { GraphQLClient } from 'graphql-request'
import { remark } from 'remark'
import html from 'remark-html'
import About from './About'

export const metadata = {
  title: 'About | Resilience Web',
  description:
    'A platform that weaves together groups working on social and environmental change in order to foster collaboration and fuel social change.',
  openGraph: {
    title: 'About | Resilience Web',
    description:
      'A platform that weaves together groups working on social and environmental change in order to foster collaboration and fuel social change.',
    url: 'https://resilienceweb.org.uk/about',
  },
}

export default async function AboutPage() {
  const { page, contentHtml } = await getData()

  return <About page={page} contentHtml={contentHtml} />
}

async function getData(): Promise<any> {
  const graphcms = new GraphQLClient(process.env.GRAPHCMS_URL)

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

  const processedContent = await remark()
    .use(html)
    .process(page.content.markdown)
  const contentHtml = processedContent.toString()

  return {
    page,
    contentHtml,
  }
}

export const dynamicParams = true
export const revalidate = 3600
