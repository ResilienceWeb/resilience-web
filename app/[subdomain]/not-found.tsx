import Layout from '@components/layout'
import Link from 'next/link'
import { REMOTE_URL } from '@helpers/config'

export default function NotFoundPage() {
  return (
    <Layout>
      <h1>
        Oups, no Web found with that url. Go back to the homepage{' '}
        <Link href={REMOTE_URL} className="text-green-800 hover:underline">
          here
        </Link>
        .
      </h1>
    </Layout>
  )
}

NotFoundPage.displayName = 'NotFoundPage'
