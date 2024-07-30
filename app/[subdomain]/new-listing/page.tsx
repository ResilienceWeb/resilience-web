import type { Metadata } from 'next'
import NewListing from './NewListing'

export const metadata: Metadata = {
  title: 'New Listing | Resilience Web',
  openGraph: {
    title: 'New Listing | Resilience Web',
  },
}

export default function NewListingPage() {
  return <NewListing />
}
