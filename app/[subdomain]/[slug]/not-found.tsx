import Link from 'next/link'
import Layout from '@components/layout'

export default function NotFoundPage() {
  return (
    <Layout>
      <h1>
        We couldn&apos;t find a listing at that address. Head back to the Web{' '}
        <Link href="/" className="text-green-800 hover:underline">
          here
        </Link>
        .
      </h1>
    </Layout>
  )
}

NotFoundPage.displayName = 'NotFoundPage'
