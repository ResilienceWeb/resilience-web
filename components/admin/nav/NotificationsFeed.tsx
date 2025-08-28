'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { Button } from '@components/ui/button'
import {
  Popover as PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from '@components/ui/popover'
import useNotifications from '@hooks/notifications/useNotifications'

const NotificationsFeed = () => {
  const { items, isPending, isError, error, unreadCount } = useNotifications()
  const router = useRouter()
  const [open, setOpen] = useState(false)

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
                : 'Failed to load notifications'}
            </div>
          ) : items?.length === 0 ? (
            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((notification) => (
                <li
                  key={notification.id}
                  className={
                    'rounded-md border p-3 text-sm ' +
                    (notification.link
                      ? 'cursor-pointer hover:bg-gray-50 focus-within:bg-gray-50'
                      : '')
                  }
                  onClick={() => {
                    if (!notification.link) return
                    setOpen(false)
                    const link = notification.link
                    if (/^https?:\/\//i.test(link)) {
                      window.open(link, '_blank', 'noopener')
                    } else {
                      router.push(link)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (!notification.link) return
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setOpen(false)
                      const link = notification.link
                      if (/^https?:\/\//i.test(link)) {
                        window.open(link, '_blank', 'noopener')
                      } else {
                        router.push(link)
                      }
                    }
                  }}
                  role={notification.link ? 'button' : undefined}
                  tabIndex={notification.link ? 0 : -1}
                  aria-label={
                    notification.link ? `Open ${notification.title}` : undefined
                  }
                >
                  <div className="flex items-start gap-2">
                    <span
                      aria-hidden
                      className={
                        'mt-1 inline-block h-2 w-2 rounded-full ' +
                        (notification.severity === 'critical'
                          ? 'bg-red-500'
                          : notification.severity === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500')
                      }
                    />
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
                      {notification.createdAt && (
                        <span className="flex justify-end text-xs text-gray-500">
                          {new Intl.DateTimeFormat('en-GB').format(
                            new Date(notification.createdAt),
                          )}
                        </span>
                      )}
                    </div>
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
