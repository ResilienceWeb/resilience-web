'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowUpRight, Bell, Check } from 'lucide-react'
import { cn } from '@components/lib/utils'
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

const dateFormatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' })

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
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : 'Notifications'
          }
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-96 max-w-[calc(100vw-2rem)] overflow-hidden p-0"
      >
        <header className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-medium text-primary">
              {unreadCount} new
            </span>
          )}
        </header>

        <div className="max-h-[24rem] overflow-y-auto overscroll-contain">
          {isPending ? (
            <ul className="divide-y divide-border">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex flex-col gap-2 px-4 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="h-3.5 w-1/2 animate-pulse rounded bg-muted" />
                    <span className="h-3 w-12 animate-pulse rounded bg-muted" />
                  </div>
                  <span className="h-3 w-4/5 animate-pulse rounded bg-muted" />
                </li>
              ))}
            </ul>
          ) : isError ? (
            <div className="px-4 py-8 text-center text-xs text-red-600">
              {error instanceof Error
                ? error.message
                : "We couldn't load your notifications. Please try again."}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Check className="h-5 w-5" />
              </span>
              <p className="text-sm font-medium">You&apos;re all caught up</p>
              <p className="text-xs text-muted-foreground">
                New announcements will show up here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((notification) => {
                const isLink = Boolean(notification.url)
                const isExternal =
                  !!notification.url && /^https?:\/\//i.test(notification.url)
                const LinkIcon = isExternal ? ArrowUpRight : ArrowRight
                return (
                  <li
                    key={notification.id}
                    className={cn(
                      'group px-4 py-3.5 transition-colors',
                      isLink &&
                        'cursor-pointer hover:bg-accent focus-visible:bg-accent focus-visible:outline-none',
                    )}
                    onClick={() => handleActivate(notification)}
                    onKeyDown={(e) => {
                      if (!isLink) return
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleActivate(notification)
                      }
                    }}
                    role={isLink ? 'button' : undefined}
                    tabIndex={isLink ? 0 : undefined}
                    aria-label={
                      isLink ? `Open ${notification.title}` : undefined
                    }
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-medium leading-snug text-foreground">
                        {notification.title}
                      </p>
                      <time
                        dateTime={notification.createdAt}
                        className="shrink-0 text-xs tabular-nums text-muted-foreground"
                      >
                        {dateFormatter.format(new Date(notification.createdAt))}
                      </time>
                    </div>

                    {notification.body && (
                      <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-[13px] leading-relaxed text-muted-foreground">
                        {notification.body}
                      </p>
                    )}

                    {isLink && (
                      <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-primary">
                        {notification.urlLabel || 'Learn more'}
                        <LinkIcon className="h-3.5 w-3.5 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" />
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </PopoverRoot>
  )
}

export default NotificationsFeed
