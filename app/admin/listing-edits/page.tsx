'use client'

import { PiCheckCircleBold, PiClockBold } from 'react-icons/pi'
import Faq from '@components/faq'
import { Badge } from '@components/ui/badge'
import { Spinner } from '@components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table'
import useListingEditsForWeb from '@hooks/listings/useListingEditsForWeb'
import { useAppContext } from '@store/hooks'

const faqs = [
  {
    question: 'Where do suggested edits come from?',
    answer:
      'Anyone can suggest changes to a listing using the Edit listing button on its public page. The suggestions are listed here for your team to review.',
  },
  {
    question: 'How do I review a suggested edit?',
    answer:
      'Go to the Listings page and press the "View suggested edit" button on the listing. You can compare the suggested changes with the current version, then accept or reject them.',
  },
  {
    question: 'Why can a listing only have one suggested edit at a time?',
    answer:
      'A listing can only have one suggestion in progress at a time, to avoid conflicting changes. Once you accept or reject the pending suggestion, people can suggest changes again.',
  },
  {
    question: 'Is the person who suggested the edit notified?',
    answer:
      'Yes — if you accept their changes, they receive an email confirmation letting them know.',
  },
]

export default function ListingEditsPage() {
  const { selectedWebSlug } = useAppContext()
  const { listingEdits, isPending, isError } = useListingEditsForWeb(
    selectedWebSlug,
    true,
  )

  if (isPending) {
    return <Spinner />
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Suggested Edits</h1>
        <p className="text-red-600">Failed to load listing edits</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Suggested Edits</h1>
          <p className="mt-2 text-sm text-gray-600">
            Listing edits from the community
          </p>
        </div>
      </div>

      {!listingEdits || listingEdits.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <p className="text-muted-foreground text-center">
            No suggested edits yet
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead>Submitted by</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listingEdits.map((edit) => {
                return (
                  <TableRow key={edit.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="font-medium">{edit.listing?.title}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{edit.user?.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {edit.user?.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {Intl.DateTimeFormat('en-GB', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(new Date(edit.createdAt))}
                      </span>
                    </TableCell>
                    <TableCell>
                      {edit.accepted ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          <PiCheckCircleBold className="h-4 w-4" />
                          Accepted
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          <PiClockBold className="h-4 w-4" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-8 mb-8">
        <h3 className="mb-4 text-2xl font-bold">FAQs</h3>
        <Faq content={faqs} />
      </div>
    </div>
  )
}
