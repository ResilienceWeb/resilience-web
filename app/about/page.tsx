import { getStaticPage } from '@/lib/static-page'
import StaticPage from '@components/static-page'

export const metadata = {
  title: 'About | Resilience Web',
  description:
    'A platform that weaves together groups working on social and environmental change in order to foster collaboration and fuel social change.',
  openGraph: {
    title: 'About | Resilience Web',
    description:
      'A platform that weaves together groups working on social and environmental change in order to foster collaboration and fuel social change.',
    url: 'https://www.resilienceweb.org.uk/about',
  },
  alternates: {
    canonical: 'https://www.resilienceweb.org.uk/about',
  },
}

export default async function AboutPage() {
  const { title, contentHtml } = await getStaticPage('about')

  return <StaticPage title={title} contentHtml={contentHtml} />
}

export const revalidate = 3600
