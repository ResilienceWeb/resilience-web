'use client'
import { useCallback, useMemo, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Spinner } from '@components/ui/spinner'
import PermissionsTable from '@components/admin/permissions-table'
import useWeb from '@hooks/webs/useWeb'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import { HiArrowLeft } from 'react-icons/hi'
import usePublishWeb from '@hooks/webs/usePublishWeb'

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

  if (isLoadingWeb) {
    return <Spinner />
  }

  return (
    <div className="space-y-6">
      <button
        className="mb-2 ml-2 flex items-center gap-2 text-gray-700 hover:text-gray-900"
        onClick={goBack}
      >
        <HiArrowLeft className="h-4 w-4" />
        Back to main list
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{web.title}</h1>
        {web.published ? (
          <Badge className="text-lg">Published</Badge>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Badge variant="secondary" className="text-lg">
              Private
            </Badge>
            <Button onClick={() => publishWeb()} disabled={isPublishingWeb}>
              {isPublishingWeb ? <Spinner /> : null}
              Publish
            </Button>
          </div>
        )}
      </div>

      <a
        href={`${PROTOCOL}://${web.slug}.${REMOTE_HOSTNAME}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        {`${web.slug}.${REMOTE_HOSTNAME}`}
      </a>

      <p className="text-muted-foreground">
        <span className="font-medium text-foreground">
          {web.listings.length}
        </span>{' '}
        listings
      </p>

      {(web.permissions?.length > 0 || decoratedOwnerships?.length > 0) && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Team</h2>
          <PermissionsTable
            permissions={[
              ...decoratedOwnerships,
              ...permissionsForCurrentWebWithoutOwners,
            ]}
          />
          <Button asChild className="mb-8">
            <a href={`mailto:${mailToEmails}`}>
              Send email to owners and editors
            </a>
          </Button>
        </div>
      )}
    </div>
  )
}
