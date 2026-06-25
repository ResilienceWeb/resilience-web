'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { AiOutlineLoading } from 'react-icons/ai'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import * as z from 'zod'
import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form'
import { Input } from '@components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Textarea } from '@components/ui/textarea'
import {
  useCreateNotification,
  useUpdateNotification,
  type AdminNotification,
  type NotificationPayload,
} from '@hooks/notifications/useAdminNotifications'

const formSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(140),
    body: z.string().trim().min(1, 'Body is required').max(2000),
    url: z
      .string()
      .trim()
      .url('Must be a valid URL (including https://)')
      .optional()
      .or(z.literal('')),
    urlLabel: z.string().trim().max(60).optional().or(z.literal('')),
    severity: z.enum(['info', 'warning', 'critical']),
    publishAt: z.string().optional().or(z.literal('')),
    expiresAt: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) =>
      !data.publishAt ||
      !data.expiresAt ||
      new Date(data.expiresAt).getTime() > new Date(data.publishAt).getTime(),
    { message: 'Expiry must be after the publish date', path: ['expiresAt'] },
  )

type FormValues = z.infer<typeof formSchema>

// Converts an ISO string to the value a datetime-local input expects.
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`
}

function toIso(local: string | undefined): string | null {
  if (!local) return null
  return new Date(local).toISOString()
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  notification?: AdminNotification | null
}

export default function NotificationFormDialog({
  open,
  onOpenChange,
  notification,
}: Props) {
  const isEditing = Boolean(notification)
  const createMutation = useCreateNotification()
  const updateMutation = useUpdateNotification()
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      body: '',
      url: '',
      urlLabel: '',
      severity: 'info',
      publishAt: '',
      expiresAt: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        title: notification?.title ?? '',
        body: notification?.body ?? '',
        url: notification?.url ?? '',
        urlLabel: notification?.urlLabel ?? '',
        severity: notification?.severity ?? 'info',
        publishAt: toLocalInput(notification?.publishAt),
        expiresAt: toLocalInput(notification?.expiresAt),
      })
    }
  }, [open, notification, form])

  const onSubmit = (data: FormValues) => {
    const payload: NotificationPayload = {
      title: data.title,
      body: data.body,
      url: data.url || undefined,
      urlLabel: data.urlLabel || undefined,
      severity: data.severity,
      audience: 'ALL',
      publishAt: toIso(data.publishAt),
      expiresAt: toIso(data.expiresAt),
    }

    const onSuccess = () => {
      toast.success(
        isEditing ? 'Notification updated' : 'Notification sent to everyone',
      )
      onOpenChange(false)
    }
    const onError = (e: unknown) =>
      toast.error(e instanceof Error ? e.message : 'Something went wrong')

    if (isEditing && notification) {
      updateMutation.mutate(
        { id: notification.id, ...payload },
        { onSuccess, onError },
      )
    } else {
      createMutation.mutate(payload, { onSuccess, onError })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit notification' : 'New notification'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Editing wording or the link will not reset who has already seen it.'
              : 'This will be shown to everyone who logs into the dashboard.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="What's new?" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Tell people what's happening."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="urlLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link label (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Learn more" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="publishAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publish at (optional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>Leave blank to show now.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expires at (optional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>Auto-hides after this.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <AiOutlineLoading className="animate-spin" />}
                {isEditing ? 'Save changes' : 'Send notification'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
