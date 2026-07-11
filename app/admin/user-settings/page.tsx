'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { AiOutlineLoading } from 'react-icons/ai'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import * as z from 'zod'
import { useSession } from '@auth-client'
import { getWebUrl } from '@helpers/config'
import { Button } from '@components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card'
import { Checkbox } from '@components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Spinner } from '@components/ui/spinner'
import useCurrentUser from '@hooks/user/useCurrentUser'
import useUpdateUser from '@hooks/user/useUpdateUser'
import useMyWebAccess from '@hooks/web-access/useMyWebAccess'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subscribed: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

export default function UserSettingsPage() {
  const { updateUser, isPending, isSuccess } = useUpdateUser()
  const { data: session } = useSession()
  const { user } = useCurrentUser()
  const {
    ownedWebs,
    editableWebs,
    isPending: isLoadingWebAccess,
  } = useMyWebAccess()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name ?? '',
      subscribed: user?.subscribed ?? false,
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name ?? '',
        subscribed: user.subscribed ?? false,
      })
    }
  }, [user, form])

  useEffect(() => {
    if (isSuccess) {
      toast.success('User settings updated successfully')
    }
  }, [isSuccess])

  const onSubmit = (data: FormValues) => {
    updateUser({ name: data.name, subscribed: data.subscribed })
  }

  if (!user || !session) {
    return <Spinner />
  }

  return (
    <div className="flex flex-col gap-4 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>User settings</CardTitle>
        </CardHeader>
        <CardContent className="max-w-md">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col items-start gap-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-sm font-semibold">
                      Your name
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="text-sm shadow-xs" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subscribed"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="subscribed-checkbox"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <label
                              htmlFor="subscribed-checkbox"
                              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              Subscribed to the Resilience Web mailing list
                            </label>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          Check the box if you'd like to receive our newsletter
                          with news, platform updates and more. You can
                          unsubscribe anytime.
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={
                  !form.formState.isDirty || form.formState.isSubmitting
                }
              >
                {isPending && <AiOutlineLoading className="animate-spin" />}{' '}
                Update
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Webs</CardTitle>
          <CardDescription>Webs you can access and manage</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingWebAccess ? (
            <Spinner />
          ) : (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Owner of
                  {ownedWebs && ownedWebs.length > 0 && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {ownedWebs.length}
                    </span>
                  )}
                </h3>
                {ownedWebs && ownedWebs.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {ownedWebs.map((web) => (
                      <li
                        key={web.id}
                        className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent/50"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{web.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {getWebUrl(web.slug).replace(/^https?:\/\//, '')}
                          </p>
                        </div>
                        <Link href={getWebUrl(web.slug)} target="_blank">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    You are not an owner of any webs yet.
                  </p>
                )}
              </div>

              <div>
                <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Editor of
                  {editableWebs && editableWebs.length > 0 && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {editableWebs.length}
                    </span>
                  )}
                </h3>
                {editableWebs && editableWebs.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {editableWebs.map((web) => (
                      <li
                        key={web.id}
                        className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent/50"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{web.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {getWebUrl(web.slug).replace(/^https?:\/\//, '')}
                          </p>
                        </div>
                        <Link href={getWebUrl(web.slug)} target="_blank">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    You don't have edit permissions for any webs.
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
