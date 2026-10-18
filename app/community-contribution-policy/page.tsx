import { getStaticPage } from '@/lib/static-page'
import StaticPage from '@components/static-page'

export const metadata = {
  title: 'Community Contribution Policy | Resilience Web',
  description:
    'What belongs in a Resilience Web listing, and how to ask for corrections or removals.',
  openGraph: {
    title: 'Community Contribution Policy | Resilience Web',
    description:
      'What belongs in a Resilience Web listing, and how to ask for corrections or removals.',
    url: 'https://www.resilienceweb.org.uk/community-contribution-policy',
  },
  alternates: {
    canonical: 'https://www.resilienceweb.org.uk/community-contribution-policy',
  },
}

export default async function CommunityContributionPolicyPage() {
  const { title, contentHtml } = await getStaticPage(
    'community-contribution-policy',
  )

  return <StaticPage title={title} contentHtml={contentHtml} />
}

export const revalidate = 3600
