import Layout from '@components/layout'
import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <Layout>
      <h1>
        Oups, no listing found with that url. Go back to the Web{' '}
        <Link href="/" className="text-green-800 hover:underline">
          here
        </Link>
        .
      </h1>
    </Layout>
  )
}

NotFoundPage.displayName = 'NotFoundPage'
