import Link from 'next/link'
import Layout from '@components/layout'

export default function NotFoundPage() {
  return (
    <Layout>
      <h1>
        Oops, wrong link. Go back to the article list{' '}
        <Link href="/news" className="text-green-800 hover:underline">
          here
        </Link>
        .
      </h1>
    </Layout>
  )
}

NotFoundPage.displayName = 'NotFoundPage'
