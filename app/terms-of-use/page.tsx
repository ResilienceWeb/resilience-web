import { getStaticPage } from '@/lib/static-page'
import StaticPage from '@components/static-page'

export const metadata = {
  title: 'Terms of Use | Resilience Web',
  description:
    'The terms that apply when you use or contribute to Resilience Web.',
  openGraph: {
    title: 'Terms of Use | Resilience Web',
    description:
      'The terms that apply when you use or contribute to Resilience Web.',
    url: 'https://www.resilienceweb.org.uk/terms-of-use',
  },
  alternates: {
    canonical: 'https://www.resilienceweb.org.uk/terms-of-use',
  },
}

export default async function TermsOfUsePage() {
  const { title, contentHtml } = await getStaticPage('terms-of-use')

  return <StaticPage title={title} contentHtml={contentHtml} />
}

export const revalidate = 3600
