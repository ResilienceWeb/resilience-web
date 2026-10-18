import { getStaticPage } from '@/lib/static-page'
import StaticPage from '@components/static-page'

export const metadata = {
  title: 'Privacy Policy | Resilience Web',
  description:
    'How Resilience Web collects, uses and protects your personal data.',
  openGraph: {
    title: 'Privacy Policy | Resilience Web',
    description:
      'How Resilience Web collects, uses and protects your personal data.',
    url: 'https://www.resilienceweb.org.uk/privacy-policy',
  },
  alternates: {
    canonical: 'https://www.resilienceweb.org.uk/privacy-policy',
  },
}

export default async function PrivacyPolicyPage() {
  const { title, contentHtml } = await getStaticPage('privacy-policy')

  return <StaticPage title={title} contentHtml={contentHtml} />
}

export const revalidate = 3600
