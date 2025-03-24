'use client'
import { useCallback, useMemo, use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Spinner } from '@components/ui/spinner'
import PermissionsTable from '@components/admin/permissions-table'
import useWeb from '@hooks/webs/useWeb'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import { HiArrowLeft } from 'react-icons/hi'
import { HiOutlineClipboard, HiOutlineClipboardCheck } from 'react-icons/hi'
import usePublishWeb from '@hooks/webs/usePublishWeb'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@components/ui/accordion'

export default function WebOverviewPage({ params }) {
  // @ts-ignore
  const { webSlug } = use(params)
  const router = useRouter()
  const { web, isPending: isLoadingWeb } = useWeb({
    webSlug,
    withAdminInfo: true,
  })
  const { mutate: publishWeb, isPending: isPublishingWeb } =
    usePublishWeb(webSlug)
  const [copied, setCopied] = useState(false)

  const goBack = useCallback(() => {
    router.back()
  }, [router])

  const decoratedOwnerships = useMemo(() => {
    if (!web || !web.ownerships) {
      return []
    }

    return web.ownerships
      .filter((ownership) => !ownership.user?.admin)
      .map((ownership) => ({ ...ownership, owner: true }))
  }, [web])

  const permissionsForCurrentWebWithoutOwners = useMemo(() => {
    if (!web || !web.ownerships || !web.permissions) {
      return []
    }

    const filteredPermissions = []
    const ownershipsEmails = web.ownerships?.map((o) => o.user?.email)
    web.permissions?.map((permission) => {
      if (!ownershipsEmails?.includes(permission.user.email)) {
        // @ts-ignore
        filteredPermissions.push(permission)
      }
    })

    return filteredPermissions
  }, [web])

  const mailToEmails = useMemo(() => {
    if (!web || !web.ownerships || !web.permissions) {
      return []
    }
    const ownershipsEmails = web.ownerships?.map((o) => o.user?.email)
    const permissionsEmails = web.permissions
      ?.map((p) => (p.user?.emailVerified ? p.user?.email : undefined))
      .filter(Boolean)

    return [...ownershipsEmails, ...permissionsEmails].join(',')
  }, [web])

  const listingEmails = useMemo(() => {
    if (!web || !web.listings) {
      return []
    }

    // Extract unique emails from listings
    const emails = web.listings
      .map((listing) => listing.email)
      .filter(Boolean) // Remove null/undefined values
      .filter((email, index, self) => self.indexOf(email) === index) // Remove duplicates
      .sort() // Sort alphabetically

    return emails
  }, [web])

  const listingStats = useMemo(() => {
    if (!web || !web.listings || web.listings.length === 0) {
      return null
    }

    const totalListings = web.listings.length
    const withImages = web.listings.filter((listing) => listing.image).length
    const withLocation = web.listings.filter(
      (listing) => listing.location?.latitude && listing.location?.longitude,
    ).length

    return {
      totalListings,
      withImages,
      withLocation,
      withImagesPercent: Math.round((withImages / totalListings) * 100),
      withLocationPercent: Math.round((withLocation / totalListings) * 100),
    }
  }, [web])

  const handleCopyEmails = useCallback(() => {
    const emailsText = listingEmails.join(';')
    navigator.clipboard
      .writeText(emailsText)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        return true
      })
      .catch((error) => {
        console.error('Failed to copy emails:', error)
        return false
      })
  }, [listingEmails])

  if (isLoadingWeb) {
    return <Spinner />
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        className="mb-2 ml-2 flex items-center gap-2 text-gray-700 hover:text-gray-900"
        onClick={goBack}
      >
        <HiArrowLeft className="h-4 w-4" />
        Back to main list
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {web.title} Resilience Web
        </h1>
        {web.published ? (
          <Badge className="text-lg">Published</Badge>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Badge variant="secondary" className="text-lg">
              Private
            </Badge>
            <Button onClick={() => publishWeb()} disabled={isPublishingWeb}>
              {isPublishingWeb ? <Spinner /> : null}
              Publish now 🚀
            </Button>
          </div>
        )}
      </div>

      <a
        href={`${PROTOCOL}://${web.slug}.${REMOTE_HOSTNAME}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary font-semibold hover:underline"
      >
        {`${web.slug}.${REMOTE_HOSTNAME}`}
      </a>

      <p className="text-muted-foreground">
        <span className="text-foreground font-semibold">
          {web.listings.length}
        </span>{' '}
        listings
      </p>

      {listingStats && (
        <div className="mt-4 flex flex-col gap-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded border border-gray-200 bg-white p-3">
              <div className="text-lg font-medium">Listings with images</div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">
                  {listingStats.withImagesPercent}%
                </span>
                <span className="text-muted-foreground text-sm">
                  ({listingStats.withImages} of {listingStats.totalListings})
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="bg-primary h-full"
                  style={{ width: `${listingStats.withImagesPercent}%` }}
                ></div>
              </div>
            </div>
            <div className="rounded border border-gray-200 bg-white p-3">
              <div className="text-lg font-medium">Listings with locations</div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">
                  {listingStats.withLocationPercent}%
                </span>
                <span className="text-muted-foreground text-sm">
                  ({listingStats.withLocation} of {listingStats.totalListings})
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="bg-primary h-full"
                  style={{ width: `${listingStats.withLocationPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {listingEmails.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="contact-emails">
              <AccordionTrigger className="py-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">Contact emails</h2>
                  <Badge variant="outline" className="ml-2">
                    {listingEmails.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="mt-2 rounded-lg bg-gray-50 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-muted-foreground text-sm">
                      In case we want to send an email to all the contact emails
                      from a particular web
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyEmails}
                      className="flex items-center gap-1"
                    >
                      {copied ? (
                        <>
                          <HiOutlineClipboardCheck className="h-4 w-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <HiOutlineClipboard className="h-4 w-4" />
                          <span>Copy to clipboard</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="rounded border border-gray-200 bg-white p-2 text-sm break-all">
                    {listingEmails.join('; ')}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {(web.permissions?.length > 0 || decoratedOwnerships?.length > 0) && (
        <div className="mt-4 flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Team</h2>
          <PermissionsTable
            permissions={[
              ...decoratedOwnerships,
              ...permissionsForCurrentWebWithoutOwners,
            ]}
          />
          <Button variant="outline" asChild className="mb-8 self-start">
            <a href={`mailto:${mailToEmails}`}>
              Send email to owners and editors
            </a>
          </Button>
        </div>
      )}
    </div>
  )
}
