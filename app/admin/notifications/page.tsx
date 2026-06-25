'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from '@auth-client'
import NotificationFormDialog from '@components/admin/notifications/NotificationFormDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@components/ui/alert-dialog'
import { Button } from '@components/ui/button'
import { Spinner } from '@components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table'
import {
  useAdminNotifications,
  useDeleteNotification,
  type AdminNotification,
} from '@hooks/notifications/useAdminNotifications'

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
})

function statusLabel(n: AdminNotification): string {
  const now = Date.now()
  if (n.publishAt && new Date(n.publishAt).getTime() > now) return 'Scheduled'
  if (n.expiresAt && new Date(n.expiresAt).getTime() <= now) return 'Expired'
  return 'Live'
}

export default function NotificationsAdminPage() {
  const { data: session } = useSession()
  const { notifications, isPending, isError } = useAdminNotifications()
  const deleteMutation = useDeleteNotification()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminNotification | null>(null)
  const [deleting, setDeleting] = useState<AdminNotification | null>(null)

  const isAdmin = session?.user?.role === 'admin'

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (n: AdminNotification) => {
    setEditing(n)
    setFormOpen(true)
  }

  const confirmDelete = () => {
    if (!deleting) return
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.success('Notification deleted')
        setDeleting(null)
      },
      onError: (e) =>
        toast.error(e instanceof Error ? e.message : 'Unable to delete'),
    })
  }

  if (!isAdmin) {
    return (
      <p className="text-muted-foreground">
        You don&apos;t have permission to view this page.
      </p>
    )
  }

  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Broadcast a message to everyone who logs into the dashboard, and see
            how many people saw and clicked it.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New notification
        </Button>
      </div>

      {isPending ? (
        <Spinner />
      ) : isError ? (
        <p className="text-sm text-red-600">
          We couldn&apos;t load notifications. Please try again.
        </p>
      ) : notifications.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          No notifications yet. Create one to get started.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notification</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Seen</TableHead>
                <TableHead className="text-right">Clicked</TableHead>
                <TableHead className="text-right">Click Through Rate</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((n) => {
                const ctr =
                  n.seenCount > 0
                    ? `${Math.round((n.clickedCount / n.seenCount) * 100)}%`
                    : '—'
                return (
                  <TableRow key={n.id}>
                    <TableCell className="max-w-xs">
                      <span className="truncate font-medium">{n.title}</span>
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {n.body}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{statusLabel(n)}</span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {n.seenCount} / {n.audienceSize}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {n.clickedCount}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {ctr}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {dateFormatter.format(new Date(n.createdAt))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit"
                          onClick={() => openEdit(n)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete"
                          onClick={() => setDeleting(n)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <NotificationFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        notification={editing}
      />

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this notification?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleting?.title}&rdquo; will be removed for everyone,
              along with its seen and click records. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
