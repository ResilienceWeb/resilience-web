'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { Button } from '@components/ui/button'
import {
  Popover as PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from '@components/ui/popover'
import useMarkNotificationsSeen from '@hooks/notifications/useMarkNotificationsSeen'
import useNotifications, {
  type NotificationItem,
} from '@hooks/notifications/useNotifications'
import useTrackNotificationClick from '@hooks/notifications/useTrackNotificationClick'

const NotificationsFeed = () => {
  const { items, isPending, isError, error, unreadCount } = useNotifications()
  const { markSeen } = useMarkNotificationsSeen()
  const { trackClick } = useTrackNotificationClick()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  // When the panel opens, mark every currently-visible unread notification as
  // seen (this is what powers the "seen" stat in the admin dashboard).
  useEffect(() => {
    if (!open) return
    const unseenIds = items.filter((n) => !n.seenAt).map((n) => n.id)
    if (unseenIds.length > 0) {
      markSeen(unseenIds)
    }
  }, [open, items, markSeen])

  const handleActivate = (notification: NotificationItem) => {
    if (!notification.url) return
    trackClick(notification.id)
    setOpen(false)
    const url = notification.url
    if (/^https?:\/\//i.test(url)) {
      window.open(url, '_blank', 'noopener')
    } else {
      router.push(url)
    }
  }

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Open notifications"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="max-h-80 overflow-auto p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold">Notifications</h3>
          </div>
          {isPending ? (
            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
              Loading...
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-6 text-xs text-red-600">
              {error instanceof Error
                ? error.message
                : "We couldn't load your notifications. Please try again."}
            </div>
          ) : items?.length === 0 ? (
            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((notification) => (
                <li
                  key={notification.id}
                  className={
                    'rounded-md border p-3 text-sm ' +
                    (notification.url
                      ? 'cursor-pointer hover:bg-gray-50 focus-within:bg-gray-50'
                      : '')
                  }
                  onClick={() => handleActivate(notification)}
                  onKeyDown={(e) => {
                    if (!notification.url) return
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleActivate(notification)
                    }
                  }}
                  role={notification.url ? 'button' : undefined}
                  tabIndex={notification.url ? 0 : -1}
                  aria-label={
                    notification.url ? `Open ${notification.title}` : undefined
                  }
                >
                  <div className="min-w-0 flex-1">
                    <div>
                      <span className="truncate font-medium">
                        {notification.title}
                      </span>
                    </div>
                    {notification.body && (
                      <p className="mt-1 whitespace-pre-wrap text-[13px] leading-snug text-gray-600">
                        {notification.body}
                      </p>
                    )}
                    {notification.url && (
                      <span className="mt-1 inline-block text-[13px] font-medium text-blue-600">
                        {notification.urlLabel || 'Learn more'}
                      </span>
                    )}
                    {notification.createdAt && (
                      <span className="flex justify-end text-xs text-gray-500">
                        {new Intl.DateTimeFormat('en-GB', {
                          dateStyle: 'medium',
                        }).format(new Date(notification.createdAt))}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </PopoverRoot>
  )
}

export default NotificationsFeed
