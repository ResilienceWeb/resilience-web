import Layout from '@components/layout'
import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <Layout>
      <h1>
        Oups, wrong link. Go back to the article list{' '}
        <Link href="/news" className="text-green-800 hover:underline">
          here
        </Link>
        .
      </h1>
    </Layout>
  )
}

NotFoundPage.displayName = 'NotFoundPage'
